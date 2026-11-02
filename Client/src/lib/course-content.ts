export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  level?: string | null;
  durationMins: number;
  organization?: { slug: string; name: string };
  _count?: { modules: number; enrollments: number };
};

export const courseEditorial: Record<
  string,
  { category: string; color: string; symbol: string; outcomes: string[] }
> = {
  "academic-success-lab": {
    category: "Academic skills",
    color: "peach",
    symbol: "A",
    outcomes: [
      "Build a repeatable retrieval and review routine",
      "Read research with a question in mind",
      "Turn a working thesis into a clear argument",
      "Prepare for exams with a practical study blueprint",
    ],
  },
  "research-methods-foundations": {
    category: "Research",
    color: "sage",
    symbol: "R",
    outcomes: [
      "Turn a broad topic into a feasible research question",
      "Choose a design and define observable variables",
      "Identify sampling limits and confounding factors",
      "Communicate findings without overclaiming",
    ],
  },
  "critical-thinking-argument": {
    category: "Critical thinking",
    color: "lavender",
    symbol: "C",
    outcomes: [
      "Separate conclusions from supporting reasons",
      "Evaluate source quality, relevance, and methods",
      "Make hidden assumptions visible",
      "Use counterarguments to strengthen your position",
    ],
  },
  "study-systems-wellbeing": {
    category: "Study & wellbeing",
    color: "butter",
    symbol: "S",
    outcomes: [
      "Plan a realistic week around your commitments",
      "Match demanding tasks to your energy patterns",
      "Build focus sessions with recovery breaks",
      "Restart your routine after a difficult week",
    ],
  },
};

export function editorialFor(slug: string) {
  return (
    courseEditorial[slug] ?? {
      category: "Professional learning",
      color: "sage",
      symbol: "L",
      outcomes: [],
    }
  );
}

export const faqs = [
  {
    question: "Where should I start?",
    answer:
      "Start with Academic Success Lab if you want a foundation in reading, writing, revision, and exam preparation. Choose Research Methods for a research project, Critical Thinking for evaluating arguments, or Study Systems for a sustainable weekly routine.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Self-paced enrollment lets you work through the curriculum on your schedule. If your academy assigns you to a cohort, modules may open on a weekly schedule and your cohort page shows live sessions and milestones.",
  },
  {
    question: "How do assessments and certificates work?",
    answer:
      "Each course combines lessons with a checkpoint quiz. Submit your answers for a score and feedback, complete the required lessons, and pass the assessments to earn a course certificate. Your certificates remain available in your learner workspace.",
  },
  {
    question: "What does the AI study companion do?",
    answer:
      "Open the tutor from a lesson to ask for an explanation, a practice question, or help making a connection. Responses depend on the course material available to the tutor. AI availability depends on your academy's configuration.",
  },
  {
    question: "Can instructors manage their own courses?",
    answer:
      "Yes. Instructors can create and publish courses, organize modules and lessons, build quizzes, schedule cohorts, moderate discussions, and review course analytics in Studio. Organization admins can assign courses and export reports.",
  },
];
