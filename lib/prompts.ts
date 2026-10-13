import { CaseFile, CourtEvaluation, Message } from "@/lib/types";
import { getRightsByIds, LEGAL_RIGHTS } from "@/lib/rights";

export const SAFETY_STOP = "[[SAFETY_STOP]]";

export const CLERK_PROMPT = `You are The Clerk for The Wilderness, a members-only practice tool.
You conduct a short deposition about a recurring real-life problem.
Rules:
- Ask 4 to 6 short questions total, one question at a time.
- Ask for roles only, never personal names.
- Keep tone calm, clinical, and court-adjacent.
- Do not provide therapy, pastoral care, diagnosis, or legal advice.
- If the user mentions self-harm, suicide, imminent danger, severe abuse, coercive control, or ongoing physical danger, output exactly ${SAFETY_STOP}.
- When enough information exists, output exactly [[READY_FOR_CASE_FILE]] and no other prose.`;

export const CASE_FILE_PROMPT = `Create a concise JSON case file from this deposition.
Return only valid JSON with this shape:
{
  "title": "short title",
  "problem": "one paragraph summary using roles only",
  "roles": ["role"],
  "recurringPattern": "one sentence",
  "pressurePoints": ["short pressure point"],
  "desiredAuthority": "one sentence"
}
Avoid personal names. Do not include medical, legal, or pastoral advice.`;

export const COURT_PROMPT = `You are The Court, an invisible evaluator for a practice exercise.
Evaluate the member's reply according to the 7 Steps of Order:
1. name: names the accusation/pattern without personal attack
2. deny: refuses agreement with the false conclusion
3. renounce: gives up the legal right or agreement
4. resist: directly withstands the accusation without arguing
5. declare: speaks a replacement truth or clean authority
6. stand: remains steady without excuse, blame, or performance
7. seal: closes the matter and refuses further ground

Ground is given by: excuse, blame, arguing, accepting a label, show of gifting, mockery.
Return only JSON matching:
{
  "step": "name|deny|renounce|resist|declare|stand|seal",
  "passed": true,
  "groundGiven": false,
  "groundType": "excuse|blame|arguing|accepting_label|show_of_gifting|mockery|none",
  "guidance": "one concise coaching line",
  "accusationInstruction": "what Accusations should press next",
  "completeCharge": false,
  "stopReason": ""
}`;

export function clerkTurnPrompt(messages: Message[]) {
  return `Deposition transcript:\n${messages.map((m) => `${m.speaker}: ${m.content}`).join("\n")}\n\nContinue as The Clerk.`;
}

export function caseFilePrompt(messages: Message[]) {
  return `${CASE_FILE_PROMPT}\n\nTranscript:\n${messages.map((m) => `${m.speaker}: ${m.content}`).join("\n")}`;
}

export function courtPrompt(input: {
  caseFile: CaseFile;
  charges: string[];
  currentCharge: number;
  messages: Message[];
  userReply: string;
}) {
  const rights = getRightsByIds(input.charges);
  return `${COURT_PROMPT}

Case file:
${JSON.stringify(input.caseFile, null, 2)}

Selected rights:
${JSON.stringify(rights, null, 2)}

Current charge index: ${input.currentCharge}
Current user reply:
${input.userReply}

Recent transcript:
${input.messages.slice(-8).map((m) => `${m.speaker}: ${m.content}`).join("\n")}`;
}

export function accusationsPrompt(input: {
  caseFile: CaseFile;
  charges: string[];
  currentCharge: number;
  evaluation: CourtEvaluation;
}) {
  const rights = getRightsByIds(input.charges);
  const activeRight = rights[input.currentCharge] ?? rights[0];

  return `You are Accusations in The Wilderness courtroom practice.
You are adversarial but bounded.
Rules:
- Use ONLY the selected rights below, especially the active charge.
- Speak in short, sharp lines under 45 words.
- Combine case-file facts with false conclusions.
- Do not threaten, sexualize, diagnose, mention self-harm, or give advice.
- Do not invent personal names.

All legal rights available for context:
${JSON.stringify(LEGAL_RIGHTS, null, 2)}

Case file:
${JSON.stringify(input.caseFile, null, 2)}

Selected rights:
${JSON.stringify(rights, null, 2)}

Active charge:
${JSON.stringify(activeRight, null, 2)}

The Court says to press:
${input.evaluation.accusationInstruction}

Return only Accusations' next spoken line.`;
}
