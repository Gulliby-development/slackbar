import { readFile } from "node:fs/promises";
import { planHtml } from "./html";
import { parsePlan } from "./parse";
import { chartText, chartWidth, criticalText, planText } from "./render";
import { schedule } from "./schedule";
import { Failure, type Outcome } from "./types";

export const USAGE =
  "usage: slackbar plan FILE\n       slackbar critical FILE\n       slackbar chart [--width W] FILE\n       slackbar html FILE\n";

const COMMANDS = new Set(["plan", "critical", "chart", "html"]);
const WIDTH_PATTERN = /^(?:0|[1-9][0-9]*)$/;

function error(message: string): Outcome {
  return { code: 2, out: "", err: `slackbar: ${message}\n` };
}

function decodeUtf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return null;
  }
}

function parseArguments(
  args: string[],
): { command: string; file: string; width: number } | Outcome {
  if (args.length === 1 && args[0] === "--help") {
    return { code: 0, out: USAGE, err: "" };
  }
  const command = args[0];
  if (command === undefined) return error("missing command (plan, critical, chart or html)");
  if (!COMMANDS.has(command)) return error(`unknown command "${command}"`);

  let file: string | undefined;
  let width = 80;
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index] ?? "";
    if (argument === "--width" || argument.startsWith("--width=")) {
      if (command !== "chart") return error('unknown option "--width"');
      let value: string;
      if (argument === "--width") {
        const next = args[index + 1];
        if (next === undefined) return error("--width needs a value");
        value = next;
        index += 1;
      } else {
        value = argument.slice("--width=".length);
      }
      if (!WIDTH_PATTERN.test(value) || Number(value) < 10 || Number(value) > 200) {
        return error(`invalid --width "${value}" (expected a whole number from 10 to 200)`);
      }
      width = Number(value);
      continue;
    }
    if (argument.startsWith("-") && argument !== "-") return error(`unknown option "${argument}"`);
    if (file !== undefined) return error("too many arguments");
    file = argument;
  }
  if (file === undefined) return error("missing FILE");
  return { command, file, width };
}

export async function main(args: string[], stdin: Uint8Array): Promise<Outcome> {
  const parsed = parseArguments(args);
  if ("code" in parsed) return parsed;

  const display = parsed.file === "-" ? "<stdin>" : parsed.file.replace(/\\/g, "/");
  let bytes: Uint8Array;
  if (parsed.file === "-") {
    bytes = stdin;
  } else {
    try {
      bytes = await readFile(parsed.file);
    } catch {
      return error(`${display}: cannot read the file`);
    }
  }
  const text = decodeUtf8(bytes);
  if (text === null) return error(`${display}: input is not valid UTF-8`);

  try {
    const plan = parsePlan(display, text);
    const result = schedule(display, plan);
    let out: string;
    if (parsed.command === "plan") {
      out = planText(result);
    } else if (parsed.command === "critical") {
      out = criticalText(result);
    } else if (parsed.command === "chart") {
      const columns = chartWidth(result);
      if (columns > parsed.width) {
        return error(`chart needs ${columns} columns but --width is ${parsed.width}`);
      }
      out = chartText(result);
    } else {
      out = await planHtml(result);
    }
    return { code: 0, out, err: "" };
  } catch (cause) {
    if (cause instanceof Failure) return error(cause.message);
    throw cause;
  }
}
