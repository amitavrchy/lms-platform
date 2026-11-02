"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { type CatalogCourse, editorialFor } from "@/lib/course-content";
import { CourseCard } from "@/components/academic/CourseCard";

type LearningPath = {
  id: string;
  slug: string;
  title: string;
  descriptionMd?: string;
  courseIds: string[];
};
function Catalog() {
  const params = useSearchParams();
  const router = useRouter();
  const search = params.get("q") ?? "";
  const category = params.get("category") ?? "All courses";
  const sort = params.get("sort") ?? "recommended";
  const duration = params.get("duration") ?? "all";
  function update(values: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    router.replace(`/courses${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  const catalog = useQuery({
    queryKey: queryKeys.catalog.courses,
    queryFn: async () =>
      (await api.get<CatalogCourse[]>("/catalog/courses")).data,
  });
  const paths = useQuery({
    queryKey: queryKeys.catalog.paths,
    queryFn: async () => (await api.get<LearningPath[]>("/catalog/paths")).data,
  });
  const categories = [
    "All courses",
    ...new Set((catalog.data ?? []).map((c) => editorialFor(c.slug).category)),
  ];
  const filtered = (catalog.data ?? [])
    .filter((c) => {
      const info = editorialFor(c.slug);
      return (
        (!search ||
          `${c.title} ${c.subtitle ?? ""} ${info.category}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (category === "All courses" || category === info.category) &&
        (duration === "all" ||
          (duration === "short" ? c.durationMins <= 270 : c.durationMins > 270))
      );
    })
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "duration"
          ? a.durationMins - b.durationMins
          : sort === "popular"
            ? (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0)
            : a.slug === "academic-success-lab"
              ? -1
              : b.slug === "academic-success-lab"
                ? 1
                : a.title.localeCompare(b.title),
    );
  const activeFilters = Boolean(
    search || category !== "All courses" || duration !== "all",
  );
  return (
    <>
      <div className="border-b bg-[#eff1e7] py-14 sm:py-20">
        <div className="site-container">
          <p className="eyebrow">THE LEARNORA COURSE COLLECTION</p>
          <h1 className="catalog-title">
            Where curiosity
            <br />
            becomes capability.
          </h1>
          <p className="mt-6 max-w-xl leading-8 text-[var(--muted)]">
            Find a fresh perspective, build a practical skill, or take the next
            step in your academic journey. A thoughtful place to begin.
          </p>
          <div className="mt-7 flex flex-wrap gap-5 text-sm">
            <span className="flex items-center gap-2">
              <BookOpen size={17} /> Structured lessons
            </span>
            <span>Practical assessments</span>
            <span>Certificates on completion</span>
          </div>
        </div>
      </div>
      <section className="site-container py-12">
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search courses</span>
            <Search
              size={19}
              className="absolute left-4 top-3.5 text-[var(--muted)]"
            />
            <input
              className="catalog-input w-full pl-12!"
              type="search"
              value={search}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="What would you like to learn?"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <SlidersHorizontal size={17} />
            <span className="sr-only">Filter by duration</span>
            <select
              className="catalog-input"
              value={duration}
              onChange={(e) => update({ duration: e.target.value })}
            >
              <option value="all">Any duration</option>
              <option value="short">Up to 4.5 hours</option>
              <option value="long">More than 4.5 hours</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort courses</span>
            <select
              className="catalog-input w-full"
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="recommended">Recommended</option>
              <option value="popular">Most enrolled</option>
              <option value="title">Title: A to Z</option>
              <option value="duration">Shortest first</option>
            </select>
          </label>
        </div>
        <div
          className="my-6 flex flex-wrap gap-2"
          aria-label="Course categories"
        >
          {categories.map((item) => (
            <button
              key={item}
              className="filter-chip"
              aria-pressed={category === item}
              onClick={() =>
                update({ category: item === "All courses" ? "" : item })
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]" role="status">
            {catalog.isLoading
              ? "Opening the classroom…"
              : `${filtered.length} course${filtered.length === 1 ? "" : "s"}${activeFilters ? " matching your interests" : " to help you move forward"}`}
          </p>
          {activeFilters && (
            <button
              onClick={() => router.replace("/courses", { scroll: false })}
              className="text-link"
            >
              Clear filters <X size={15} />
            </button>
          )}
        </div>
        {catalog.isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-xl bg-[var(--surface-2)]"
              />
            ))}
          </div>
        )}
        {catalog.isError && (
          <div className="empty-panel">
            <h2 className="text-xl">We could not load the classroom.</h2>
            <p>Please try again in a moment.</p>
            <button
              className="action-link mt-5"
              onClick={() => void catalog.refetch()}
            >
              Try again
            </button>
          </div>
        )}
        {!catalog.isLoading && !catalog.isError && !filtered.length && (
          <div className="empty-panel py-16 text-center">
            <Search className="mx-auto mb-5" size={28} />
            <h2 className="text-2xl font-medium">
              A different starting point?
            </h2>
            <p>
              No courses match these filters. Try a broader search or explore
              the whole collection.
            </p>
            <button
              className="action-link mt-6"
              onClick={() => router.replace("/courses", { scroll: false })}
            >
              See all courses <ArrowUpRight size={17} />
            </button>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      {!!paths.data?.length && (
        <section className="site-container section-space border-t">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONNECT THE DOTS</p>
              <h2>A path with a bigger purpose.</h2>
              <p>
                Follow a sequence of complementary courses toward a broader
                goal.
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {paths.data.map((path, i) => (
              <article
                key={path.id}
                className="rounded-xl border bg-[#eff1e7] p-7"
              >
                <p className="eyebrow">LEARNING PATH / 0{i + 1}</p>
                <h3 className="mt-5 text-2xl font-medium">{path.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {path.descriptionMd?.replace(/[#*_]/g, "")}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">
                    {path.courseIds.length} connected courses
                  </span>
                  <Link
                    className="text-link"
                    href={`/learn/paths/${path.slug}`}
                  >
                    Explore path <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
export default function CoursesCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="site-container py-20">Opening the classroom…</div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
