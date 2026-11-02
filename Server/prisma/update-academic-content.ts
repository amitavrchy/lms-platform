import 'dotenv/config';
import { PrismaClient, LessonType, QuestionType } from '@prisma/client';
import { authoredLesson, checkpointQuestions } from './academic-content.js';

// Update only authored demo lessons. Enrollment, progress, quiz attempts, and IDs stay intact.
const prisma = new PrismaClient();
async function main() {
  const courses = await prisma.course.findMany({
    where: {
      organization: { slug: 'learnora' },
      slug: {
        in: [
          ...Object.keys(checkpointQuestions),
          'learning-analytics-workshop',
        ],
      },
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quiz: {
                include: { questions: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
    },
  });
  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const course of courses) {
      if (course.coverUrl?.includes('learnora.example'))
        await tx.course.update({
          where: { id: course.id },
          data: { coverUrl: null },
        });
      for (const mod of course.modules)
        for (const lesson of mod.lessons) {
          const sampleVideo = lesson.videoUrl?.includes(
            'gtv-videos-bucket/sample/',
          );
          await tx.lesson.update({
            where: { id: lesson.id },
            data: {
              contentMd: authoredLesson(lesson.title, lesson.slug, mod.title),
              ...(sampleVideo
                ? {
                    type: LessonType.ARTICLE,
                    videoUrl: null,
                    transcriptMd: null,
                  }
                : {}),
              ...(lesson.resourceUrl?.includes('learnora.example')
                ? { resourceUrl: null }
                : {}),
            },
          });
          if (lesson.quiz && checkpointQuestions[course.slug]) {
            for (const [index, q] of checkpointQuestions[
              course.slug
            ].entries()) {
              const existing = lesson.quiz.questions[index];
              const data = {
                type: QuestionType.SINGLE,
                promptMd: q.prompt,
                sortOrder: index,
                explanationMd: q.explanation,
                optionsJson: q.options.map((text, i) => ({
                  id: String.fromCharCode(97 + i),
                  text,
                  correct: i === q.correct,
                })),
              };
              if (existing)
                await tx.question.update({ where: { id: existing.id }, data });
              else
                await tx.question.create({
                  data: { quizId: lesson.quiz.id, ...data },
                });
            }
          }
          updated++;
        }
    }
  });
  console.log(
    `Updated ${updated} lessons across ${courses.length} courses. Existing learner records preserved.`,
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
