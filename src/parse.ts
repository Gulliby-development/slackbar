import { parseDate } from "./calendar";
import { Failure, type Plan, type Task } from "./types";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,12}$/;
const DURATION_PATTERN = /^(?:0|[1-9][0-9]{0,3})$/;

function fail(display: string, line: number, message: string): never {
  throw new Failure(`${display}:${line}: ${message}`);
}

function fieldsOf(line: string): string[] {
  const trimmed = line.replace(/^[ \t]+|[ \t]+$/g, "");
  return trimmed === "" ? [] : trimmed.split(/[ \t]+/);
}

export function parsePlan(display: string, text: string): Plan {
  const source = text.startsWith("\uFEFF") ? text.slice(1) : text;
  const lines = source.split("\n");
  const tasks: Task[] = [];
  const holidays: string[] = [];
  const taskIds = new Set<string>();
  let start: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    let lineText = lines[index] ?? "";
    if (index < lines.length - 1 && lineText.endsWith("\r")) {
      lineText = lineText.slice(0, -1);
    }

    const fields = fieldsOf(lineText);
    if (fields.length === 0 || (fields[0] ?? "").startsWith("#")) continue;

    const directive = fields[0] ?? "";
    const lineNumber = index + 1;

    if (directive === "start" || directive === "holiday") {
      if (fields.length < 2) fail(display, lineNumber, `${directive} needs a date`);
      if (fields.length > 2) fail(display, lineNumber, "too many fields");
      const date = fields[1] ?? "";
      if (parseDate(date) === null) fail(display, lineNumber, `invalid date "${date}"`);
      if (directive === "start") {
        if (start !== null) fail(display, lineNumber, "duplicate start");
        start = date;
      } else {
        holidays.push(date);
      }
      continue;
    }

    if (directive !== "task") {
      fail(display, lineNumber, `unknown directive "${directive}"`);
    }
    if (fields.length < 3) fail(display, lineNumber, "task needs an id and a duration");

    const id = fields[1] ?? "";
    if (!ID_PATTERN.test(id)) fail(display, lineNumber, `invalid id "${id}"`);

    const durationText = fields[2] ?? "";
    if (!DURATION_PATTERN.test(durationText)) {
      fail(display, lineNumber, `invalid duration "${durationText}"`);
    }
    if (taskIds.has(id)) fail(display, lineNumber, `duplicate task "${id}"`);

    const after: string[] = [];
    if (fields.length >= 4) {
      const marker = fields[3] ?? "";
      if (marker !== "after") {
        fail(display, lineNumber, `expected "after" but found "${marker}"`);
      }
      if (fields.length < 5) fail(display, lineNumber, "after needs a list of ids");
      if (fields.length > 5) fail(display, lineNumber, "too many fields");
      const predecessorText = fields[4] ?? "";
      for (const predecessorId of predecessorText.split(",")) {
        if (!ID_PATTERN.test(predecessorId)) {
          fail(display, lineNumber, `invalid id "${predecessorId}"`);
        }
        after.push(predecessorId);
      }
    }

    tasks.push({ id, dur: Number(durationText), after, line: lineNumber });
    taskIds.add(id);
  }

  if (tasks.length === 0) throw new Failure(`${display}: no tasks`);
  return { start, holidays, tasks };
}
