import { main } from "./main";

export async function run(
  args: string[],
  stdin: Uint8Array,
  stdout: { write(text: string): unknown },
  stderr: { write(text: string): unknown },
): Promise<number> {
  const outcome = await main(args, stdin);
  stdout.write(outcome.out);
  stderr.write(outcome.err);
  return outcome.code;
}
