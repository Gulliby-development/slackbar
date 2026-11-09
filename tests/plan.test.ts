import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["plan", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     3   0   3   0   3      0  *\nB     2   3   5   3   5      0  *\nlength: 5 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     3   0   3   0   3      0  *\nB     2   3   5   5   7      2\nC     4   3   7   3   7      0  *\nD     1   7   8   7   8      0  *\nlength: 8 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 0\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     0   0   0   0   0      0  *\nlength: 0 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 3\ntask B 2\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     3   0   3   0   3      0  *\nB     2   0   2   1   3      1\nlength: 3 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 3\ntask B 5\ntask C 1 after A,B\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     3   0   3   2   5      2\nB     5   0   5   0   5      0  *\nC     1   5   6   5   6      0  *\nlength: 6 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 2\ntask B 3 after A\ntask C 1 after A\ntask D 4 after C\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     2   0   2   0   2      0  *\nB     3   2   5   4   7      2\nC     1   2   3   2   3      0  *\nD     4   3   7   3   7      0  *\nlength: 7 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 1\ntask B 0 after A\ntask C 2 after B\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     1   0   1   0   1      0  *\nB     0   1   1   1   1      0  *\nC     2   1   3   1   3      0  *\nlength: 3 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task design 3\ntask build 5 after design\ntask docs 2 after design\ntask test 3 after build\ntask ship 1 after test,docs\n", code: 0, out: "ID      DUR  ES  EF  LS  LF  SLACK  CRIT\ndesign    3   0   3   0   3      0  *\nbuild     5   3   8   3   8      0  *\ndocs      2   3   5   9  11      6\ntest      3   8  11   8  11      0  *\nship      1  11  12  11  12      0  *\nlength: 12 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task abcdefghijkl 7\ntask b 1 after abcdefghijkl\n", code: 0, out: "ID            DUR  ES  EF  LS  LF  SLACK  CRIT\nabcdefghijkl    7   0   7   0   7      0  *\nb               1   7   8   7   8      0  *\nlength: 8 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 9999\ntask B 9999 after A\ntask C 2 after B\n", code: 0, out: "ID   DUR     ES     EF     LS     LF  SLACK  CRIT\nA   9999      0   9999      0   9999      0  *\nB   9999   9999  19998   9999  19998      0  *\nC      2  19998  20000  19998  20000      0  *\nlength: 20000 working days\n", err: "" },
  { args: ["plan", "-"], stdin: "task A 9999\ntask B 9999 after A\ntask C 3 after B\n", code: 2, out: "", err: "slackbar: <stdin>: project is longer than 20000 working days\n" },
  { args: ["plan", "-"], stdin: "task A 1\n\ttask B 2 \t after \t A\n", code: 0, out: "ID  DUR  ES  EF  LS  LF  SLACK  CRIT\nA     1   0   1   0   1      0  *\nB     2   1   3   1   3      0  *\nlength: 3 working days\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
