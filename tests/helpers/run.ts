import { main } from "../../src/main";

export interface Row {
  args: string[];
  stdin: string;
  code: number;
  out: string;
  err: string;
}

/** Runs the program on a row's arguments and standard input and returns the row it actually produced. */
export async function check(row: Row): Promise<Row> {
  const outcome = await main(row.args, new TextEncoder().encode(row.stdin));
  return { args: row.args, stdin: row.stdin, ...outcome };
}
