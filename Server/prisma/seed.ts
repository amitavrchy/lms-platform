import {
  CohortStatus,
  CourseStatus,
  DiscussionStatus,
  EnrollmentStatus,
  LessonType,
  OrgRole,
  PrismaClient,
  QuestionType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';
const date = (day: number, hour = 10, minute = 0) => new Date(Date.UTC(2026, 10, day, hour, minute));

type LessonSpec = { title: string; slug: string; topic: string; type?: LessonType };
type ModuleSpec = { title: string; releaseOffsetDays: number; lessons: LessonSpec[] };

function lessonMarkdown(title: string, topic: string): string {
  return `# ${title}

## Outcomes
By the end of this lesson, you can explain **${topic}**, apply it to a realistic academic task, and decide on one next action for your current course.

## Core concepts
${topic} works best when it is made visible: name the task, choose evidence, and use a small feedback loop. Strong students do not wait for perfect confidence; they test a method, inspect the result, and revise.

## Worked example
Mina has a dense reading due Friday. Instead of highlighting every paragraph, she writes a one-sentence claim for each section, marks two questions, and compares those notes with the assignment prompt. Her notes become material for both seminar discussion and her outline.

## Practice exercise
1. Choose one assignment due this week.
2. Write the smallest observable action you can complete in 20 minutes.
3. Record what evidence would show that the action helped.

## Reflection
What would change if you treated confusion as information to investigate rather than proof that you are behind?

## Checklist
- [ ] I can define the key idea in my own words.
- [ ] I can recognize it in a course task.
- [ ] I have scheduled one practice action.
`;
}

function makeLesson(spec: LessonSpec, sortOrder: number) {
  const type = spec.type ?? (sortOrder % 2 === 0 ? LessonType.VIDEO : LessonType.ARTICLE);
  return {
    title: spec.title,
    slug: spec.slug,
    type,
    sortOrder,
    durationSec: type === LessonType.QUIZ ? 720 : 480 + sortOrder * 45,
    contentMd: lessonMarkdown(spec.title, spec.topic),
    videoUrl:
      type === LessonType.VIDEO
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        : null,
    resourceUrl: `https://learnora.example/resources/${spec.slug}`,
    transcriptMd:
      type === LessonType.VIDEO
        ? `## Transcript: ${spec.title}\n\nThis guided walkthrough introduces ${spec.topic}. Pause after each prompt and complete the exercise before continuing.`
        : null,
    learningObjectives: [
      `Explain ${spec.topic} using academic language.`,
      `Apply ${spec.topic} to a current assignment.`,
      'Use feedback to choose a focused next step.',
    ],
  };
}

function question(
  promptMd: string,
  correct: string[],
  explanationMd: string,
  sortOrder: number,
  type: QuestionType = QuestionType.SINGLE,
) {
  const choices = ['a', 'b', 'c', 'd'];
  return {
    type,
    promptMd,
    sortOrder,
    explanationMd,
    optionsJson: choices.map((id, index) => ({
      id,
      text: [
        'Define a specific claim and test it against evidence',
        'Rely on first impressions and skip review',
        'Break the task into a deliberate, time-boxed action',
        'Seek feedback and revise the approach',
      ][index],
      correct: correct.includes(id),
    })),
  };
}

const academicSuccessModules: ModuleSpec[] = [
  {
    title: 'Learning Strategies That Stick',
    releaseOffsetDays: 0,
    lessons: [
      { title: 'Welcome: Design Your Semester', slug: 'design-your-semester', topic: 'turning broad goals into a weekly learning plan' },
      { title: 'Retrieval Practice Over Rereading', slug: 'retrieval-practice', topic: 'retrieval practice and desirable difficulty' },
      { title: 'Spacing and Interleaving', slug: 'spacing-interleaving', topic: 'spacing review and mixing related problem types' },
    ],
  },
  {
    title: 'Reading Research With Purpose',
    releaseOffsetDays: 7,
    lessons: [
      { title: 'Read the Assignment Before the Article', slug: 'reading-with-a-question', topic: 'reading with a question and purpose' },
      { title: 'Map Claims, Evidence, and Assumptions', slug: 'claim-evidence-map', topic: 'mapping an author’s claims and evidence' },
      { title: 'Synthesize Across Sources', slug: 'synthesizing-sources', topic: 'synthesizing agreement, tension, and gaps across sources' },
    ],
  },
  {
    title: 'Academic Writing as Revision',
    releaseOffsetDays: 14,
    lessons: [
      { title: 'Build a Defensible Working Thesis', slug: 'working-thesis', topic: 'building a specific, arguable working thesis' },
      { title: 'Paragraph Architecture', slug: 'paragraph-architecture', topic: 'linking claims, evidence, analysis, and transitions' },
      { title: 'Revision Plans That Improve Meaning', slug: 'revision-plans', topic: 'prioritizing global revisions before sentence edits' },
    ],
  },
  {
    title: 'Exam Preparation and Performance',
    releaseOffsetDays: 21,
    lessons: [
      { title: 'Build an Exam Blueprint', slug: 'exam-blueprint', topic: 'aligning study time with assessment demands' },
      { title: 'Practice Under Productive Pressure', slug: 'productive-pressure', topic: 'using low-stakes timed practice to diagnose gaps' },
      { title: 'Recover After a Difficult Assessment', slug: 'assessment-recovery', topic: 'conducting a constructive post-exam review' },
      { title: 'Academic Success Lab Checkpoint', slug: 'academic-success-checkpoint', topic: 'integrating learning, reading, writing, and exam strategies', type: LessonType.QUIZ },
    ],
  },
];

const courseBlueprints = [
  {
    slug: 'research-methods-foundations',
    title: 'Research Methods Foundations',
    subtitle: 'Ask answerable questions and evaluate evidence.',
    descriptionMd: 'A practical introduction to research questions, study design, evidence quality, and transparent interpretation.',
    durationMins: 270,
    modules: [
      { title: 'From Topics to Questions', releaseOffsetDays: 0, lessons: [
        { title: 'Scope a Researchable Question', slug: 'scope-research-question', topic: 'turning a topic into a feasible research question' },
        { title: 'Variables and Operational Definitions', slug: 'variables-operationalization', topic: 'defining concepts so they can be observed or measured' },
        { title: 'Search Strategies and Source Trails', slug: 'source-trails', topic: 'building reproducible scholarly search strategies' },
      ] },
      { title: 'Design and Evidence', releaseOffsetDays: 7, lessons: [
        { title: 'Sampling and Representation', slug: 'sampling-representation', topic: 'how samples shape what a study can claim' },
        { title: 'Correlation, Causation, and Confounds', slug: 'causation-confounds', topic: 'distinguishing association from causal inference' },
        { title: 'Qualitative Evidence and Interpretation', slug: 'qualitative-interpretation', topic: 'using qualitative evidence with care and context' },
      ] },
      { title: 'Communicate Responsible Findings', releaseOffsetDays: 14, lessons: [
        { title: 'Read Results Without Overclaiming', slug: 'responsible-results', topic: 'matching conclusions to the evidence available' },
        { title: 'Methods and Limitations Sections', slug: 'methods-limitations', topic: 'writing transparent methods and limitations' },
        { title: 'Research Methods Checkpoint', slug: 'research-methods-checkpoint', topic: 'research design choices and evidence limits', type: LessonType.QUIZ },
      ] },
    ] as ModuleSpec[],
  },
  {
    slug: 'critical-thinking-argument',
    title: 'Critical Thinking & Argument',
    subtitle: 'Analyze claims, reasons, and the quality of evidence.',
    descriptionMd: 'Practice charitable interpretation, logical analysis, and evidence-based argument in academic and everyday contexts.',
    durationMins: 255,
    modules: [
      { title: 'Arguments in Context', releaseOffsetDays: 0, lessons: [
        { title: 'Identify Claims and Reasons', slug: 'claims-and-reasons', topic: 'separating conclusions from supporting reasons' },
        { title: 'Charitable Interpretation', slug: 'charitable-interpretation', topic: 'reconstructing an argument before evaluating it' },
        { title: 'Assumptions and Definitions', slug: 'assumptions-definitions', topic: 'surfacing hidden assumptions and contested terms' },
      ] },
      { title: 'Evaluate Evidence', releaseOffsetDays: 7, lessons: [
        { title: 'Source Credibility Is Not a Shortcut', slug: 'source-credibility', topic: 'evaluating authority, methods, and relevance together' },
        { title: 'Common Reasoning Errors', slug: 'reasoning-errors', topic: 'recognizing misleading patterns without using labels as substitutes for analysis' },
        { title: 'Counterarguments That Strengthen Work', slug: 'counterarguments', topic: 'using counterarguments to refine a position' },
      ] },
      { title: 'Make an Academic Case', releaseOffsetDays: 14, lessons: [
        { title: 'Structure a Line of Reasoning', slug: 'line-of-reasoning', topic: 'sequencing reasons so a reader can follow the argument' },
        { title: 'Evidence, Warrants, and Stakes', slug: 'warrants-and-stakes', topic: 'explaining why evidence supports a claim and why it matters' },
        { title: 'Argument Checkpoint', slug: 'argument-checkpoint', topic: 'claim evaluation and responsible argument', type: LessonType.QUIZ },
      ] },
    ] as ModuleSpec[],
  },
  {
    slug: 'study-systems-wellbeing',
    title: 'Study Systems & Wellbeing',
    subtitle: 'Build sustainable routines for demanding academic work.',
    descriptionMd: 'Create study systems that protect attention, energy, and recovery while supporting consistent progress.',
    durationMins: 240,
    modules: [
      { title: 'Plan for Reality', releaseOffsetDays: 0, lessons: [
        { title: 'Audit Your Week', slug: 'audit-your-week', topic: 'making an honest map of commitments and available focus time' },
        { title: 'Plan With Energy, Not Just Hours', slug: 'energy-aware-planning', topic: 'matching task difficulty to energy patterns' },
        { title: 'Build a Trusted Task System', slug: 'trusted-task-system', topic: 'capturing tasks and choosing next actions reliably' },
      ] },
      { title: 'Protect Attention', releaseOffsetDays: 7, lessons: [
        { title: 'Start Before You Feel Ready', slug: 'starting-rituals', topic: 'using a repeatable starting ritual to reduce friction' },
        { title: 'Focus Sessions and Recovery Breaks', slug: 'focus-and-recovery', topic: 'balancing focused effort with restorative breaks' },
        { title: 'Digital Boundaries for Study', slug: 'digital-boundaries', topic: 'designing environments that make distractions less available' },
      ] },
      { title: 'Respond to Pressure', releaseOffsetDays: 14, lessons: [
        { title: 'Ask for Academic Support Early', slug: 'ask-for-support', topic: 'making specific, timely requests for support' },
        { title: 'Reset After a Missed Week', slug: 'reset-after-missed-week', topic: 'restarting without turning a setback into a story about ability' },
        { title: 'Study Systems Checkpoint', slug: 'study-systems-checkpoint', topic: 'sustainable planning and attention practices', type: LessonType.QUIZ },
      ] },
    ] as ModuleSpec[],
  },
];

async function createCourse(input: {
  slug: string; title: string; subtitle: string; descriptionMd: string; durationMins: number; status: CourseStatus; modules: ModuleSpec[];
}, organizationId: string) {
  return prisma.course.create({
    data: {
      organizationId,
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      descriptionMd: input.descriptionMd,
      status: input.status,
      level: input.status === CourseStatus.DRAFT ? 'Workshop' : 'Undergraduate / continuing education',
      durationMins: input.durationMins,
      coverUrl: `https://learnora.example/covers/${input.slug}.png`,
      modules: {
        create: input.modules.map((module, moduleIndex) => ({
          title: module.title,
          sortOrder: moduleIndex,
          releaseOffsetDays: module.releaseOffsetDays,
          lessons: { create: module.lessons.map(makeLesson) },
        })),
      },
    },
    include: { modules: { include: { lessons: true } } },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // Delete children before parents so this remains safe with existing demo data.
  await prisma.announcementRead.deleteMany();
  await prisma.discussionReply.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.cohortSession.deleteMany();
  await prisma.courseEntitlement.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.contentChunkMeta.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({ data: { name: 'Learnora Academic Academy', slug: 'learnora' } });
  const userSeeds = [
    ['olivia.owner@learnora.dev', 'Olivia Chen', OrgRole.OWNER],
    ['marcus.admin@learnora.dev', 'Marcus Reed', OrgRole.ADMIN],
    ['dr.anya.shah@learnora.dev', 'Dr. Anya Shah', OrgRole.INSTRUCTOR],
    ['jordan.ta@learnora.dev', 'Jordan Kim', OrgRole.TA],
    ['priya.nair@learnora.dev', 'Priya Nair', OrgRole.LEARNER],
    ['noah.williams@learnora.dev', 'Noah Williams', OrgRole.LEARNER],
    ['sofia.martinez@learnora.dev', 'Sofia Martinez', OrgRole.LEARNER],
    ['ethan.brooks@learnora.dev', 'Ethan Brooks', OrgRole.LEARNER],
    ['maya.patel@learnora.dev', 'Maya Patel', OrgRole.LEARNER],
    ['liam.wong@learnora.dev', 'Liam Wong', OrgRole.LEARNER],
  ] as const;
  const users = Object.fromEntries(await Promise.all(userSeeds.map(async ([email, name, role]) => {
    const user = await prisma.user.create({
      data: {
        email, name, passwordHash,
        memberships: { create: { organizationId: org.id, role } },
        notificationPreference: { create: { emailAnnouncements: role !== OrgRole.LEARNER || email !== 'ethan.brooks@learnora.dev', emailSessionReminders: true, inAppAnnouncements: true, reminderLeadHours: role === OrgRole.LEARNER ? 48 : 24 } },
      },
    });
    return [email, user] as const;
  })));

  const academicSuccess = await createCourse({
    slug: 'academic-success-lab', title: 'Academic Success Lab', subtitle: 'A practical system for learning, research, writing, and exams.',
    descriptionMd: 'The flagship Learnora experience: build repeatable academic practices that transfer across courses.',
    durationMins: 360, status: CourseStatus.PUBLISHED, modules: academicSuccessModules,
  }, org.id);
  const publishedCourses = await Promise.all(courseBlueprints.map((course) => createCourse({ ...course, status: CourseStatus.PUBLISHED }, org.id)));
  const [researchMethods, criticalThinking, studySystems] = publishedCourses;
  const analyticsWorkshop = await createCourse({
    slug: 'learning-analytics-workshop', title: 'Learning Analytics Workshop', subtitle: 'Draft workshop: interpret learning data with care.',
    descriptionMd: 'A forthcoming hands-on workshop about evidence-informed course improvement.', durationMins: 120,
    status: CourseStatus.DRAFT, modules: [{ title: 'Analytics Orientation', releaseOffsetDays: 0, lessons: [
      { title: 'What Learning Data Can and Cannot Say', slug: 'analytics-limits', topic: 'interpreting learning data with context and restraint' },
      { title: 'Draft: Design a Useful Dashboard Question', slug: 'dashboard-question', topic: 'starting analytics work with a decision rather than a metric' },
    ] }],
  }, org.id);

  const allPublished = [academicSuccess, ...publishedCourses];
  const quizzes = await Promise.all(allPublished.map(async (course) => {
    const quizLesson = course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === LessonType.QUIZ)!;
    return prisma.quiz.create({
      data: {
        lessonId: quizLesson.id, title: `${course.title} Mastery Check`, passScore: 70,
        questions: { create: [
          question('Which action makes a broad academic goal observable?', ['a'], 'A specific claim or goal can be checked against evidence.', 0),
          question('Which practices support a deliberate learning cycle? Select all that apply.', ['a', 'c', 'd'], 'Deliberate work names a target, uses focused practice, and incorporates feedback.', 1, QuestionType.MULTI),
          question('What should you do after evidence challenges your first approach?', ['d'], 'Revision is a strength when it responds to evidence.', 2),
          question('Which choice is most likely to create durable learning?', ['c'], 'A time-boxed practice action produces useful feedback and reduces avoidance.', 3),
        ] },
      },
    });
  }));

  await prisma.learningPath.createMany({ data: [
    { organizationId: org.id, slug: 'academic-foundations', title: 'Academic Foundations', descriptionMd: 'Start with sustainable learning systems, then strengthen critical reading and argument.', courseIds: [academicSuccess.id, criticalThinking.id, studySystems.id] },
    { organizationId: org.id, slug: 'research-ready', title: 'Research Ready', descriptionMd: 'Develop a responsible process for reading research, designing questions, and communicating findings.', courseIds: [academicSuccess.id, researchMethods.id, criticalThinking.id] },
  ] });

  const fallCohort = await prisma.cohort.create({ data: {
    organizationId: org.id, courseId: academicSuccess.id, name: 'Fall 2026 Academic Success Cohort', slug: 'fall-2026-academic-success',
    description: 'Active facilitated cohort with weekly studio sessions and peer accountability.', status: CohortStatus.ACTIVE,
    timezone: 'America/New_York', startsAt: date(2, 14), endsAt: date(30, 16), meetingUrl: 'https://meet.learnora.example/fall-success',
    sessions: { create: [
      { title: 'Studio 1: Build Your Learning System', description: 'Plan a realistic week and identify one retrieval practice routine.', startsAt: date(4, 14), endsAt: date(4, 15, 15), meetingUrl: 'https://meet.learnora.example/fall-success-1' },
      { title: 'Studio 2: Read and Write With Evidence', description: 'Practice claim maps and revision plans using a shared article.', startsAt: date(11, 14), endsAt: date(11, 15, 15), meetingUrl: 'https://meet.learnora.example/fall-success-2' },
      { title: 'Studio 3: Prepare for Assessment', description: 'Create an exam blueprint and peer-review a recovery plan.', startsAt: date(18, 14), endsAt: date(18, 15, 15), meetingUrl: 'https://meet.learnora.example/fall-success-3' },
    ] },
  } });
  const researchCohort = await prisma.cohort.create({ data: {
    organizationId: org.id, courseId: researchMethods.id, name: 'Winter 2026 Research Foundations Cohort', slug: 'winter-2026-research-foundations',
    description: 'Upcoming research methods cohort for learners preparing capstone projects.', status: CohortStatus.UPCOMING,
    timezone: 'America/New_York', startsAt: date(24, 14), endsAt: new Date(Date.UTC(2026, 11, 22, 16)), meetingUrl: 'https://meet.learnora.example/research-ready',
    sessions: { create: [
      { title: 'Research Kickoff: Questions and Scope', description: 'Bring a topic and leave with a feasible research question.', startsAt: date(24, 14), endsAt: date(24, 15, 15), meetingUrl: 'https://meet.learnora.example/research-1' },
      { title: 'Evidence Clinic: Design and Interpretation', description: 'Work through sampling, confounds, and limitations together.', startsAt: new Date(Date.UTC(2026, 11, 1, 14)), endsAt: new Date(Date.UTC(2026, 11, 1, 15, 15)), meetingUrl: 'https://meet.learnora.example/research-2' },
    ] },
  } });

  const learner = (email: string) => users[email];
  const enrollmentSpecs = [
    [academicSuccess.id, 'priya.nair@learnora.dev', EnrollmentStatus.ACTIVE, fallCohort.id],
    [academicSuccess.id, 'noah.williams@learnora.dev', EnrollmentStatus.ACTIVE, fallCohort.id],
    [academicSuccess.id, 'sofia.martinez@learnora.dev', EnrollmentStatus.COMPLETED, fallCohort.id],
    [academicSuccess.id, 'ethan.brooks@learnora.dev', EnrollmentStatus.ACTIVE, fallCohort.id],
    [academicSuccess.id, 'maya.patel@learnora.dev', EnrollmentStatus.ACTIVE, null],
    [researchMethods.id, 'priya.nair@learnora.dev', EnrollmentStatus.ACTIVE, researchCohort.id],
    [researchMethods.id, 'liam.wong@learnora.dev', EnrollmentStatus.ACTIVE, researchCohort.id],
    [criticalThinking.id, 'noah.williams@learnora.dev', EnrollmentStatus.ACTIVE, null],
    [criticalThinking.id, 'maya.patel@learnora.dev', EnrollmentStatus.ACTIVE, null],
    [studySystems.id, 'sofia.martinez@learnora.dev', EnrollmentStatus.COMPLETED, null],
  ] as const;
  await prisma.enrollment.createMany({ data: enrollmentSpecs.map(([courseId, email, status, cohortId]) => ({
    courseId, userId: learner(email).id, status, cohortId, enrolledAt: date(status === EnrollmentStatus.COMPLETED ? 1 : 3, 9),
    completedAt: status === EnrollmentStatus.COMPLETED ? date(29, 16) : null,
  })) });
  await prisma.courseEntitlement.createMany({ data: enrollmentSpecs.map(([courseId, email]) => ({
    organizationId: org.id, courseId, userId: learner(email).id, source: 'MANUAL_COHORT_ENROLLMENT',
  })) });

  const flagshipLessons = academicSuccess.modules.flatMap((module) => module.lessons);
  const complete = async (email: string, lessons: typeof flagshipLessons) => prisma.lessonProgress.createMany({
    data: lessons.map((lesson, index) => ({ lessonId: lesson.id, userId: learner(email).id, completed: true, positionSec: lesson.durationSec, completedAt: date(Math.min(28, 3 + index), 18) })),
  });
  await complete('sofia.martinez@learnora.dev', flagshipLessons);
  await complete('priya.nair@learnora.dev', flagshipLessons.slice(0, 9));
  await complete('noah.williams@learnora.dev', flagshipLessons.slice(0, 4));
  await prisma.lessonProgress.createMany({ data: [
    { lessonId: flagshipLessons[0].id, userId: learner('ethan.brooks@learnora.dev').id, completed: false, positionSec: 92 },
    { lessonId: flagshipLessons[0].id, userId: learner('maya.patel@learnora.dev').id, completed: true, positionSec: flagshipLessons[0].durationSec, completedAt: date(3, 18) },
  ] });
  const researchLessons = researchMethods.modules.flatMap((module) => module.lessons);
  await prisma.lessonProgress.createMany({ data: researchLessons.slice(0, 3).map((lesson, index) => ({ lessonId: lesson.id, userId: learner('priya.nair@learnora.dev').id, completed: true, positionSec: lesson.durationSec, completedAt: date(7 + index, 18) })) });

  await prisma.quizAttempt.createMany({ data: [
    { quizId: quizzes[0].id, userId: learner('sofia.martinez@learnora.dev').id, score: 100, passed: true, answersJson: { a: ['a'], b: ['a', 'c', 'd'], c: ['d'], d: ['c'] }, createdAt: date(28, 18) },
    { quizId: quizzes[0].id, userId: learner('priya.nair@learnora.dev').id, score: 75, passed: true, answersJson: { a: ['a'], b: ['a', 'c'], c: ['d'], d: ['c'] }, createdAt: date(28, 19) },
    { quizId: quizzes[1].id, userId: learner('priya.nair@learnora.dev').id, score: 50, passed: false, answersJson: { a: ['b'], b: ['a'], c: ['d'], d: ['b'] }, createdAt: date(8, 18) },
  ] });
  await prisma.certificate.create({ data: { courseId: academicSuccess.id, userId: learner('sofia.martinez@learnora.dev').id, code: 'LAA-ASL-2026-SOFIA-001', issuedAt: date(30, 12) } });

  const streaks = [
    ['priya.nair@learnora.dev', 12, 19, 425, 55, 30, 2],
    ['noah.williams@learnora.dev', 4, 8, 155, 30, 10, 1],
    ['sofia.martinez@learnora.dev', 21, 34, 690, 40, 40, 1],
    ['ethan.brooks@learnora.dev', 0, 3, 20, 30, 0, 12],
    ['maya.patel@learnora.dev', 1, 6, 55, 30, 10, 3],
    ['liam.wong@learnora.dev', 0, 0, 0, 30, 0, 20],
  ] as const;
  await Promise.all(streaks.map(([email, currentStreak, longestStreak, xpTotal, dailyGoalXp, dailyXpEarned, lastActiveDay]) => prisma.userStreak.create({
    data: { userId: learner(email).id, currentStreak, longestStreak, xpTotal, dailyGoalXp, dailyXpEarned, dailyGoalDate: date(2, 0), lastActiveDate: date(lastActiveDay, 0) },
  })));
  await prisma.xpEvent.createMany({ data: [
    { userId: learner('priya.nair@learnora.dev').id, amount: 225, reason: 'completed_lessons', createdAt: date(28, 18) },
    { userId: learner('priya.nair@learnora.dev').id, amount: 200, reason: 'weekly_consistency_bonus', createdAt: date(29, 18) },
    { userId: learner('sofia.martinez@learnora.dev').id, amount: 600, reason: 'course_completion', createdAt: date(30, 12) },
    { userId: learner('noah.williams@learnora.dev').id, amount: 155, reason: 'learning_momentum', createdAt: date(27, 18) },
  ] });

  const orgAnnouncement = await prisma.announcement.create({ data: {
    organizationId: org.id, authorId: users['marcus.admin@learnora.dev'].id, title: 'Welcome to the Fall learning cycle',
    bodyMd: '## A focused start\n\nChoose one course priority, schedule two study blocks, and introduce yourself in the cohort space. Staff office hours are available each Tuesday.', publishedAt: date(1, 12),
  } });
  const courseAnnouncement = await prisma.announcement.create({ data: {
    organizationId: org.id, courseId: academicSuccess.id, authorId: users['dr.anya.shah@learnora.dev'].id, title: 'Bring one real assignment to Studio 1',
    bodyMd: 'Bring a current reading, writing, or exam task. We will turn it into a workable practice plan and leave time for peer feedback.', publishedAt: date(1, 14),
  } });
  await prisma.announcementRead.createMany({ data: [
    { announcementId: orgAnnouncement.id, userId: learner('priya.nair@learnora.dev').id, channel: 'IN_APP', readAt: date(2, 13) },
    { announcementId: orgAnnouncement.id, userId: learner('sofia.martinez@learnora.dev').id, channel: 'EMAIL', readAt: date(2, 13) },
    { announcementId: courseAnnouncement.id, userId: learner('priya.nair@learnora.dev').id, channel: 'IN_APP', readAt: date(3, 16) },
  ] });
  const thread = await prisma.discussionThread.create({ data: {
    organizationId: org.id, courseId: academicSuccess.id, lessonId: flagshipLessons[1].id, authorId: learner('priya.nair@learnora.dev').id,
    title: 'How detailed should my retrieval prompts be?', bodyMd: 'I can recall definitions, but I struggle to make prompts that connect ideas across a reading. What is a good starting level of detail?', status: DiscussionStatus.OPEN, pinned: true,
  } });
  await prisma.discussionReply.createMany({ data: [
    { threadId: thread.id, authorId: learner('noah.williams@learnora.dev').id, bodyMd: 'I used one prompt for each section heading, then added “why does this matter?” after I could answer the basic one.' },
    { threadId: thread.id, authorId: users['jordan.ta@learnora.dev'].id, bodyMd: 'Great question. Start with **one claim + one relationship**: “What does the author claim about X, and what evidence connects it to Y?” Review your answer against the text, then refine the prompt—not just the answer.', staffOnly: false },
  ] });
  await prisma.discussionThread.create({ data: {
    organizationId: org.id, courseId: researchMethods.id, lessonId: researchLessons[4].id, authorId: learner('liam.wong@learnora.dev').id,
    title: 'Can a strong correlation answer my capstone question?', bodyMd: 'My variables move together in the data. How should I write about that without claiming a cause?', status: DiscussionStatus.RESOLVED,
  } });

  console.log('\nSeeded Learnora Academic Academy');
  console.log(`Organization: ${org.name} (${org.slug})`);
  console.log(`Courses: ${allPublished.length} published, 1 draft; modules: ${academicSuccess.modules.length + publishedCourses.reduce((sum, course) => sum + course.modules.length, 0) + analyticsWorkshop.modules.length}; lessons: ${[academicSuccess, ...publishedCourses, analyticsWorkshop].flatMap((course) => course.modules.flatMap((module) => module.lessons)).length}`);
  console.log(`Users: ${userSeeds.length}; enrollments: ${enrollmentSpecs.length}; cohorts: 2; sessions: 5; quizzes: ${quizzes.length}`);
  console.log(`Credentials: priya.nair@learnora.dev / ${PASSWORD}`);
  console.log(`Staff: olivia.owner@learnora.dev, marcus.admin@learnora.dev, dr.anya.shah@learnora.dev, jordan.ta@learnora.dev / ${PASSWORD}`);
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => prisma.$disconnect());
