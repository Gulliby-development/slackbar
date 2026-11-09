import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["plan", "-"], stdin: "start 2024-05-01\nholiday 2024-05-02\ntask A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\ntask M 0 after D\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     3   0   3   0   3      0  2024-05-01  2024-05-06  *\nB     2   3   5   5   7      2  2024-05-07  2024-05-08\nC     4   3   7   3   7      0  2024-05-07  2024-05-10  *\nD     1   7   8   7   8      0  2024-05-13  2024-05-13  *\nM     0   8   8   8   8      0  2024-05-14  2024-05-14  *\nlength: 8 working days\nfinish: 2024-05-13\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-05-04\ntask A 1\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     1   0   1   0   1      0  2024-05-06  2024-05-06  *\nlength: 1 working day\nfinish: 2024-05-06\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-05-03\ntask A 1\ntask B 1 after A\ntask C 1 after B\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     1   0   1   0   1      0  2024-05-03  2024-05-03  *\nB     1   1   2   1   2      0  2024-05-06  2024-05-06  *\nC     1   2   3   2   3      0  2024-05-07  2024-05-07  *\nlength: 3 working days\nfinish: 2024-05-07\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-01-01\nholiday 2024-01-01\ntask A 2\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     2   0   2   0   2      0  2024-01-02  2024-01-03  *\nlength: 2 working days\nfinish: 2024-01-03\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-02-28\ntask A 3\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     3   0   3   0   3      0  2024-02-28  2024-03-01  *\nlength: 3 working days\nfinish: 2024-03-01\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2023-12-29\ntask A 1\ntask B 2 after A\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     1   0   1   0   1      0  2023-12-29  2023-12-29  *\nB     2   1   3   1   3      0  2024-01-01  2024-01-02  *\nlength: 3 working days\nfinish: 2024-01-02\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-05-01\nholiday 2024-05-02\nholiday 2024-05-03\nholiday 2024-05-02\ntask A 3\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     3   0   3   0   3      0  2024-05-01  2024-05-07  *\nlength: 3 working days\nfinish: 2024-05-07\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-05-01\ntask A 0\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     0   0   0   0   0      0  2024-05-01  2024-05-01  *\nlength: 0 working days\nfinish: 2024-05-01\n", err: "" },
  { args: ["plan", "-"], stdin: "holiday 2024-05-02\nstart 2024-05-01\ntask A 2\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     2   0   2   0   2      0  2024-05-01  2024-05-03  *\nlength: 2 working days\nfinish: 2024-05-03\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2200-12-30\ntask A 3\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     3   0   3   0   3      0  2200-12-30  2201-01-01  *\nlength: 3 working days\nfinish: 2201-01-01\n", err: "" },
  { args: ["plan", "-"], stdin: "start 2024-12-24\nholiday 2024-12-25\nholiday 2024-12-26\ntask A 4\ntask B 1 after A\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  START       FINISH      CRIT\nA     4   0   4   0   4      0  2024-12-24  2024-12-31  *\nB     1   4   5   4   5      0  2025-01-01  2025-01-01  *\nlength: 5 working days\nfinish: 2025-01-01\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
