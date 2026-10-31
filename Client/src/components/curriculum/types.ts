export type StudioQuizRef = {
  id: string;
  title: string;
};

export type StudioLesson = {
  id: string;
  title: string;
  slug: string;
  type?: string;
  sortOrder: number;
  contentMd?: string | null;
  videoUrl?: string | null;
  durationSec?: number;
  quiz?: StudioQuizRef | null;
};

export type StudioModule = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: StudioLesson[];
};

export type StudioCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  status: string;
  level?: string | null;
  durationMins?: number;
  modules: StudioModule[];
};

export type StudioCourseListItem = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  status: string;
  updatedAt: string;
  _count?: { modules: number; enrollments: number };
};
