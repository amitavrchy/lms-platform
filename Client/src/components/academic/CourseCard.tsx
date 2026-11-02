import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { type CatalogCourse, editorialFor } from "@/lib/course-content";
import { formatDuration } from "@/lib/utils";

export function CourseArt({ slug, title }: { slug: string; title?: string }) {
  const info = editorialFor(slug);
  return (
    <div
      className={`course-art art-${info.color}`}
      role="img"
      aria-label={`${title ?? info.category} course illustration`}
    >
      <span className="art-grid" />
      <span className="art-orbit" />
      <span className="art-letter">{info.symbol}</span>
      <span className="art-caption">LEARNORA / FIELD NOTES</span>
      <BookOpen className="art-icon" strokeWidth={1.3} />
    </div>
  );
}

export function CourseCard({ course }: { course: CatalogCourse }) {
  const info = editorialFor(course.slug);
  return (
    <article className="course-card group">
      <Link
        href={`/courses/${course.slug}`}
        aria-label={`Explore ${course.title}`}
      >
        <CourseArt slug={course.slug} title={course.title} />
      </Link>
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-2 text-sm">
          <span className="category-label">{info.category}</span>
          <span className="flex items-center gap-1.5 text-[var(--muted)]">
            <Clock3 size={15} />
            {formatDuration(course.durationMins)}
          </span>
        </div>
        <h3 className="text-xl font-semibold">
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--muted)]">
          {course.subtitle}
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
          <span className="text-[var(--muted)]">
            {course._count?.modules ?? 0} modules · Guided practice
          </span>
          <Link
            href={`/courses/${course.slug}`}
            className="flex shrink-0 items-center gap-1 font-semibold"
            aria-label={`View ${course.title}`}
          >
            View course <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
