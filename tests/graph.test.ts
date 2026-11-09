import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["plan", "-"], stdin: "task A 1 after B\n", code: 2, out: "", err: "slackbar: <stdin>:1: unknown task \"B\"\n" },
  { args: ["plan", "-"], stdin: "task A 1\ntask B 1 after A,Z\n", code: 2, out: "", err: "slackbar: <stdin>:2: unknown task \"Z\"\n" },
  { args: ["plan", "-"], stdin: "task A 1 after A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle A > A\n" },
  { args: ["plan", "-"], stdin: "task A 1 after B\ntask B 1 after A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle A > B > A\n" },
  { args: ["plan", "-"], stdin: "task A 1\ntask B 1 after C\ntask C 1 after B\ntask D 1 after A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle B > C > B\n" },
  { args: ["plan", "-"], stdin: "task A 1 after B,C\ntask B 1 after C\ntask C 1 after A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle A > B > C > A\n" },
  { args: ["plan", "-"], stdin: "task A 2 after A,A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle A > A\n" },
  { args: ["plan", "-"], stdin: "task A 1 after X\ntask B 1 after Y\n", code: 2, out: "", err: "slackbar: <stdin>:1: unknown task \"X\"\n" },
  { args: ["plan", "-"], stdin: "task A 1 after D\ntask B 1 after C\ntask C 1 after B\ntask D 1 after A\n", code: 2, out: "", err: "slackbar: <stdin>: cycle A > D > A\n" },
  { args: ["plan", "-"], stdin: "task abcdefghijkl 1 after abcdefghijkl\n", code: 2, out: "", err: "slackbar: <stdin>: cycle abcdefghijkl > abcdefghijkl\n" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
