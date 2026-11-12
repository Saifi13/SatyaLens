export type Verdict = "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT_EVIDENCE";

export type Confidence = "high" | "medium" | "low";

export type SourceCategory =
  | "government"
  | "research"
  | "factcheck"
  | "reference"
  | "news"
  | "other";

export type EvidenceRelation = "supports" | "contradicts" | "context";

export type SourceAccessStatus = "found" | "reading" | "opened" | "failed" | "snippet";

export interface SourceRef {
  id: string;
  url: string;
  domain: string;
  publisher: string;
  title: string;
  publishedAt?: string;
  category: SourceCategory;
  accessed: boolean;
  snippet?: string;
  discoveredAt?: string;
  retrievedAt?: string;
  failReason?: string;
  accessStatus?: SourceAccessStatus;
}

export interface EvidenceItem {
  sourceId: string;
  relation: EvidenceRelation;
  excerpt: string;
  why: string;
  independentlySourced: boolean;
}

export interface SubClaim {
  text: string;
  kind: "factual" | "opinion" | "ambiguous";
  verdict: Verdict | null;
  explanation: string;
  evidence: EvidenceItem[];
  sourceIds: string[];
}

export interface Assessment {
  established: string[];
  disputed: string[];
  uncertain: string[];
  rationale: string;
}

export interface VerificationReport {
  claim: string;
  verdict: Verdict;
  confidence: Confidence;
  confidenceNote: string;
  summary: string;
  verifiedAt: string;
  subClaims: SubClaim[];
  sources: SourceRef[];
  evidence: EvidenceItem[];
  assessment: Assessment;
  limitations: string;
  searchQueries: string[];
  independentSourceCount: number;
}

export type StageId =
  | "understand"
  | "extract"
  | "search"
  | "read"
  | "evaluate"
  | "compare"
  | "report";

export type StageStatus = "pending" | "running" | "done" | "failed";

export interface StageEvent {
  stage: StageId;
  status: StageStatus;
  detail?: string;
}

export interface SourceEvent {
  phase: "found" | "reading" | "read" | "failed" | "evaluated";
  source: SourceRef;
  count?: number;
  snippet?: string;
  failReason?: string;
  relation?: EvidenceRelation;
  retrievedAt?: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  message: string;
  stage?: StageId;
}

export type VerifyEvent =
  | { type: "stage"; data: StageEvent }
  | { type: "source"; data: SourceEvent }
  | { type: "activity"; data: ActivityEvent }
  | { type: "report"; data: VerificationReport }
  | { type: "error"; data: { code: string; message: string } };

export const STAGE_LABELS: Record<StageId, string> = {
  understand: "Understanding your claim",
  extract: "Extracting verifiable statements",
  search: "Searching credible sources",
  read: "Reading and evaluating source pages",
  evaluate: "Comparing findings against the claim",
  compare: "Cross-checking independent confirmation",
  report: "Preparing your verification report",
};

export const STAGE_HINTS: Record<StageId, string> = {
  understand: "Reading the statement to isolate what can actually be checked.",
  extract: "Breaking the claim into atomic, testable assertions and search queries.",
  search: "Querying live sources for independent reporting and official records.",
  read: "Opening source pages and extracting readable text where allowed.",
  evaluate: "Matching retrieved material to each assertion — labels appear only after this step.",
  compare: "Checking whether independent publishers corroborate one another.",
  report: "Assembling the verdict, citations and limitations from the evidence.",
};

export const STAGE_ORDER: StageId[] = [
  "understand",
  "extract",
  "search",
  "read",
  "evaluate",
  "compare",
  "report",
];
