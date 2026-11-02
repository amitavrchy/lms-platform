import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CourseStatus,
  EntitlementStatus,
  OrgRole,
  type CourseEntitlement,
} from '@prisma/client';
import Stripe from 'stripe';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CheckoutDto } from './dto/checkout.dto.js';

type CommerceMetadata = {
  userId: string;
  organizationId: string;
  courseId: string;
};

@Injectable()
export class CommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getCourseStatus(courseId: string, user?: AuthUser) {
    const course = await this.findVisibleCourse(courseId, user);
    const entitlement = user
      ? await this.prisma.courseEntitlement.findUnique({
          where: { courseId_userId: { courseId: course.id, userId: user.id } },
        })
      : null;

    return {
      courseId: course.id,
      organizationId: course.organizationId,
      entitled: this.isActive(entitlement),
      entitlement: entitlement
        ? {
            status: entitlement.status,
            source: entitlement.source,
            expiresAt: entitlement.expiresAt,
          }
        : null,
      stripeConfigured: this.isStripeConfigured(),
    };
  }

  async createCheckout(user: AuthUser, dto: CheckoutDto) {
    if (user.role !== OrgRole.LEARNER) {
      throw new ForbiddenException('Checkout is available to learners only');
    }

    const stripe = this.requireStripe();
    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        organizationId: user.orgId,
        status: CourseStatus.PUBLISHED,
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const configuredPriceId = this.config.get<string>('STRIPE_PRICE_ID');
    if (!configuredPriceId) {
      throw new ServiceUnavailableException(
        'Stripe integration is not configured: no price ID is available',
      );
    }
    if (dto.priceId && dto.priceId !== configuredPriceId) {
      throw new BadRequestException(
        'The requested Stripe price is not configured for this course',
      );
    }
    const priceId = configuredPriceId;

    const price = await stripe.prices.retrieve(priceId);
    if (!price.active) throw new BadRequestException('Stripe price is inactive');

    const metadata = this.metadataFor(user, course.id);
    const customerId = await this.findCustomerId(user);
    const mode: Stripe.Checkout.SessionCreateParams.Mode = price.recurring
      ? 'subscription'
      : 'payment';
    const clientOrigin = this.getClientOrigin();

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: price.id, quantity: 1 }],
      client_reference_id: user.id,
      customer: customerId ?? undefined,
      customer_email: customerId ? undefined : user.email,
      metadata,
      ...(mode === 'subscription' ? { subscription_data: { metadata } } : {}),
      success_url: `${clientOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientOrigin}/checkout/cancel`,
    });

    return { id: session.id, url: session.url };
  }

  async handleWebhook(rawBody: Buffer | undefined, signature?: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.isStripeConfigured() || !webhookSecret) {
      throw new ServiceUnavailableException('Stripe webhook integration is not configured');
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe webhook signature or raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.requireStripe().webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return { received: true };
  }

  async createPortalSession(user: AuthUser) {
    const stripe = this.requireStripe();
    const customerId = await this.findCustomerId(user);
    if (!customerId) {
      throw new NotFoundException('No Stripe customer is available for this user');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${this.getClientOrigin()}/billing`,
    });
    return { url: session.url };
  }

  listEntitlements(user: AuthUser) {
    return this.prisma.courseEntitlement.findMany({
      where: { userId: user.id, organizationId: user.orgId },
      select: {
        id: true,
        status: true,
        source: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        course: { select: { id: true, slug: true, title: true, coverUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = this.requireMetadata(session.metadata, session.client_reference_id);
    const paid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required';
    await this.upsertStripeEntitlement(metadata, {
      status: paid ? EntitlementStatus.ACTIVE : EntitlementStatus.CANCELED,
      stripeCustomerId: this.idOf(session.customer),
      stripeSubscriptionId: this.idOf(session.subscription),
      stripeCheckoutSessionId: session.id,
      expiresAt: null,
    });
  }

  private async handleSubscriptionChanged(subscription: Stripe.Subscription) {
    const metadata = this.requireMetadata(subscription.metadata);
    const expiresAt =
      subscription.cancel_at ||
      subscription.items.data[0]?.current_period_end ||
      null;
    await this.upsertStripeEntitlement(metadata, {
      status: this.subscriptionStatus(subscription.status),
      stripeCustomerId: this.idOf(subscription.customer),
      stripeSubscriptionId: subscription.id,
      expiresAt: expiresAt ? new Date(expiresAt * 1000) : null,
    });
  }

  private async upsertStripeEntitlement(
    metadata: CommerceMetadata,
    data: {
      status: EntitlementStatus;
      stripeCustomerId: string | null;
      stripeSubscriptionId?: string | null;
      stripeCheckoutSessionId?: string;
      expiresAt: Date | null;
    },
  ) {
    const [course, membership] = await Promise.all([
      this.prisma.course.findFirst({
        where: { id: metadata.courseId, organizationId: metadata.organizationId },
        select: { id: true },
      }),
      this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: metadata.organizationId,
            userId: metadata.userId,
          },
        },
        select: { userId: true },
      }),
    ]);
    if (!course || !membership) {
      throw new BadRequestException('Stripe event metadata does not match LMS records');
    }

    await this.prisma.courseEntitlement.upsert({
      where: {
        courseId_userId: {
          courseId: metadata.courseId,
          userId: metadata.userId,
        },
      },
      create: {
        organizationId: metadata.organizationId,
        courseId: metadata.courseId,
        userId: metadata.userId,
        source: 'STRIPE',
        ...data,
      },
      update: { source: 'STRIPE', ...data },
    });
  }

  private async findVisibleCourse(courseId: string, user?: AuthUser) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!user && course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }
    if (user && course.organizationId !== user.orgId) {
      throw new ForbiddenException('Cross-organization access denied');
    }
    if (
      user &&
      user.role === OrgRole.LEARNER &&
      course.status !== CourseStatus.PUBLISHED
    ) {
      throw new ForbiddenException('Course is not published');
    }
    return course;
  }

  private requireMetadata(
    metadata: Stripe.Metadata | null,
    referenceUserId?: string | null,
  ): CommerceMetadata {
    const userId = metadata?.userId;
    const organizationId = metadata?.organizationId;
    const courseId = metadata?.courseId;
    if (
      !userId ||
      !organizationId ||
      !courseId ||
      (referenceUserId && referenceUserId !== userId)
    ) {
      throw new BadRequestException('Stripe event is missing valid LMS metadata');
    }
    return { userId, organizationId, courseId };
  }

  private metadataFor(user: AuthUser, courseId: string): CommerceMetadata {
    return {
      userId: user.id,
      organizationId: user.orgId,
      courseId,
    };
  }

  private subscriptionStatus(status: Stripe.Subscription.Status) {
    return status === 'active' || status === 'trialing'
      ? EntitlementStatus.ACTIVE
      : status === 'canceled'
        ? EntitlementStatus.CANCELED
        : EntitlementStatus.EXPIRED;
  }

  private isActive(entitlement: CourseEntitlement | null) {
    return Boolean(
      entitlement &&
        entitlement.status === EntitlementStatus.ACTIVE &&
        (!entitlement.expiresAt || entitlement.expiresAt > new Date()),
    );
  }

  private async findCustomerId(user: AuthUser) {
    const entitlement = await this.prisma.courseEntitlement.findFirst({
      where: {
        userId: user.id,
        organizationId: user.orgId,
        stripeCustomerId: { not: null },
      },
      select: { stripeCustomerId: true },
      orderBy: { updatedAt: 'desc' },
    });
    return entitlement?.stripeCustomerId ?? null;
  }

  private isStripeConfigured() {
    return Boolean(this.config.get<string>('STRIPE_SECRET_KEY'));
  }

  private requireStripe() {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new ServiceUnavailableException('Stripe integration is not configured');
    }
    return new Stripe(secretKey);
  }

  private getClientOrigin() {
    return (this.config.get<string>('CLIENT_ORIGIN') ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
  }

  private idOf(value: string | { id: string } | null) {
    return typeof value === 'string' ? value : value?.id ?? null;
  }
}
