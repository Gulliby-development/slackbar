import type { Row, Schedule } from "./types";

export function summaryText(schedule: Schedule): string {
  const unit = schedule.length === 1 ? "working day" : "working days";
  return `length: ${schedule.length} ${unit}`;
}

export function headerNames(dated: boolean): string[] {
  return [
    "ID",
    "DUR",
    "ES",
    "EF",
    "LS",
    "LF",
    "SLACK",
    ...(dated ? ["START", "FINISH"] : []),
    "CRIT",
  ];
}

export function cellsOf(row: Row, dated: boolean): string[] {
  return [
    row.id,
    String(row.dur),
    String(row.es),
    String(row.ef),
    String(row.ls),
    String(row.lf),
    String(row.slack),
    ...(dated ? [row.start ?? "", row.finish ?? ""] : []),
    row.critical ? "*" : "",
  ];
}

export function planText(schedule: Schedule): string {
  const headers = headerNames(schedule.dated);
  const rows = schedule.rows.map((row) => cellsOf(row, schedule.dated));
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((cells) => (cells[column] ?? "").length)),
  );
  const numericColumns = new Set([1, 2, 3, 4, 5, 6]);
  const format = (cells: string[]): string =>
    cells
      .map((cell, column) => {
        const padding = " ".repeat((widths[column] ?? cell.length) - cell.length);
        return numericColumns.has(column) ? padding + cell : cell + padding;
      })
      .join("  ")
      .trimEnd();
  const lines = [format(headers), ...rows.map(format), summaryText(schedule)];
  if (schedule.dated) lines.push(`finish: ${schedule.finish ?? ""}`);
  return `${lines.join("\n")}\n`;
}

export function criticalText(schedule: Schedule): string {
  const ids = schedule.rows.filter((row) => row.critical && row.dur > 0).map((row) => row.id);
  const lines = [`critical: ${ids.length > 0 ? ids.join(" ") : "none"}`, summaryText(schedule)];
  if (schedule.dated) lines.push(`finish: ${schedule.finish ?? ""}`);
  return `${lines.join("\n")}\n`;
}

export function chartWidth(schedule: Schedule): number {
  return Math.max(0, ...schedule.rows.map((row) => row.es + Math.max(row.dur, 1)));
}

export function chartText(schedule: Schedule): string {
  const width = chartWidth(schedule);
  const idWidth = Math.max(0, ...schedule.rows.map((row) => row.id.length));
  return (
    schedule.rows
      .map((row) => {
        const id = row.id.padEnd(idWidth, " ");
        const cells = Array.from({ length: width }, (_, index) => {
          if (row.dur === 0 && index === row.es) return "*";
          if (row.dur > 0 && index >= row.es && index < row.ef) {
            return row.critical ? "#" : "=";
          }
          return ".";
        });
        return `${id} |${cells.join("")}|`;
      })
      .join("\n") + (schedule.rows.length > 0 ? "\n" : "")
  );
}
