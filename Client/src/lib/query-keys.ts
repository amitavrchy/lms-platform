export const queryKeys = {
  me: ["me"] as const,
  streak: ["me", "streak"] as const,
  certificates: ["me", "certificates"] as const,
  enrollments: ["enrollments"] as const,
  catalog: {
    courses: ["catalog", "courses"] as const,
    course: (slug: string) => ["catalog", "courses", slug] as const,
    paths: ["catalog", "paths"] as const,
    path: (slug: string) => ["catalog", "paths", slug] as const,
  },
  progress: (courseId: string) => ["progress", courseId] as const,
  lessonProgress: (lessonId: string) => ["progress", "lesson", lessonId] as const,
  quiz: (id: string) => ["quiz", id] as const,
  studio: {
    courses: ["studio", "courses"] as const,
    course: (id: string) => ["studio", "courses", id] as const,
    analytics: (id: string) => ["analytics", "course", id] as const,
    insights: (id: string) => ["ai", "insights", id] as const,
  },
  admin: {
    members: ["admin", "members"] as const,
    reports: ["admin", "reports"] as const,
  },
  ai: {
    tutor: (lessonId: string) => ["ai", "tutor", lessonId] as const,
  },
};
