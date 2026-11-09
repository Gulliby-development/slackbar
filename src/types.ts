export interface Task {
  id: string;
  dur: number;
  after: string[];
  line: number;
}

export interface Plan {
  start: string | null;
  holidays: string[];
  tasks: Task[];
}

export interface Row {
  id: string;
  dur: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  slack: number;
  critical: boolean;
  start: string | null;
  finish: string | null;
}

export interface Schedule {
  rows: Row[];
  length: number;
  finish: string | null;
  dated: boolean;
}

export interface Outcome {
  code: number;
  out: string;
  err: string;
}

export class Failure extends Error {}
