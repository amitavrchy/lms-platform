"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  GraduationCap,
  Layers3,
  MessageCircle,
  MoveUpRight,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { type CatalogCourse, faqs } from "@/lib/course-content";
import { CourseCard } from "@/components/academic/CourseCard";

const features = [
  {
    icon: Compass,
    title: "A clear path, from day one.",
    body: "Know what you are learning and why. Every course connects short lessons to practical exercises and meaningful outcomes.",
  },
  {
    icon: Users,
    title: "Independent. Never alone.",
    body: "Bring your questions to course discussions, learn alongside your cohort, and stay connected to the teaching team.",
  },
  {
    icon: Award,
    title: "Progress you can point to.",
    body: "Put your understanding to the test, see how far you have come, and earn a certificate for the work you finish.",
  },
];

export default function HomePage() {
  const catalog = useQuery({
    queryKey: queryKeys.catalog.courses,
    queryFn: async () =>
      (await api.get<CatalogCourse[]>("/catalog/courses")).data,
  });
  const courses = [...(catalog.data ?? [])].sort((a, b) =>
    a.slug === "academic-success-lab"
      ? -1
      : b.slug === "academic-success-lab"
        ? 1
        : a.title.localeCompare(b.title),
  );
  return (
    <>
      <section className="hero-section">
        <div className="site-container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> A SMALL STEP. A BIGGER
              POSSIBILITY.
            </p>
            <h1>
              Good things
              <br />
              start with
              <br />
              <span className="hero-emphasis">
                a curious mind.
                <svg viewBox="0 0 500 20" aria-hidden="true">
                  <path d="M4 12 Q210 -2 493 10 M42 18 Q270 6 458 15" />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Build the skills to think deeper, work smarter, and move forward.
              Thoughtful courses, a supportive community, and a clear next step.
              All in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/courses" className="action-link">
                Find your next course <ArrowUpRight size={19} />
              </Link>
              <a
                href="#experience"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <span className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white">
                  <Play size={14} fill="currentColor" />
                </span>
                See how it works
              </a>
            </div>
            <div className="hero-footnote">
              <span className="flex -space-x-2" aria-hidden="true">
                {["AN", "JK", "PN", "MC"].map((n, i) => (
                  <span key={n} className={`initial-avatar avatar-${i}`}>
                    {n}
                  </span>
                ))}
              </span>
              <p>
                <strong>A place for your next chapter.</strong>
                <br />
                <span>Learn at your pace. Make it count.</span>
              </p>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Preview of the Learnora learning workspace"
          >
            <div className="hero-visual-grid" />
            <div className="visual-label">
              <span className="status-dot" /> YOUR POTENTIAL, IN PROGRESS
            </div>
            <div className="preview-window">
              <div className="preview-window-top">
                <span className="flex gap-1.5">
                  <i />
                  <i />
                  <i />
                </span>
                <span>YOUR LEARNING SPACE</span>
                <Layers3 size={15} />
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#67736b]">One lesson closer.</p>
                  <span className="preview-tag">A little, every day</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#243e32]">
                  Make room for growth.
                </h2>
                <div className="preview-course">
                  <div className="preview-book">
                    <BookOpen size={40} strokeWidth={1.2} />
                    <span>
                      THE LEARNING
                      <br />
                      FIELD GUIDE
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-[#747e72]">
                      ACADEMIC SUCCESS LAB
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#263e32]">
                      Learn how to learn.
                    </h3>
                    <p className="mt-2 text-sm text-[#67736b]">
                      Module 01 / Building your foundation
                    </p>
                    <div className="preview-progress">
                      <span />
                    </div>
                    <p className="text-sm text-[#67736b]">
                      Your next step is waiting.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[#67736b]">
                    <Clock3 size={16} /> A focused study session
                  </span>
                  <Link
                    href="/courses/academic-success-lab"
                    className="preview-resume"
                  >
                    Explore <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
            <div className="floating-note">
              <span className="note-icon">
                <Check size={22} />
              </span>
              <div>
                <strong>Small steps. Real progress.</strong>
                <p>Build a rhythm that works for you.</p>
              </div>
              <Sparkles size={20} className="text-[#b18a41]" />
            </div>
            <span className="hero-scribble" aria-hidden="true">
              keep growing &#8599;
            </span>
          </div>
        </div>
      </section>
      <section className="promise-strip">
        <div className="site-container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              label: "Purposeful curriculum",
              sub: "Less noise. More understanding.",
            },
            {
              icon: Clock3,
              label: "Your pace, your space",
              sub: "Make learning fit your life.",
            },
            {
              icon: Users,
              label: "Better together",
              sub: "A community to learn with.",
            },
            {
              icon: GraduationCap,
              label: "Something to show for it",
              sub: "Earn your progress.",
            },
          ].map(({ icon: Icon, label, sub }) => (
            <div className="flex items-center gap-4" key={label}>
              <Icon size={25} strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="site-container section-space" id="courses">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR NEXT CHAPTER</p>
            <h2>Big ideas. Practical skills.</h2>
            <p>
              Start with what sparks your curiosity. Leave with something you
              can use.
            </p>
          </div>
          <Link href="/courses" className="text-link">
            Explore all courses <ArrowUpRight size={18} />
          </Link>
        </div>
        {catalog.isLoading && (
          <div
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
            aria-label="Loading courses"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl bg-[var(--surface-2)]"
              />
            ))}
          </div>
        )}
        {catalog.isError && (
          <div className="empty-panel">
            <h3>Our classroom is taking a moment.</h3>
            <p>We could not load courses. Please try again.</p>
            <button
              className="text-link mt-3"
              onClick={() => void catalog.refetch()}
            >
              Reload courses <ArrowRight size={16} />
            </button>
          </div>
        )}
        {catalog.data?.length === 0 && (
          <div className="empty-panel">
            New courses are on their way. Check back soon.
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {courses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      <section className="experience-section" id="experience">
        <div className="site-container section-space">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BUILT AROUND HOW YOU GROW</p>
              <h2>
                More than a course.
                <br />A way forward.
              </h2>
            </div>
            <p className="max-w-sm">
              A good learning experience gives you structure, room to practise,
              and a reason to keep going. We bring all three.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }, i) => (
              <article key={title} className="experience-card">
                <div className="flex items-center justify-between">
                  <span className="feature-icon">
                    <Icon size={27} strokeWidth={1.5} />
                  </span>
                  <span className="text-sm text-[var(--muted)]">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="site-container section-space">
        <div className="study-layout">
          <div className="study-demo">
            <div className="flex items-center gap-3 border-b pb-5">
              <span className="feature-icon">
                <Sparkles size={22} />
              </span>
              <div>
                <h3 className="text-base font-semibold">
                  A fresh perspective, on hand.
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Your lesson study companion
                </p>
              </div>
            </div>
            <p className="chat-question">
              I keep re-reading my notes. How can I tell if I actually
              understand them?
            </p>
            <div className="chat-answer">
              <Sparkles size={19} className="shrink-0" />
              <div>
                <p>
                  Try closing your notes and explaining the idea in your own
                  words. Then check what you missed.
                </p>
                <p className="mt-3">
                  Start small: write three questions about this lesson. Answer
                  them tomorrow, before looking back.
                </p>
                <span className="mt-4 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <BookOpen size={14} /> Example: retrieval practice
                </span>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              A preview of the learning experience
            </p>
          </div>
          <div>
            <p className="eyebrow">GET UNSTUCK. KEEP GOING.</p>
            <h2 className="section-title">
              A little support.
              <br />A lot more possibility.
            </h2>
            <p className="mt-5 max-w-lg leading-8 text-[var(--muted)]">
              Learning comes with questions. Bring yours. Your workspace
              connects lesson resources, personal study notes, course
              discussions, and an AI companion, right where you need them.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                "Understand the idea, then put it into practice",
                "Keep your notes alongside your lessons",
                "Find your people in course discussions",
              ].map((text) => (
                <li className="flex items-center gap-3 text-sm" key={text}>
                  <CheckCircle2 size={19} className="text-[#4d735b]" />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/register" className="text-link mt-8">
              Build your learning routine <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="site-container pb-20">
        <div className="academy-banner">
          <div>
            <p className="eyebrow">FOR PEOPLE WHO HELP PEOPLE GROW</p>
            <h2>
              Your knowledge.
              <br />
              Their next breakthrough.
            </h2>
            <p>
              Bring your curriculum, cohorts, and community together.
              <br className="hidden sm:block" /> Give your learners a classroom
              worth coming back to.
            </p>
            <Link href="/pricing" className="action-link light mt-7">
              Explore Learnora for academies <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="academy-stack" aria-hidden="true">
            <div>
              <Users size={25} />
              <span>Bring people together</span>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <Target size={25} />
              <span>Turn lessons into outcomes</span>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <MessageCircle size={25} />
              <span>Make space for questions</span>
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className="site-container section-space border-t">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p>
            <h2 className="section-title">Curiosity encouraged.</h2>
            <p className="mt-5 max-w-sm text-[var(--muted)]">
              Everything you need to take that first step with a little more
              confidence.
            </p>
            <Link href="/courses" className="text-link mt-7">
              Find your starting point <MoveUpRight size={18} />
            </Link>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <details key={faq.question} className="faq-item" open={i === 0}>
                <summary>
                  {faq.question}
                  <span className="faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div className="site-container text-center">
          <p className="eyebrow">THERE IS ALWAYS SOMETHING MORE TO LEARN.</p>
          <h2>Your next chapter starts here.</h2>
          <p>Bring your curiosity. We will help you find the way.</p>
          <Link href="/courses" className="action-link mt-7">
            Let&apos;s find your course <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
