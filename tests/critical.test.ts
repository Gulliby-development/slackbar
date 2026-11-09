import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["critical", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 0, out: "critical: A B\nlength: 5 working days\n", err: "" },
  { args: ["critical", "-"], stdin: "task A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\n", code: 0, out: "critical: A C D\nlength: 8 working days\n", err: "" },
  { args: ["critical", "-"], stdin: "start 2024-05-01\nholiday 2024-05-02\ntask A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\ntask M 0 after D\n", code: 0, out: "critical: A C D\nlength: 8 working days\nfinish: 2024-05-13\n", err: "" },
  { args: ["critical", "-"], stdin: "task A 0\n", code: 0, out: "critical: none\nlength: 0 working days\n", err: "" },
  { args: ["critical", "-"], stdin: "task A 3\ntask B 3\n", code: 0, out: "critical: A B\nlength: 3 working days\n", err: "" },
  { args: ["critical", "-"], stdin: "task A 1\ntask B 0 after A\n", code: 0, out: "critical: A\nlength: 1 working day\n", err: "" },
  { args: ["critical", "-"], stdin: "task A 2\ntask B 0\ntask C 1 after B\n", code: 0, out: "critical: A\nlength: 2 working days\n", err: "" },
  { args: ["critical", "-"], stdin: "start 2024-05-04\ntask A 1\n", code: 0, out: "critical: A\nlength: 1 working day\nfinish: 2024-05-06\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
