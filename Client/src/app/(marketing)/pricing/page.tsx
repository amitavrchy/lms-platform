import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
const options = [
  {
    icon: BookOpen,
    name: "For the curious",
    title: "Find your next chapter.",
    description:
      "A focused home for your learning, from the first lesson to the final checkpoint.",
    features: [
      "Explore the published course collection",
      "Self-paced lessons and personal study notes",
      "Quizzes, feedback, and progress tracking",
      "Course discussions and earned certificates",
    ],
    cta: "Start learning free",
    href: "/register",
  },
  {
    icon: GraduationCap,
    name: "For educators",
    title: "Make your knowledge go further.",
    description:
      "Create a classroom with structure, purpose, and space for your learners to grow.",
    features: [
      "Create, organize, and publish courses",
      "Build quizzes and manage your curriculum",
      "Schedule cohorts and live sessions",
      "Review completion and assessment analytics",
    ],
    cta: "Create your academy",
    href: "/register?mode=academy",
    highlight: true,
  },
  {
    icon: Users,
    name: "For learning teams",
    title: "Bring everyone along.",
    description:
      "Connect your people with the right courses and a shared view of their progress.",
    features: [
      "Manage organization members and roles",
      "Assign courses to individual learners",
      "Track learning and course completion",
      "Export reports for your teaching team",
    ],
    cta: "Build your workspace",
    href: "/register?mode=academy",
  },
];
export default function PricingPage() {
  return (
    <>
      <section className="site-container section-space">
        <p className="eyebrow">A CLASSROOM WITH ROOM TO GROW</p>
        <h1 className="catalog-title">
          Good learning starts
          <br />
          with the right space.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-[var(--muted)]">
          Learn something new. Share what you know. Give your team a clear way
          forward. Choose the workspace that fits your next chapter.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {options.map(({ icon: Icon, ...o }) => (
            <article
              key={o.name}
              className={`relative flex flex-col rounded-xl border p-7 sm:p-9 ${o.highlight ? "border-[#426248] bg-[#ecf0e4]" : "bg-white"}`}
            >
              {o.highlight && (
                <span className="absolute -top-3 left-7 rounded bg-[#335440] px-3 py-1 text-sm text-white">
                  Built for teaching
                </span>
              )}
              <Icon
                className="mb-6 text-[#6b825f]"
                size={32}
                strokeWidth={1.5}
              />
              <p className="eyebrow">{o.name}</p>
              <h2 className="mt-4 text-3xl font-medium">{o.title}</h2>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
                {o.description}
              </p>
              <ul className="my-8 space-y-4">
                {o.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-6">
                    <Check size={18} className="mt-1 shrink-0 text-[#56764e]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={o.href} className="action-link mt-auto">
                {o.cta}
                <ArrowUpRight size={18} />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 flex items-start gap-4 rounded-xl border p-6">
          <ShieldCheck size={25} className="shrink-0 text-[#57724f]" />
          <div>
            <h2 className="text-lg font-medium">
              Start with the learning experience.
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Free enrollment is available for the current course collection.
              Paid course access, when offered by your academy, is shown before
              checkout. Creating a workspace does not start a paid subscription.
            </p>
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div className="site-container text-center">
          <p className="eyebrow">
            YOUR EXPERTISE CAN BE SOMEONE ELSE&apos;S STARTING POINT.
          </p>
          <h2>A better place to teach. A better way to learn.</h2>
          <p>Bring the curriculum. Build the community. Follow the progress.</p>
          <Link href="/register?mode=academy" className="action-link mt-7">
            Create an academy <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
