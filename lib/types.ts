export type SessionStatus =
  | "deposition"
  | "casefile"
  | "selecting"
  | "trial"
  | "testify"
  | "verdict"
  | "adjourned"
  | "stopped";

export type Speaker = "user" | "clerk" | "court" | "accusations";

export type CaseFile = {
  title: string;
  problem: string;
  roles: string[];
  recurringPattern: string;
  pressurePoints: string[];
  desiredAuthority: string;
};

export type CourtStep =
  | "name"
  | "deny"
  | "renounce"
  | "resist"
  | "declare"
  | "stand"
  | "seal";

export type CourtEvaluation = {
  step: CourtStep;
  passed: boolean;
  groundGiven: boolean;
  groundType?: "excuse" | "blame" | "arguing" | "accepting_label" | "show_of_gifting" | "mockery" | "none";
  guidance: string;
  accusationInstruction: string;
  completeCharge: boolean;
  stopReason?: string;
};

export type Score = {
  completedCharges: number;
  groundGiven: number;
  steps: Record<CourtStep, number>;
  teaching: string[];
};

export type Message = {
  id: number;
  session_id: string;
  speaker: Speaker;
  content: string;
  created_at: string;
};

export type PracticeSession = {
  id: string;
  user_id: string;
  status: SessionStatus;
  case_file: CaseFile | null;
  charges: string[] | null;
  current_charge: number;
  ground_given: number;
  score: Score | null;
  created_at: string;
};
