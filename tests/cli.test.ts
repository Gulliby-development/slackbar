import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: [], stdin: "", code: 2, out: "", err: "slackbar: missing command (plan, critical, chart or html)\n" },
  { args: ["bogus"], stdin: "", code: 2, out: "", err: "slackbar: unknown command \"bogus\"\n" },
  { args: ["plan"], stdin: "", code: 2, out: "", err: "slackbar: missing FILE\n" },
  { args: ["plan", "-", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: too many arguments\n" },
  { args: ["plan", "-x", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: unknown option \"-x\"\n" },
  { args: ["plan", "--width", "20", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: unknown option \"--width\"\n" },
  { args: ["--help"], stdin: "", code: 0, out: "usage: slackbar plan FILE\n       slackbar critical FILE\n       slackbar chart [--width W] FILE\n       slackbar html FILE\n", err: "" },
  { args: ["--help", "plan"], stdin: "", code: 2, out: "", err: "slackbar: unknown command \"--help\"\n" },
  { args: ["plan", "/no/such/slackbar-file.txt"], stdin: "", code: 2, out: "", err: "slackbar: /no/such/slackbar-file.txt: cannot read the file\n" },
  { args: ["chart", "--width"], stdin: "", code: 2, out: "", err: "slackbar: --width needs a value\n" },
  { args: ["chart", "--width", "9", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: invalid --width \"9\" (expected a whole number from 10 to 200)\n" },
  { args: ["chart", "--width=201", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: invalid --width \"201\" (expected a whole number from 10 to 200)\n" },
  { args: ["chart", "--width", "010", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: invalid --width \"010\" (expected a whole number from 10 to 200)\n" },
  { args: ["chart", "--width", "x", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 2, out: "", err: "slackbar: invalid --width \"x\" (expected a whole number from 10 to 200)\n" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
