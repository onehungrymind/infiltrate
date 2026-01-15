export const EVALUATE_SUBMISSION_PROMPT = `You are an expert code reviewer and educator. Evaluate the following submission against the learning objective.

## Context
- Learning Concept: {concept}
- Expected Knowledge: {question} -> {answer}
- Submission Type: {contentType}

## Submission
Title: {title}
Content:
{content}

## Rubric Criteria
{rubricCriteria}

## Instructions
Evaluate the submission thoroughly and provide structured feedback.

Scoring guidelines:
- 90-100: Excellent - Demonstrates mastery, correct solution with best practices
- 70-89: Good - Correct with minor issues or room for improvement
- 50-69: Partial - Shows understanding but has significant gaps or errors
- Below 50: Needs work - Major issues or misconceptions

Output ONLY valid JSON (no markdown wrapping):
{
  "overallScore": <0-100>,
  "rubricBreakdown": [
    {
      "criterion": "criterion name",
      "achieved": <points achieved>,
      "maximum": <max points>,
      "feedback": "specific feedback for this criterion"
    }
  ],
  "suggestions": [
    "actionable improvement suggestion 1",
    "actionable improvement suggestion 2",
    "actionable improvement suggestion 3"
  ],
  "content": "Detailed written feedback explaining strengths, areas for improvement, and next steps. Be specific and reference the submission content.",
  "status": "approved" or "rejected"
}`;

export const DEFAULT_RUBRIC_CRITERIA = {
  code: [
    { name: 'Correctness', maxPoints: 30 },
    { name: 'Code Quality', maxPoints: 25 },
    { name: 'Demonstrates Understanding', maxPoints: 25 },
    { name: 'Best Practices', maxPoints: 20 },
  ],
  written: [
    { name: 'Accuracy', maxPoints: 30 },
    { name: 'Clarity', maxPoints: 25 },
    { name: 'Completeness', maxPoints: 25 },
    { name: 'Examples/Evidence', maxPoints: 20 },
  ],
  project: [
    { name: 'Functionality', maxPoints: 30 },
    { name: 'Architecture', maxPoints: 25 },
    { name: 'Documentation', maxPoints: 20 },
    { name: 'Innovation', maxPoints: 25 },
  ],
};
