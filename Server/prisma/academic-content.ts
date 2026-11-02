/** Authored course readings shared by the seed and the non-destructive content updater. */
const readings: Record<string, [string, string, string]> = {
  'design-your-semester': [
    'A useful semester plan connects a broad intention to a repeatable weekly action. Separate fixed commitments, deadlines, preparation, and recovery. Reserve space for unexpected work rather than allocating every available hour.',
    'Instead of "get better at statistics," Mina chooses "solve five unfamiliar probability questions on Tuesday, check the solutions, and revisit errors on Friday." The result can be observed and the next session is already scheduled.',
    'List three deadlines. Work backward from each to a first draft or practice attempt. Put two 25-minute sessions in your calendar and write the output you expect from each.',
  ],
  'retrieval-practice': [
    'Retrieval means producing an answer from memory before checking it. Recognizing a familiar sentence is a different task from explaining the idea without the sentence in front of you. Use feedback after a sincere attempt so errors become material for the next review.',
    'After reading about opportunity cost, Mina closes her notes and explains a choice between a paid shift and a seminar. She checks her explanation, notices that she omitted the next-best alternative, and adds a new question about that distinction.',
    'Close your notes. Write three questions about the last lesson and answer them from memory. Check each answer, correct it in a different color, and schedule another attempt.',
  ],
  'spacing-interleaving': [
    'Spacing distributes encounters with an idea across separate sessions. Interleaving mixes related problem types so that you must decide which approach fits. Start with enough focused practice to understand each approach, then mix tasks and inspect your choice of method.',
    'Mina practises three hypothesis-test examples, returns two days later, then mixes those questions with confidence-interval problems. Before calculating, she writes why each question calls for a particular method.',
    'Choose two related concepts. Make one question for each, leave a gap before answering, and explain how you decided which concept applied. Adjust the next review based on your errors.',
  ],
  'reading-with-a-question': [
    'Before reading, identify the task the text needs to help you complete. Inspect the assignment verb: compare, evaluate, explain, and argue require different kinds of evidence. Preview the abstract and headings to decide where close reading is needed.',
    'An essay asks Mina to evaluate a policy. She reads the study for its outcome measures and limitations rather than collecting every historical detail. Her notes explicitly connect each finding to a criterion for evaluation.',
    'Copy the assignment question. Underline its main verb. Write two questions the reading should answer, then read one section and record only evidence relevant to those questions.',
  ],
  'claim-evidence-map': [
    'A claim is something an author asks you to accept. Evidence is what they offer in support. An assumption connects the two, sometimes without being stated. Keep a record of all three so you can evaluate the reasoning rather than only summarize the text.',
    'An article recommends longer library hours because evening attendance increased. Mina records the attendance count as evidence and flags the assumption that attendance represents unmet demand rather than a temporary event.',
    'Choose one paragraph. Label its main claim, the evidence offered, and an unstated assumption. Write what additional information would make the claim more convincing.',
  ],
  'synthesizing-sources': [
    'Synthesis organizes sources around a shared question rather than presenting one summary after another. Compare what authors studied, how they studied it, and where their explanations agree or diverge. Apparent disagreement may reflect different populations or measures.',
    'One study reports that online discussion helps participation; another finds little benefit. Mina notices that the first measures contributions and the second measures exam performance. Her synthesis distinguishes engagement from demonstrated understanding.',
    'Create a three-column matrix for two sources: claim, method, limitation. Write a paragraph explaining one agreement and one tension, with a specific reference to the evidence.',
  ],
  'working-thesis': [
    'A working thesis makes a specific claim that reasonable readers could question. It should match the scope of the evidence and identify the reasoning your paper will develop. Treat it as provisional: revise it when analysis reveals a stronger or narrower conclusion.',
    '"Libraries are important" becomes "Extending library hours during assessment weeks would better serve commuting students, provided staffing is based on demonstrated evening demand." The revised claim has a population, a condition, and a testable basis.',
    'Draft a thesis for a current assignment. Circle vague terms, specify the population or context, and write the strongest reasonable objection. Revise the claim to respond to that objection.',
  ],
  'paragraph-architecture': [
    'A strong analytical paragraph establishes a claim, introduces evidence, explains how the evidence supports the claim, and connects the result to the larger argument. The analysis does the intellectual work: a quotation cannot explain its own significance.',
    'Mina opens a paragraph with a claim about commuting constraints, supplies survey evidence, then explains why travel time changes access to evening study. Her final sentence links that analysis to the proposed library schedule.',
    'Color-code one paragraph: claim, evidence, analysis, connection. Add two sentences explaining what the evidence shows and why it matters. Remove any detail that does not support the paragraph claim.',
  ],
  'revision-plans': [
    'Global revision changes the argument, structure, scope, or evidence. Local editing improves sentence clarity and correctness. Work on the largest unresolved issue first; polishing a paragraph that later needs removal is an expensive distraction.',
    'Feedback says Mina has interesting sources but no clear position. She first rewrites the thesis and reorganizes the outline around three reasons. Only after testing the new sequence does she edit wording and citations.',
    'Write a reverse outline with one sentence per paragraph. Identify a missing reason, an unsupported claim, and a misplaced section. Rank the changes by their effect on meaning and complete the first one.',
  ],
  'exam-blueprint': [
    'An exam blueprint maps assessed topics against the kinds of thinking required. Allocate practice to both importance and your current uncertainty. Use the syllabus and past feedback to identify whether you need to recall, explain, apply, compare, or evaluate.',
    'Mina sees that half the exam requires interpreting unfamiliar data. She keeps some definition review but shifts most practice to explaining graphs and choosing appropriate methods. Her plan reflects the assessment rather than the comfort of familiar notes.',
    'Make a table of topics, expected question types, confidence, and next practice task. Choose one high-value weak area and write a question that tests application rather than recognition.',
  ],
  'productive-pressure': [
    'Timed practice is a diagnostic tool. Introduce realistic constraints gradually and review the cause of each difficulty: missing knowledge, method selection, calculation, interpretation, or time allocation. A score is less useful than knowing what to change.',
    'Mina attempts one exam question in twelve minutes. Her reasoning is sound but she spends too long rewriting the introduction. On the next attempt she drafts a two-line plan and moves straight to the evidence.',
    'Attempt one representative question with a timer. Mark the point where you slowed down, compare against a rubric, and repeat after changing one part of your process.',
  ],
  'assessment-recovery': [
    'A post-assessment review separates the result from an explanation of the result. Classify errors before choosing a response. Relearning content, practising a method, and managing time solve different problems; avoid prescribing more hours without diagnosing the gap.',
    'Mina loses marks despite remembering the definitions. Her answers did not connect evidence to conclusions. She asks her instructor to review one response, then practises writing the missing reasoning under a short time limit.',
    'Choose two lost-mark questions. Classify each error, write a corrected response, and create one new practice question that tests the same reasoning in a different context.',
  ],
  'scope-research-question': [
    'An answerable research question identifies a phenomenon, a population or setting, and a feasible kind of evidence. Narrowing is a design decision. Ask what you could actually observe with the time, access, and permissions available.',
    '"Does technology improve education?" becomes "How do first-year commuting students describe using recorded lectures when preparing for seminars?" The second question can guide a small interview study without pretending to estimate a universal effect.',
    'Write a broad topic, then specify who, where, and what could be observed. State the evidence you can realistically obtain and revise the question to fit it.',
  ],
  'variables-operationalization': [
    'An operational definition states how a concept will be observed or measured. A measure is an imperfect representation of a concept. Distinguish the construct you care about from the indicator you collect and explain what the indicator leaves out.',
    'A project about engagement counts weekly forum posts. Mina notes that post frequency captures visible participation but misses reading, private study, and the quality of contributions. She adds a brief reflection question to give the count context.',
    'Choose a concept in your question. Propose two observable indicators, describe the data each would produce, and explain one limitation of each indicator.',
  ],
  'source-trails': [
    'A reproducible search records databases, search terms, filters, and the date searched. Use concept groups and synonyms to avoid treating one phrase as the entire topic. Citation trails help identify related work but should complement a deliberate search.',
    'Mina searches for (commuter OR commuting) AND (student OR undergraduate) AND (participation OR engagement). She records the query, screens abstracts against explicit criteria, and notes why she excludes unrelated workplace studies.',
    'Create synonym groups for two concepts. Run a search in a library database, record the exact query and filters, and document why you keep three results.',
  ],
  'sampling-representation': [
    'A sample describes the people or cases actually observed. A target population describes whom you hope to say something about. Recruitment, nonresponse, and exclusions can make the sample systematically different from that population.',
    'An evening library survey includes students already using the building. Mina points out that commuters who leave campus early are missing. A larger count at the same entrance would not automatically fix that coverage problem.',
    'Write your target population, recruitment method, and likely exclusions. Explain how one excluded group could change the interpretation and propose a feasible improvement.',
  ],
  'causation-confounds': [
    'Association means variables vary together. A causal interpretation needs a design and argument that address alternative explanations, including reverse direction and confounding. Naming a possible confound is the beginning of an analysis, not a complete correction.',
    'Students attending optional tutorials score higher. Prior preparation may affect both attendance and scores, so the comparison alone cannot establish that tutorials caused the difference. Mina proposes measuring baseline preparation and explains the limits that remain.',
    'Draw a three-variable diagram for attendance, preparation, and exam score. Explain two possible directions of influence and identify what additional design or evidence would help distinguish them.',
  ],
  'qualitative-interpretation': [
    'Qualitative analysis examines meaning in context. Codes organize segments of material; themes express patterns relevant to the research question. Keep a trail from interpretation back to specific excerpts and actively look for cases that challenge a developing theme.',
    'Interviewees describe recorded lectures as flexibility, but one reports that recordings make it easier to fall behind. Mina includes the contrary case and revises her theme to explain both support and the need for a study routine.',
    'Code a short interview excerpt with two descriptive labels. Propose a theme, identify the evidence supporting it, and write one question that would test an alternative interpretation.',
  ],
  'responsible-results': [
    'A responsible conclusion matches the design, sample, measures, and uncertainty of a study. Describe what was observed before explaining what it may mean. Avoid converting a limited association into a universal recommendation.',
    'A small survey finds that respondents prefer evening access. Mina reports that preference among respondents, describes recruitment, and avoids claiming that longer hours would improve grades. Preference, use, and educational benefit are distinct outcomes.',
    'Rewrite a strong claim from an article in narrower language. Specify the population, measure, and uncertainty, then state one conclusion the study cannot support.',
  ],
  'methods-limitations': [
    'A methods section explains what was done well enough for a reader to assess the process. A limitations section explains how design choices restrict interpretation. Pair a limitation with its consequence rather than listing generic weaknesses.',
    'Mina reports interview recruitment, question development, recording consent, and coding procedures. She explains that recruiting from one seminar limits the range of student experiences represented, rather than merely saying the sample was small.',
    'Draft a methods outline with recruitment, data collection, and analysis. Add two limitations and explain exactly which claims each one restricts.',
  ],
  'claims-and-reasons': [
    'An argument offers reasons for accepting a conclusion. A statement of opinion may have no supporting reason; an explanation may assume the event occurred and account for why. Identify the role of each sentence before deciding whether the reasoning succeeds.',
    '"The library should open later because many students commute" contains a recommendation and a reason. Mina asks how commuting connects to opening hours, revealing a missing premise about when those students can use the library.',
    'Find a short opinion paragraph. Underline its conclusion, number the supporting reasons, and write an unstated premise needed to connect one reason to the conclusion.',
  ],
  'charitable-interpretation': [
    'Charitable interpretation reconstructs the strongest reasonable version of an argument consistent with the text. It requires accurate attribution and fair context. Strengthening an argument does not mean inventing evidence or silently replacing its central claim.',
    'A writer criticizes online classes for reducing contact. Mina reconstructs the concern as a claim about opportunities for timely feedback, then evaluates that claim rather than dismissing the writer as opposed to technology.',
    'Write a three-sentence reconstruction of a view you disagree with. Ask whether its author would recognize it, identify its strongest reason, and respond to that reason directly.',
  ],
  'assumptions-definitions': [
    'Arguments depend on meanings and background commitments. An assumption may be factual, evaluative, or definitional. Clarify contested terms before debating a conclusion, because two people may use the same word for different standards.',
    'A proposal promises "better access." Mina asks whether access means longer opening hours, disability accommodation, remote availability, or affordable travel. Each definition implies a different measure of success.',
    'Choose a contested term in an argument. Write two plausible definitions, show how each changes the claim, and state which definition your own analysis will use.',
  ],
  'source-credibility': [
    'Evaluate relevant expertise, the evidence-producing method, incentives, and fit to the claim. A reputable source can be cited for a claim it does not support. Read beyond the headline and distinguish the original study from later commentary.',
    'A respected researcher comments on student motivation, but the linked study measures platform visits. Mina checks the original methods and avoids citing the comment as evidence about motivation itself.',
    'Trace one claim to its original source. Record author expertise, method, population, and the exact outcome measured. Explain whether it supports the claim as stated.',
  ],
  'reasoning-errors': [
    'A reasoning error matters because it weakens the connection between reasons and conclusion. Explain that weakness in context instead of using a label as a substitute for analysis. Check whether the suspected error is actually relevant to the argument.',
    'An argument rejects a scheduling proposal because its author once missed a deadline. Mina explains why that history does not address whether the proposed schedule meets student needs, then evaluates the schedule using relevant evidence.',
    'Find a questionable inference. Reconstruct it fairly, identify the unsupported step, and write the additional evidence that would be needed to make that step reasonable.',
  ],
  counterarguments: [
    'A useful counterargument targets a central premise, inference, or implication. Address its strongest version, concede what it establishes, and revise the claim where necessary. A qualified conclusion can be more defensible than a categorical one.',
    'Mina supports later library hours but acknowledges staffing costs. She narrows her recommendation to assessment weeks and proposes reviewing attendance before expanding the schedule.',
    'State your position and the strongest objection to it. Separate what you can answer from what you must concede. Rewrite your thesis with one justified qualification.',
  ],
  'line-of-reasoning': [
    'A line of reasoning orders claims so each step gives the reader a basis for the next. Organize around reasons rather than source names. Signpost the relationship between steps: support, contrast, qualification, or consequence.',
    'Mina first establishes an access problem, then evaluates possible responses, then defends a limited pilot. This sequence lets a reader assess the need before being asked to accept a solution.',
    'Write a five-line argument outline. Label the function of each line and explain why it must appear before the next. Remove a step that does not advance the conclusion.',
  ],
  'warrants-and-stakes': [
    'A warrant explains why a piece of evidence supports a claim. Stakes explain why the claim matters in the chosen context. Make both explicit when a reader could reasonably question the connection or significance.',
    'Survey evidence shows students arrive after work. Mina supplies the warrant: a service unavailable at those times cannot meet that demand. The stakes are equitable participation for students with employment commitments.',
    'Choose one statistic in your draft. Write a sentence explaining its connection to the claim and another explaining the practical consequence if the claim is accepted.',
  ],
  'audit-your-week': [
    'A time audit records the week you actually have. Include classes, employment, commuting, care responsibilities, meals, and recovery. Estimate usable focus time conservatively and distinguish fixed commitments from choices you can adjust.',
    'Mina has two free hours between classes, but lunch and travel leave only forty usable minutes. She schedules one defined reading task rather than a full essay draft and avoids building a plan on imaginary time.',
    'Map a typical weekday in half-hour blocks. Identify one realistic focus window, one source of friction, and one commitment that needs a buffer. Plan a specific output for that window.',
  ],
  'energy-aware-planning': [
    'The difficulty of a task and your readiness for it both matter. Observe your own patterns before assigning demanding work. Keep the plan flexible: energy varies and a useful routine includes an easier fallback task.',
    'Mina notices she can analyze readings before lunch but struggles after an evening shift. She reserves mornings for argument planning and uses lower-energy periods to format references and prepare materials.',
    'Track energy alongside tasks for three days. Pick one demanding task for a reliable focus period and define a lower-effort alternative for a day when that period does not go to plan.',
  ],
  'trusted-task-system': [
    'A trusted task system captures commitments outside your head, clarifies the next observable action, and gets reviewed regularly. Separate a project from its next action. "Write dissertation" is a project; "draft three interview questions" is an action.',
    "Mina keeps one inbox for tasks, processes it each afternoon, and selects tomorrow's first action. She includes the file and materials needed so starting does not require rediscovering the plan.",
    'Capture every open academic task in one place. Rewrite three vague items as actions that produce a visible result. Choose one for tomorrow and schedule a five-minute review.',
  ],
  'starting-rituals': [
    'A starting ritual reduces the number of decisions before work begins. Tie a clear cue to preparing the environment and completing a small first action. Keep the ritual short enough that it does not become a substitute for the work.',
    "After her morning class, Mina goes to the same desk, silences notifications, opens her draft, and writes one sentence stating the next paragraph's claim. That action starts the session even when she feels uncertain.",
    'Choose a cue, a location, and a two-minute first action for a current task. Test the ritual once and remove any setup step that did not help you begin.',
  ],
  'focus-and-recovery': [
    'A focus session has a specific task, a manageable boundary, and a stopping point. Breaks should help you return with attention rather than introduce an unbounded competing task. Adjust session length to the work and your actual response.',
    'Mina works on one paragraph for twenty-five minutes, records the next sentence she needs, then takes a short walk. Leaving a restart note makes the second session easier to enter.',
    'Choose one output for a focused block. Remove one distraction, work for a manageable interval, and write a restart note before a short recovery break. Evaluate what helped.',
  ],
  'digital-boundaries': [
    'An environment can make an interruption more or less likely. Reduce unnecessary cues and add friction to distractions before relying on willpower. Preserve access to tools you genuinely need and define exceptions for urgent communication.',
    'Mina keeps her research database open, places her phone out of reach, and closes social tabs for a writing session. She tells her household when she will check messages rather than expecting them to guess.',
    'List the three interruptions that most often break a session. Change one notification setting, one physical arrangement, and one communication expectation. Try the new setup for a single block.',
  ],
  'ask-for-support': [
    "An effective support request states the task, what you tried, the specific difficulty, and what kind of help would move you forward. Ask early enough that a response can still change the outcome. Use the course's published support channels.",
    'Mina writes: "I can summarize the two studies, but I am unsure how to compare their methods. I drafted a comparison table. Could you tell me whether my choice of criteria fits the assignment?" This invites focused feedback.',
    'Draft a short message about a current obstacle. Include your deadline, an attempted solution, and one precise question. Identify the appropriate person or course channel before sending it.',
  ],
  'reset-after-missed-week': [
    "A reset begins with current obligations rather than attempting to repay every missed hour. Identify what remains relevant, renegotiate what cannot be completed, and choose the smallest useful restart. A plan should reflect today's capacity.",
    'After missing a week, Mina checks upcoming deadlines and asks which missed activity matters for the next assessment. She completes one essential reading and schedules a short check-in instead of planning an unrealistic all-night catch-up.',
    'List outstanding work as essential now, useful later, or no longer relevant. Pick one essential action you can finish today. Write a realistic plan for the next two study sessions.',
  ],
  'analytics-limits': [
    'Learning data records selected interactions, not the whole learning experience. A low activity count may reflect offline work, accessibility needs, or a confusing interface. Use metrics to ask better questions before judging an individual.',
    'A learner has few video plays but strong written assessments. Mina investigates how the learner uses transcripts instead of treating watch time as proof of disengagement.',
    'Choose one dashboard metric. Write what it measures, what it omits, and two different explanations for a low value. Identify additional evidence needed before acting.',
  ],
  'dashboard-question': [
    'Begin an analytics view with a decision and its audience. A useful metric changes what someone can do next. Define the measure, its time window, and the context needed to interpret it responsibly.',
    'An instructor wants to know which quiz concept needs review. Mina groups errors by question and concept, then compares them with discussion questions rather than presenting only a total completion count.',
    'Write a decision the teaching team needs to make. Choose two measures that inform it, state their limitations, and sketch the next action for each possible result.',
  ],
};

export function authoredLesson(title: string, slug: string, topic: string) {
  const entry = readings[slug];
  if (!entry)
    return `# ${title}\n\n## Before the checkpoint\nReview your notes on ${topic}. Try explaining the central ideas without looking back, then identify one place where you still need practice.\n\n## Make your preparation visible\n1. Write a short explanation of each module in your own words.\n2. Choose one example from your own academic work.\n3. Compare your answer to the lesson notes and correct any gaps.\n\n## Assessment\nOpen the checkpoint quiz to apply the course concepts. Read each scenario carefully. After submitting, use the feedback to choose which lesson to revisit. A passing result requires at least 70%.`;
  const [concept, example, exercise] = entry;
  return `# ${title}\n\n## The idea\n${concept}\n\n## A worked example\n${example}\n\n## Put it into practice\n${exercise}\n\n### Your study record\n- **Starting point:** What task or question are you working on?\n- **Attempt:** Record your response before checking the lesson again.\n- **Evidence:** What shows whether the approach helped?\n- **Next step:** What will you repeat or change in your next session?\n\n## Check your understanding\nExplain the idea to someone who has not taken this lesson. Use your own example, identify a limitation, and describe when you would choose a different approach.\n\n## Reflection\nWhat changed between your first attempt and your revised response? Keep both in your study notes so you can see the reasoning behind your progress.`;
}

type CheckpointQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
};
export const checkpointQuestions: Record<string, CheckpointQuestion[]> = {
  'academic-success-lab': [
    {
      prompt:
        'After reading a chapter, which task best checks whether you can retrieve the idea?',
      options: [
        'Highlight the most familiar sentences',
        'Close the book and explain the central claim in your own words',
        'Read the chapter again immediately',
        'Copy the glossary into your notes',
      ],
      correct: 1,
      explanation:
        'An explanation produced before looking back makes gaps visible. Check it against the material afterward.',
    },
    {
      prompt:
        'Your draft has no clear thesis, but several sentences are awkward. What should you revise first?',
      options: [
        'Punctuation',
        'The reference list font',
        'The central claim and order of supporting reasons',
        'Only the first sentence',
      ],
      correct: 2,
      explanation:
        'Global revisions determine the argument and structure. Sentence editing is more useful after that structure is sound.',
    },
    {
      prompt:
        'Two sources seem to disagree. What is the strongest first step toward synthesis?',
      options: [
        'Compare their populations, measures, and methods',
        'Choose the newer source automatically',
        'Give each source a separate summary and stop',
        'Ignore both sources',
      ],
      correct: 0,
      explanation:
        'Different methods or outcomes can explain an apparent conflict. Synthesis examines the relationship between sources.',
    },
    {
      prompt:
        'A timed practice answer loses marks because the evidence is never explained. What is the most targeted next action?',
      options: [
        'Spend twice as long memorizing definitions',
        'Avoid timed questions',
        'Rewrite every note',
        'Practise connecting evidence to the claim and compare with the rubric',
      ],
      correct: 3,
      explanation:
        'The diagnosed gap is analysis. Focused practice should address that gap rather than merely increasing study time.',
    },
  ],
  'research-methods-foundations': [
    {
      prompt:
        'Which is the most feasible question for a small interview study?',
      options: [
        'Does technology improve all education?',
        'What causes every student to succeed?',
        'How do first-year commuters describe using recorded lectures?',
        'Which teaching method is universally best?',
      ],
      correct: 2,
      explanation:
        'The question specifies a population, a context, and an experience that interviews can explore.',
    },
    {
      prompt:
        'Tutorial attendees earn higher marks. Why is that association insufficient to establish that tutorials caused the improvement?',
      options: [
        'Marks cannot be measured',
        'Prior preparation could influence both attendance and marks',
        'An association is always false',
        'A larger chart would prove causation',
      ],
      correct: 1,
      explanation:
        'A plausible confound can explain the association. The design must address alternative explanations before a causal claim is justified.',
    },
    {
      prompt:
        'A library survey recruits only current evening visitors. Which group is most clearly underrepresented?',
      options: [
        'Students who are unable to visit in the evening',
        'Students currently in the library',
        'Students who answered the survey',
        'Students who read the recruitment notice',
      ],
      correct: 0,
      explanation:
        'The recruitment setting misses people whose access constraints prevent them from being there.',
    },
    {
      prompt: 'What makes a limitations section informative?',
      options: [
        'Stating that every study has limitations',
        'Apologizing for the sample',
        'Omitting inconvenient evidence',
        'Explaining how a design choice restricts a particular conclusion',
      ],
      correct: 3,
      explanation:
        'A limitation is useful when the reader can see its consequence for interpretation.',
    },
  ],
  'critical-thinking-argument': [
    {
      prompt:
        'In "The library should stay open later because commuters arrive after work," which part is the conclusion?',
      options: [
        'Commuters arrive after work',
        'The library should stay open later',
        'Some people commute',
        'Work finishes in the evening',
      ],
      correct: 1,
      explanation:
        'The recommendation is what the argument asks the reader to accept; the arrival pattern is offered as a reason.',
    },
    {
      prompt:
        'What is the best response to a strong counterargument about staffing costs?',
      options: [
        "Question the critic's character",
        'Repeat the original claim more forcefully',
        'Ignore the cost evidence',
        'Consider a limited pilot and qualify the recommendation',
      ],
      correct: 3,
      explanation:
        'A justified qualification can preserve the supported part of a position while addressing a legitimate objection.',
    },
    {
      prompt:
        'A famous author cites a study as proof that motivation improved, but the study only counted visits. What should you check?',
      options: [
        'Whether the measured outcome supports the specific claim',
        'Only how famous the author is',
        'Only the article length',
        'Whether the headline sounds persuasive',
      ],
      correct: 0,
      explanation:
        'Relevant expertise does not replace checking what the underlying evidence actually measures.',
    },
    {
      prompt: 'What is the function of a warrant?',
      options: [
        'It lists the bibliography',
        'It restates an opposing view',
        'It explains why the evidence supports the claim',
        'It guarantees the argument is true',
      ],
      correct: 2,
      explanation:
        'The warrant makes the inferential connection between the evidence and the claim explicit.',
    },
  ],
  'study-systems-wellbeing': [
    {
      prompt: 'Which item is a useful next action rather than a large project?',
      options: [
        'Finish university',
        'Write dissertation',
        'Draft three interview questions in the research document',
        'Become organized',
      ],
      correct: 2,
      explanation:
        'A next action names a concrete output and can be started without another round of project planning.',
    },
    {
      prompt:
        'You have two hours between classes, including lunch and commuting. What is the most realistic approach?',
      options: [
        'Plan from the usable focus time remaining after those commitments',
        'Treat the full two hours as uninterrupted writing',
        'Skip every break',
        'Assume an essay can be finished',
      ],
      correct: 0,
      explanation:
        'A workable schedule accounts for the actual commitments inside a nominally free block.',
    },
    {
      prompt: 'After a missed week, what is the most useful first step?',
      options: [
        'Repay every missed hour immediately',
        'Identify essential current tasks and choose one feasible restart',
        'Wait until motivation returns',
        'Abandon the course',
      ],
      correct: 1,
      explanation:
        'A reset reflects current obligations and capacity. It starts with a meaningful action rather than an impossible catch-up plan.',
    },
    {
      prompt: 'Which support request is most actionable?',
      options: [
        'I do not understand anything',
        'Please fix my work',
        'This course is too hard',
        'I drafted a comparison table; could you check whether its criteria fit the assignment?',
      ],
      correct: 3,
      explanation:
        'The request shows an attempt, identifies the specific uncertainty, and asks for a focused form of feedback.',
    },
  ],
};
