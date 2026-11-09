import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["chart", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 0, out: "A |###..|\nB |...##|\n", err: "" },
  { args: ["chart", "-"], stdin: "task A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\n", code: 0, out: "A |###.....|\nB |...==...|\nC |...####.|\nD |.......#|\n", err: "" },
  { args: ["chart", "--width=10", "--width", "11", "-"], stdin: "task A 10\n", code: 0, out: "A |##########|\n", err: "" },
  { args: ["chart", "-"], stdin: "task A 0\n", code: 0, out: "A |*|\n", err: "" },
  { args: ["chart", "-"], stdin: "task A 1\ntask B 0 after A\n", code: 0, out: "A |#.|\nB |.*|\n", err: "" },
  { args: ["chart", "-"], stdin: "task A 2\ntask B 0\ntask LONG 1 after A\n", code: 0, out: "A    |##.|\nB    |*..|\nLONG |..#|\n", err: "" },
  { args: ["chart", "--width", "10", "-"], stdin: "task A 10\n", code: 0, out: "A |##########|\n", err: "" },
  { args: ["chart", "--width", "10", "-"], stdin: "task A 11\n", code: 2, out: "", err: "slackbar: chart needs 11 columns but --width is 10\n" },
  { args: ["chart", "--width=10", "-"], stdin: "task A 10\ntask B 0 after A\n", code: 2, out: "", err: "slackbar: chart needs 11 columns but --width is 10\n" },
  { args: ["chart", "--width", "200", "-"], stdin: "task A 100\ntask B 101 after A\n", code: 2, out: "", err: "slackbar: chart needs 201 columns but --width is 200\n" },
  { args: ["chart", "-"], stdin: "task A 80\n", code: 0, out: "A |################################################################################|\n", err: "" },
  { args: ["chart", "-"], stdin: "task A 81\n", code: 2, out: "", err: "slackbar: chart needs 81 columns but --width is 80\n" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
