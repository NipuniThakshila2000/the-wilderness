export type Principality = "Jezebel" | "Mammon" | "Leviathan";

export type LegalRight = {
  id: string;
  label: string;
  principality: Principality;
  pattern: string;
};

export const LEGAL_RIGHTS: LegalRight[] = [
  { id: "fear_of_man", label: "Fear of man", principality: "Jezebel", pattern: "Performing, shrinking, or appeasing to avoid rejection." },
  { id: "control", label: "Control", principality: "Jezebel", pattern: "Gripping outcomes instead of standing in clean authority." },
  { id: "manipulation", label: "Manipulation", principality: "Jezebel", pattern: "Using pressure, silence, charm, or guilt to steer others." },
  { id: "false_responsibility", label: "False responsibility", principality: "Jezebel", pattern: "Owning what belongs to another person's will or choices." },
  { id: "people_pleasing", label: "People pleasing", principality: "Jezebel", pattern: "Trading truth for approval or peacekeeping." },
  { id: "victim_identity", label: "Victim identity", principality: "Jezebel", pattern: "Using pain as proof that obedience is impossible." },
  { id: "passive_agreement", label: "Passive agreement", principality: "Jezebel", pattern: "Letting accusation stand because confrontation feels costly." },
  { id: "seduction_of_gifting", label: "Show of gifting", principality: "Jezebel", pattern: "Using talent, anointing, or charisma as cover for disorder." },
  { id: "scarcity", label: "Scarcity", principality: "Mammon", pattern: "Believing provision is too limited to obey freely." },
  { id: "self_preservation", label: "Self-preservation", principality: "Mammon", pattern: "Protecting comfort, reputation, or resources above truth." },
  { id: "comparison", label: "Comparison", principality: "Mammon", pattern: "Measuring worth through rank, output, money, or visibility." },
  { id: "striving", label: "Striving", principality: "Mammon", pattern: "Working for identity rather than from settled sonship." },
  { id: "entitlement", label: "Entitlement", principality: "Mammon", pattern: "Demanding reward, recognition, access, or ease as a right." },
  { id: "debt_pressure", label: "Debt pressure", principality: "Mammon", pattern: "Letting obligation speak louder than wisdom and peace." },
  { id: "greed", label: "Greed", principality: "Mammon", pattern: "Accumulating as protection from fear or insecurity." },
  { id: "transactional_love", label: "Transactional love", principality: "Mammon", pattern: "Giving, serving, or relating to secure a return." },
  { id: "pride", label: "Pride", principality: "Leviathan", pattern: "Refusing correction, vulnerability, or the lower place." },
  { id: "offense", label: "Offense", principality: "Leviathan", pattern: "Rehearsing injury until it becomes a governing lens." },
  { id: "distortion", label: "Distortion", principality: "Leviathan", pattern: "Twisting words, motives, or facts under pressure." },
  { id: "self_justification", label: "Self-justification", principality: "Leviathan", pattern: "Arguing innocence instead of submitting to truth." },
  { id: "mockery", label: "Mockery", principality: "Leviathan", pattern: "Using contempt or sarcasm to avoid sober repentance." },
  { id: "confusion", label: "Confusion", principality: "Leviathan", pattern: "Clouding simple obedience with mental fog or circular analysis." },
  { id: "isolation", label: "Isolation", principality: "Leviathan", pattern: "Withdrawing from healthy witness, authority, and counsel." },
  { id: "false_peace", label: "False peace", principality: "Leviathan", pattern: "Calling avoidance wisdom because conflict feels unsafe." },
  { id: "shame", label: "Shame", principality: "Jezebel", pattern: "Accepting a condemning name instead of receiving correction." },
  { id: "rebellion", label: "Rebellion", principality: "Jezebel", pattern: "Resisting rightful order because authority has felt unsafe." },
  { id: "envy", label: "Envy", principality: "Mammon", pattern: "Resenting another's portion as evidence of personal lack." },
  { id: "double_mindedness", label: "Double-mindedness", principality: "Mammon", pattern: "Keeping a hidden escape clause while claiming agreement." },
  { id: "suspicion", label: "Suspicion", principality: "Leviathan", pattern: "Treating uncertainty as proof of hostile intent." },
  { id: "accusation", label: "Accusation", principality: "Leviathan", pattern: "Prosecuting others internally to avoid personal surrender." },
  { id: "despair", label: "Despair", principality: "Leviathan", pattern: "Agreeing that change is impossible or authority is pointless." },
  { id: "delay", label: "Delay", principality: "Mammon", pattern: "Postponing obedience until conditions feel profitable or safe." }
];

export function getRightsByIds(ids: string[]) {
  return ids.map((id) => LEGAL_RIGHTS.find((right) => right.id === id)).filter(Boolean) as LegalRight[];
}
