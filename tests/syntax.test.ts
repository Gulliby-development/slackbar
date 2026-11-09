import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["plan", "-"], stdin: "bogus A 1\n", code: 2, out: "", err: "slackbar: <stdin>:1: unknown directive \"bogus\"\n" },
  { args: ["plan", "-"], stdin: "task\n", code: 2, out: "", err: "slackbar: <stdin>:1: task needs an id and a duration\n" },
  { args: ["plan", "-"], stdin: "task A\n", code: 2, out: "", err: "slackbar: <stdin>:1: task needs an id and a duration\n" },
  { args: ["plan", "-"], stdin: "task A 1 before B\n", code: 2, out: "", err: "slackbar: <stdin>:1: expected \"after\" but found \"before\"\n" },
  { args: ["plan", "-"], stdin: "task A 1 after\n", code: 2, out: "", err: "slackbar: <stdin>:1: after needs a list of ids\n" },
  { args: ["plan", "-"], stdin: "task A 1 after B extra\n", code: 2, out: "", err: "slackbar: <stdin>:1: too many fields\n" },
  { args: ["plan", "-"], stdin: "start\n", code: 2, out: "", err: "slackbar: <stdin>:1: start needs a date\n" },
  { args: ["plan", "-"], stdin: "start 2024-02-30\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid date \"2024-02-30\"\n" },
  { args: ["plan", "-"], stdin: "holiday 2024-1-1\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid date \"2024-1-1\"\n" },
  { args: ["plan", "-"], stdin: "start 2024-01-01\nstart 2024-01-02\ntask A 1\n", code: 2, out: "", err: "slackbar: <stdin>:2: duplicate start\n" },
  { args: ["plan", "-"], stdin: "start 2024-01-01 2024-01-02\n", code: 2, out: "", err: "slackbar: <stdin>:1: too many fields\n" },
  { args: ["plan", "-"], stdin: "task abcdefghijklm 1\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid id \"abcdefghijklm\"\n" },
  { args: ["plan", "-"], stdin: "task abcdefghijkl 1 after abcdefghijklm\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid id \"abcdefghijklm\"\n" },
  { args: ["plan", "-"], stdin: "task A 10000\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid duration \"10000\"\n" },
  { args: ["plan", "-"], stdin: "task A 01\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid duration \"01\"\n" },
  { args: ["plan", "-"], stdin: "task A 1 after B,\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid id \"\"\n" },
  { args: ["plan", "-"], stdin: "# only a comment\n", code: 2, out: "", err: "slackbar: <stdin>: no tasks\n" },
  { args: ["plan", "-"], stdin: "\n\n   \n", code: 2, out: "", err: "slackbar: <stdin>: no tasks\n" },
  { args: ["plan", "-"], stdin: "task A 1\ntask A 2\n", code: 2, out: "", err: "slackbar: <stdin>:2: duplicate task \"A\"\n" },
  { args: ["plan", "-"], stdin: "# c\r\n\r\ntask A 1\r\ntask B x\r\n", code: 2, out: "", err: "slackbar: <stdin>:4: invalid duration \"x\"\n" },
  { args: ["plan", "-"], stdin: "\ufefftask A x\n", code: 2, out: "", err: "slackbar: <stdin>:1: invalid duration \"x\"\n" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
