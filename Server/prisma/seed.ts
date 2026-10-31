import { PrismaClient, CourseStatus, LessonType, OrgRole, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.contentChunkMeta.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: {
      name: 'Learnora Demo',
      slug: 'learnora',
      logoUrl: null,
    },
  });

  const users = await Promise.all(
    [
      { email: 'owner@learnora.dev', name: 'Olivia Owner', role: OrgRole.OWNER },
      { email: 'admin@learnora.dev', name: 'Alex Admin', role: OrgRole.ADMIN },
      { email: 'instructor@learnora.dev', name: 'Ira Instructor', role: OrgRole.INSTRUCTOR },
      { email: 'ta@learnora.dev', name: 'Taylor TA', role: OrgRole.TA },
      { email: 'learner@learnora.dev', name: 'Lee Learner', role: OrgRole.LEARNER },
    ].map(async (u) => {
      const user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          memberships: { create: { organizationId: org.id, role: u.role } },
          streak: { create: {} },
        },
      });
      return { ...user, role: u.role };
    }),
  );

  const learner = users.find((u) => u.role === OrgRole.LEARNER)!;

  const foundations = await prisma.course.create({
    data: {
      organizationId: org.id,
      slug: 'learning-foundations',
      title: 'Learning Foundations',
      subtitle: 'Build habits that finish courses',
      descriptionMd:
        'A practical intro to deliberate practice, spaced recall, and finishing what you start.',
      status: CourseStatus.PUBLISHED,
      level: 'Beginner',
      durationMins: 95,
      coverUrl: null,
      modules: {
        create: [
          {
            title: 'Mindset',
            sortOrder: 0,
            lessons: {
              create: [
                {
                  title: 'Welcome to Learnora',
                  slug: 'welcome',
                  type: LessonType.VIDEO,
                  videoUrl:
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  durationSec: 596,
                  sortOrder: 0,
                  contentMd: '## Welcome\nFinish what you start.',
                },
                {
                  title: 'Why streaks work',
                  slug: 'why-streaks-work',
                  type: LessonType.ARTICLE,
                  durationSec: 420,
                  sortOrder: 1,
                  contentMd:
                    '## Habit loops\nSmall daily progress beats occasional marathons.\n\n- Cue\n- Routine\n- Reward (XP)',
                },
              ],
            },
          },
          {
            title: 'Practice',
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: 'Deliberate practice basics',
                  slug: 'deliberate-practice',
                  type: LessonType.VIDEO,
                  videoUrl:
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                  durationSec: 653,
                  sortOrder: 0,
                  contentMd: 'Focus on the hard edge of your ability.',
                },
                {
                  title: 'Foundations check',
                  slug: 'foundations-quiz',
                  type: LessonType.QUIZ,
                  durationSec: 600,
                  sortOrder: 1,
                  contentMd: 'Check your understanding.',
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const quizLesson = foundations.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.slug === 'foundations-quiz')!;

  await prisma.quiz.create({
    data: {
      lessonId: quizLesson.id,
      title: 'Foundations check',
      passScore: 70,
      questions: {
        create: [
          {
            type: QuestionType.SINGLE,
            promptMd: 'What is the best daily learning habit?',
            sortOrder: 0,
            explanationMd: 'Consistency compounds.',
            optionsJson: [
              { id: 'a', text: 'Occasional all-nighters', correct: false },
              { id: 'b', text: 'Small daily sessions', correct: true },
              { id: 'c', text: 'Only weekends', correct: false },
              { id: 'd', text: 'Skip reviews', correct: false },
            ],
          },
          {
            type: QuestionType.SINGLE,
            promptMd: 'XP in Learnora primarily reinforces…',
            sortOrder: 1,
            explanationMd: 'XP celebrates completed actions.',
            optionsJson: [
              { id: 'a', text: 'Watching ads', correct: false },
              { id: 'b', text: 'Completed learning actions', correct: true },
              { id: 'c', text: 'Account age', correct: false },
              { id: 'd', text: 'Password strength', correct: false },
            ],
          },
          {
            type: QuestionType.SINGLE,
            promptMd: 'A streak increments when you…',
            sortOrder: 2,
            explanationMd: 'Activity once per calendar day.',
            optionsJson: [
              { id: 'a', text: 'Open the app without learning', correct: false },
              { id: 'b', text: 'Have activity on a new calendar day', correct: true },
              { id: 'c', text: 'Change your avatar', correct: false },
              { id: 'd', text: 'Fail a quiz', correct: false },
            ],
          },
        ],
      },
    },
  });

  const typescript = await prisma.course.create({
    data: {
      organizationId: org.id,
      slug: 'typescript-essentials',
      title: 'TypeScript Essentials',
      subtitle: 'Types that make shipping safer',
      descriptionMd: 'From primitives to generics with practical LMS examples.',
      status: CourseStatus.PUBLISHED,
      level: 'Intermediate',
      durationMins: 140,
      modules: {
        create: [
          {
            title: 'Types that matter',
            sortOrder: 0,
            lessons: {
              create: [
                {
                  title: 'Why TypeScript',
                  slug: 'why-typescript',
                  type: LessonType.VIDEO,
                  videoUrl:
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  durationSec: 15,
                  sortOrder: 0,
                  contentMd: 'Catch bugs before runtime.',
                },
                {
                  title: 'Interfaces vs types',
                  slug: 'interfaces-vs-types',
                  type: LessonType.ARTICLE,
                  durationSec: 480,
                  sortOrder: 1,
                  contentMd:
                    '## Interfaces\nGreat for object shapes.\n\n## Type aliases\nUnions, intersections, mapped types.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      organizationId: org.id,
      slug: 'ai-tutor-workshop',
      title: 'AI Tutor Workshop',
      subtitle: 'Draft — coming soon',
      descriptionMd: 'How to ground tutors in your curriculum.',
      status: CourseStatus.DRAFT,
      level: 'Advanced',
      durationMins: 60,
      modules: {
        create: [
          {
            title: 'RAG basics',
            sortOrder: 0,
            lessons: {
              create: [
                {
                  title: 'Chunking lesson notes',
                  slug: 'chunking',
                  type: LessonType.ARTICLE,
                  contentMd: 'Draft content',
                  sortOrder: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.learningPath.create({
    data: {
      organizationId: org.id,
      slug: 'creator-starter',
      title: 'Creator Starter Path',
      descriptionMd: 'Foundations then TypeScript.',
      courseIds: [foundations.id, typescript.id],
    },
  });

  await prisma.enrollment.create({
    data: { courseId: foundations.id, userId: learner.id },
  });

  const firstLessons = foundations.modules
    .flatMap((m) => m.lessons)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const welcome = firstLessons.find((l) => l.slug === 'welcome')!;

  await prisma.lessonProgress.create({
    data: {
      lessonId: welcome.id,
      userId: learner.id,
      completed: true,
      positionSec: 120,
      completedAt: new Date(),
    },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.userStreak.update({
    where: { userId: learner.id },
    data: {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: today,
      xpTotal: 45,
      dailyGoalXp: 30,
      dailyXpEarned: 10,
      dailyGoalDate: today,
    },
  });

  await prisma.xpEvent.createMany({
    data: [
      { userId: learner.id, amount: 10, reason: 'lesson_complete' },
      { userId: learner.id, amount: 5, reason: 'daily_first_activity' },
      { userId: learner.id, amount: 30, reason: 'seed_bonus' },
    ],
  });

  console.log('Seeded Learnora Demo academy');
  console.log('Login: learner@learnora.dev / Password123!');
  console.log('Also: owner@, admin@, instructor@, ta@learnora.dev');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
