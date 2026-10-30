# LMS Platform — Project Build Spec (Agent-Ready)

> Product brand: **Learnora**  
> Stack locked: Client Next.js (App Router, TS, Tailwind, Redux Toolkit, React Query, axios, RHF/zod, framer-motion, lucide, react-table, recharts, date-fns, day-picker, radix, sonner) + Server NestJS ESM + Prisma 6 + Postgres 16 + JWT + swagger. `ai/` FastAPI + openai + langchain + langchain-openai + chromadb + sqlalchemy + psycopg. No zustand.  
> Recommended extras: `cmdk`, `class-variance-authority`, `nuqs`, `video.js` or `@mux/mux-player-react` (MVP: HTML5 video + URL), `canvas-confetti`, `react-markdown`, `remark-gfm`, `katex` + `rehype-katex` (stretch), `sortablejs` or `@dnd-kit/*` for curriculum reorder.

---

## 1. Vision & Personas

**Vision:** A creator-and-cohort LMS that blends Teachable’s course selling clarity, Canvas’s structured assignments/gradebook discipline, Coursera’s pathway credibility, and Duolingo’s habit loops (streaks, XP, daily goals) — with an AI tutor grounded in *your* course content.

**Brand promise:** “Finish what you start.” Beautiful player, addictive progress, serious outcomes.

**Personas**
| Persona | Needs |
|---------|-------|
| Learner | Clear path, mobile-friendly player, streak motivation, AI help without spoilers |
| Instructor / Creator | Curriculum builder, quizzes, cohort management, analytics |
| Org Admin (B2B) | Multi-tenant academy, assign courses, completion reports |
| Teaching Assistant | Grade quizzes, answer Q&A |

---

## 2. Competitive Research

| Product | Steal | Beat | Link |
|---------|-------|------|------|
| **Coursera** | Pathways, in-video quizzes, peer review, certificates | Heavy marketplace; slow for indie creators | https://www.coursera.org · https://www.group.app/blog/best-elearning-platforms/ |
| **Udemy** | Player UX, Q&A, coding exercises, lifetime access framing | Quality variance; weak org admin | https://www.udemy.com |
| **Teachable** | Course storefront, drip, checkout simplicity | Thin LMS admin/reporting | https://teachable.com |
| **Canvas** | Assignments, gradebook, discussions, LTI | Dated UX; education-enterprise feel | https://www.instructure.com/canvas |
| **Duolingo** | Streaks, XP, bite-size, skill path, habit notifications | Not a general LMS | https://www.duolingo.com |

**Beat them by:** Duolingo-grade daily engagement *inside* a real multi-course academy; AI tutor that only uses ingested lesson transcripts/notes; gorgeous curriculum builder; org workspaces with Stripe-ready entitlements (course access).

---

## 3. Design System

### Color
| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#0B1020` | Immersive learning dark |
| `--surface` | `#141B2D` | Cards / player chrome |
| `--text` | `#F1F5F9` | Primary |
| `--muted` | `#94A3B8` | Secondary |
| `--accent` | `#8B5CF6` | Purple progress / XP |
| `--accent-2` | `#22D3EE` | Streak / highlights |
| `--success` | `#34D399` | Correct / complete |
| `--danger` | `#FB7185` | Incorrect |
| `--xp` | `#FBBF24` | XP badges |

Light mode for admin builder: `#F8FAFC` bg, `#0F172A` text, same purple accent.

### Typography
- Display: `Space Grotesk` or `Geist` for course titles.
- Body: `Inter`.
- Mono: code lessons.

### Motion
- Progress ring animate; streak flame pulse; lesson complete check spring; prefer framer-motion. Confetti on certificate.

---

## 4. IA & Pages

### Marketing `/` `/pricing` `/courses` (public catalog)
### Auth `/login` `/register`
### Learner `/learn`
- Home: Continue watching, daily goal ring, streak, recommended.
- `/learn/courses/[slug]` outline + enroll.
- `/learn/courses/[slug]/lessons/[lessonId]` **Player**: video/article, notes tab, AI tutor drawer, mark complete, next lesson.
- `/learn/paths/[slug]` multi-course path.
- `/learn/quiz/[quizId]` timed/untimed; instant feedback; XP.
- `/learn/certificates/[id]` shareable.
- `/learn/streak` calendar heatmap.

### Instructor `/studio`
- Courses list; `/studio/courses/[id]` curriculum DnD modules/lessons; settings; pricing; publish.
- `/studio/courses/[id]/quizzes` builder.
- `/studio/analytics` completion, quiz difficulty, drop-off.
- `/studio/ai` generate quiz from lesson; insights.

### Org admin `/admin`
- Members, assign courses, reports export.

### Settings — profile, notifications, billing stub.

**Signature:** Player “focus mode” hides chrome; shortcut `A` opens AI tutor; `N` next lesson.

---

## 5. Features Priority

### MVP
- Multi-tenant Organization (academy) + roles
- Public catalog + enroll
- Modules/lessons (video URL + rich text markdown)
- Progress tracking + completion %
- Quizzes (MCQ) + auto-grade
- Streaks + XP + daily goal
- Certificates on course complete
- AI tutor RAG over lesson content
- AI quiz generation
- AI progress insights for instructors
- Dashboards learner + instructor

### Stretch
- Drip schedules
- Peer review
- Live cohort sessions
- Coding sandbox
- Mux adaptive streaming
- Mobile PWA
- Stripe checkout for paid courses
- Discussions / Q&A threads
- SCORM/LTI

---

## 6. RBAC & Multi-tenancy

**Org roles:** `OWNER`, `ADMIN`, `INSTRUCTOR`, `TA`, `LEARNER`.

- Instructors manage own courses (or all if ADMIN).
- Learners only see enrolled + public catalog.
- AI tutor available to enrolled learners; quiz gen to instructors.
- All content rows carry `organizationId` (white-label academy). Platform super-admin out of scope.

---

## 7. Frontend Architecture

```
Client/src/
  app/(marketing)/...
  app/(learn)/learn/...
  app/(studio)/studio/...
  app/(admin)/admin/...
  components/
    player/ (VideoPlayer, LessonTabs, ProgressRing, CompleteBar)
    curriculum/ (ModuleList, LessonRow, DnD list)
    quiz/ (QuizRunner, OptionButton, ResultSummary)
    engagement/ (StreakFlame, XpToast, DailyGoal)
    ai/ (TutorDrawer, InsightsCards)
    cert/ (CertificateCanvas)
    ui/
  features/ authSlice, uiSlice, playerUiSlice (speed, focusMode)
  lib/ api, queryKeys, xp.ts
```

**Query keys:** `['org', orgId, 'courses']`, `['enrollment', courseId]`, `['progress', courseId]`, `['quiz', id]`, `['ai','tutor', lessonId]`.

---

## 8. Prisma Schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

enum OrgRole { OWNER ADMIN INSTRUCTOR TA LEARNER }
enum CourseStatus { DRAFT PUBLISHED ARCHIVED }
enum LessonType { VIDEO ARTICLE QUIZ }
enum QuestionType { SINGLE MULTI }
enum EnrollmentStatus { ACTIVE COMPLETED REVOKED }

model Organization {
  id        String @id @default(cuid())
  name      String
  slug      String @unique
  logoUrl   String?
  members   Membership[]
  courses   Course[]
  paths     LearningPath[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  name         String
  avatarUrl    String?
  memberships  Membership[]
  enrollments  Enrollment[]
  progress     LessonProgress[]
  quizAttempts QuizAttempt[]
  streak       UserStreak?
  xpEvents     XpEvent[]
  certificates Certificate[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Membership {
  id             String @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole @default(LEARNER)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([organizationId, userId])
}

model Course {
  id             String @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  slug           String
  title          String
  subtitle       String?
  descriptionMd  String?
  coverUrl       String?
  status         CourseStatus @default(DRAFT)
  level          String?
  durationMins   Int @default(0)
  modules        Module[]
  enrollments    Enrollment[]
  certificates   Certificate[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@unique([organizationId, slug])
}

model Module {
  id        String @id @default(cuid())
  courseId  String
  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title     String
  sortOrder Int @default(0)
  lessons   Lesson[]
}

model Lesson {
  id          String @id @default(cuid())
  moduleId    String
  module      Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title       String
  slug        String
  type        LessonType @default(VIDEO)
  contentMd   String?
  videoUrl    String?
  durationSec Int @default(0)
  sortOrder   Int @default(0)
  quiz        Quiz?
  progress    LessonProgress[]
  @@unique([moduleId, slug])
}

model Enrollment {
  id        String @id @default(cuid())
  courseId  String
  userId    String
  status    EnrollmentStatus @default(ACTIVE)
  enrolledAt DateTime @default(now())
  completedAt DateTime?
  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([courseId, userId])
}

model LessonProgress {
  id          String @id @default(cuid())
  lessonId    String
  userId      String
  completed   Boolean @default(false)
  positionSec Int @default(0)
  completedAt DateTime?
  lesson      Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([lessonId, userId])
}

model Quiz {
  id        String @id @default(cuid())
  lessonId  String @unique
  lesson    Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  title     String
  passScore Int @default(70)
  questions Question[]
  attempts  QuizAttempt[]
}

model Question {
  id         String @id @default(cuid())
  quizId     String
  quiz       Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  type       QuestionType @default(SINGLE)
  promptMd   String
  optionsJson Json // [{id, text, correct}]
  sortOrder  Int @default(0)
  explanationMd String?
}

model QuizAttempt {
  id        String @id @default(cuid())
  quizId    String
  userId    String
  score     Int
  passed    Boolean
  answersJson Json
  createdAt DateTime @default(now())
  quiz      Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserStreak {
  userId         String @id
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  currentStreak  Int @default(0)
  longestStreak  Int @default(0)
  lastActiveDate DateTime?
  xpTotal        Int @default(0)
}

model XpEvent {
  id        String @id @default(cuid())
  userId    String
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount    Int
  reason    String
  createdAt DateTime @default(now())
}

model LearningPath {
  id             String @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  slug           String
  title          String
  courseIds      String[] // ordered course ids MVP
  @@unique([organizationId, slug])
}

model Certificate {
  id           String @id @default(cuid())
  courseId     String
  userId       String
  code         String @unique
  issuedAt     DateTime @default(now())
  course       Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([courseId, userId])
}

model ContentChunkMeta {
  id             String @id @default(cuid())
  organizationId String
  courseId       String
  lessonId       String
  chromaId       String
  createdAt      DateTime @default(now())
  @@index([lessonId])
}
```

---

## 9. NestJS Endpoints

| Method | Path | Notes |
|--------|------|-------|
| Auth | `/auth/*` `/me` | |
| GET | `/catalog/courses` | public published |
| CRUD | `/studio/courses` | instructor |
| CRUD | `/studio/courses/:id/modules` `/lessons` | reorder endpoints |
| POST | `/studio/lessons/:id/ingest` | push text to AI |
| POST | `/enrollments` | enroll self |
| GET/PATCH | `/progress/:lessonId` | position + complete |
| CRUD | `/quizzes` + questions | |
| POST | `/quizzes/:id/attempts` | grade server-side |
| GET | `/me/streak` | |
| POST | `/ai/tutor` | |
| POST | `/ai/quiz-generate` | |
| GET | `/ai/insights/:courseId` | |
| POST | `/certificates/issue` | on 100% or manual |
| GET | `/certificates/:code` | public verify |
| GET | `/analytics/course/:id` | |

**XP rules:** +10 lesson complete, +25 quiz pass, +5 daily first activity; streak +1 if activity on calendar day (org timezone).

---

## 10. AI Service

### Routes
| POST | `/v1/content/ingest` | `{ orgId, courseId, lessonId, text }` → chunk/embed `course_{orgId}` metadata filtered |
| POST | `/v1/tutor/chat` | `{ orgId, lessonId, message, history }` → answer + citations; **no spoilers** for quiz answers |
| POST | `/v1/quiz/generate` | `{ lessonText, count, difficulty }` → questions JSON |
| POST | `/v1/insights/progress` | `{ courseStats }` → narrative + risk learners |

### Tutor system prompt
“You are Learnora Tutor. Answer using ONLY provided context chunks from this lesson/course. If unknown, say so. Encourage the learner; do not reveal quiz answer keys. Cite lesson section titles.”

### Quiz generate prompt
“Create unambiguous MCQs with 4 options, one correct, short explanation. Return JSON array.”

### Insights prompt
“Given completion rates and quiz averages per lesson, identify drop-off points and 3 actionable instructor tips.”

---

## 11. Reporting

- Learner: course % , XP, streak heatmap.
- Instructor: enrollment funnel, lesson completion curve, quiz avg, AI insights card.
- Admin: seats used, courses published.

---

## 12. Security / Perf / A11y / i18n

- Grade quizzes server-side only (never trust client correct flags).
- Signed enrollment checks on lesson/AI routes.
- Stream large markdown; cache catalog.
- Player captions track support; keyboard shortcuts documented.
- English MVP; RTL-ready layout stretch.

---

## 13. Milestones

1. Auth/org/catalog/enroll  
2. Curriculum builder + player + progress  
3. Quizzes + XP/streaks  
4. Certificates  
5. AI ingest + tutor  
6. Quiz gen + insights  
7. Analytics polish + seed demo academy  

---

## 14. Acceptance Checklist

- [ ] Completing all lessons issues certificate with public code  
- [ ] Quiz graded on server; failing does not complete lesson unless configured  
- [ ] Streak increments once per local day with activity  
- [ ] AI tutor refuses questions outside ingested content  
- [ ] Instructor can reorder lessons and publish course  
- [ ] Learner cannot access unpublished courses  
- [ ] Cross-org content isolated  
- [ ] Docker + migrate + seed works  
