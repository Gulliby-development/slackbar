import { expect, test } from "vitest";
import { check } from "./helpers/run";

// prettier-ignore
const rows = [
  { args: ["html", "-"], stdin: "task A 3\ntask B 2 after A\n", code: 0, out: "<table class=\"plan\"><thead><tr><th>id</th><th>dur</th><th>es</th><th>ef</th><th>ls</th><th>lf</th><th>slack</th></tr></thead><tbody><tr class=\"critical\" data-slack=\"0\"><td>A</td><td>3</td><td>0</td><td>3</td><td>0</td><td>3</td><td>0</td></tr><tr class=\"critical\" data-slack=\"0\"><td>B</td><td>2</td><td>3</td><td>5</td><td>3</td><td>5</td><td>0</td></tr></tbody><tfoot><tr><td colspan=\"7\">length: 5 working days</td></tr></tfoot></table>\n", err: "" },
  { args: ["html", "-"], stdin: "task A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\n", code: 0, out: "<table class=\"plan\"><thead><tr><th>id</th><th>dur</th><th>es</th><th>ef</th><th>ls</th><th>lf</th><th>slack</th></tr></thead><tbody><tr class=\"critical\" data-slack=\"0\"><td>A</td><td>3</td><td>0</td><td>3</td><td>0</td><td>3</td><td>0</td></tr><tr class=\"\" data-slack=\"2\"><td>B</td><td>2</td><td>3</td><td>5</td><td>5</td><td>7</td><td>2</td></tr><tr class=\"critical\" data-slack=\"0\"><td>C</td><td>4</td><td>3</td><td>7</td><td>3</td><td>7</td><td>0</td></tr><tr class=\"critical\" data-slack=\"0\"><td>D</td><td>1</td><td>7</td><td>8</td><td>7</td><td>8</td><td>0</td></tr></tbody><tfoot><tr><td colspan=\"7\">length: 8 working days</td></tr></tfoot></table>\n", err: "" },
  { args: ["html", "-"], stdin: "task A 0\n", code: 0, out: "<table class=\"plan\"><thead><tr><th>id</th><th>dur</th><th>es</th><th>ef</th><th>ls</th><th>lf</th><th>slack</th></tr></thead><tbody><tr class=\"critical\" data-slack=\"0\"><td>A</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></tbody><tfoot><tr><td colspan=\"7\">length: 0 working days</td></tr></tfoot></table>\n", err: "" },
  { args: ["html", "-"], stdin: "start 2024-05-04\ntask A 1\n", code: 0, out: "<table class=\"plan\"><thead><tr><th>id</th><th>dur</th><th>es</th><th>ef</th><th>ls</th><th>lf</th><th>slack</th><th>start</th><th>finish</th></tr></thead><tbody><tr class=\"critical\" data-slack=\"0\"><td>A</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>2024-05-06</td><td>2024-05-06</td></tr></tbody><tfoot><tr><td colspan=\"9\">length: 1 working day, finish 2024-05-06</td></tr></tfoot></table>\n", err: "" },
  { args: ["html", "-"], stdin: "task A 1\ntask B 0 after A\n", code: 0, out: "<table class=\"plan\"><thead><tr><th>id</th><th>dur</th><th>es</th><th>ef</th><th>ls</th><th>lf</th><th>slack</th></tr></thead><tbody><tr class=\"critical\" data-slack=\"0\"><td>A</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td></tr><tr class=\"critical\" data-slack=\"0\"><td>B</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr></tbody><tfoot><tr><td colspan=\"7\">length: 1 working day</td></tr></tfoot></table>\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, async () => {
    expect(await check(row)).toEqual(row);
  });
}
