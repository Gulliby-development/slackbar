import { workdayCalendar } from "./calendar";
import { Failure, type Plan, type Row, type Schedule, type Task } from "./types";

export function schedule(display: string, plan: Plan): Schedule {
  const taskById = new Map<string, Task>();
  for (const task of plan.tasks) taskById.set(task.id, task);

  for (const task of plan.tasks) {
    for (const predecessor of task.after) {
      if (!taskById.has(predecessor)) {
        throw new Failure(`${display}:${task.line}: unknown task \"${predecessor}\"`);
      }
    }
  }

  const state = new Map<string, 0 | 1 | 2>();
  const path: string[] = [];
  const pathPositions = new Map<string, number>();
  const postorder: Task[] = [];

  for (const root of plan.tasks) {
    if ((state.get(root.id) ?? 0) !== 0) continue;
    const frames: { task: Task; nextPredecessor: number }[] = [{ task: root, nextPredecessor: 0 }];
    state.set(root.id, 1);
    pathPositions.set(root.id, path.length);
    path.push(root.id);

    while (frames.length > 0) {
      const frame = frames[frames.length - 1];
      if (frame === undefined) break;
      if (frame.nextPredecessor < frame.task.after.length) {
        const predecessorId = frame.task.after[frame.nextPredecessor];
        frame.nextPredecessor += 1;
        if (predecessorId === undefined) continue;
        const predecessor = taskById.get(predecessorId);
        if (predecessor === undefined) continue;
        const predecessorState = state.get(predecessorId) ?? 0;
        if (predecessorState === 1) {
          const cycleStart = pathPositions.get(predecessorId) ?? 0;
          const cycle = [...path.slice(cycleStart), predecessorId].join(" > ");
          throw new Failure(`${display}: cycle ${cycle}`);
        }
        if (predecessorState === 0) {
          state.set(predecessorId, 1);
          pathPositions.set(predecessorId, path.length);
          path.push(predecessorId);
          frames.push({ task: predecessor, nextPredecessor: 0 });
        }
      } else {
        frames.pop();
        state.set(frame.task.id, 2);
        path.pop();
        pathPositions.delete(frame.task.id);
        postorder.push(frame.task);
      }
    }
  }

  const successors = new Map<string, Task[]>();
  for (const task of plan.tasks) successors.set(task.id, []);
  for (const task of plan.tasks) {
    for (const predecessorId of task.after) {
      const list = successors.get(predecessorId);
      if (list !== undefined) list.push(task);
    }
  }

  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();
  let length = 0;
  for (const task of postorder) {
    let es = 0;
    for (const predecessorId of task.after) {
      es = Math.max(es, earliestFinish.get(predecessorId) ?? 0);
    }
    const ef = es + task.dur;
    earliestStart.set(task.id, es);
    earliestFinish.set(task.id, ef);
    length = Math.max(length, ef);
  }

  if (length > 20_000) {
    throw new Failure(`${display}: project is longer than 20000 working days`);
  }

  const latestFinish = new Map<string, number>();
  const latestStart = new Map<string, number>();
  for (const task of [...postorder].reverse()) {
    let lf = length;
    const followers = successors.get(task.id) ?? [];
    if (followers.length > 0) {
      lf = Number.POSITIVE_INFINITY;
      for (const follower of followers) {
        lf = Math.min(lf, latestStart.get(follower.id) ?? length);
      }
    }
    const ls = lf - task.dur;
    latestFinish.set(task.id, lf);
    latestStart.set(task.id, ls);
  }

  const dateAt = plan.start === null ? null : workdayCalendar(plan.start, plan.holidays);
  const indexedRows = plan.tasks.map((task, fileIndex) => {
    const es = earliestStart.get(task.id) ?? 0;
    const ef = earliestFinish.get(task.id) ?? es + task.dur;
    const ls = latestStart.get(task.id) ?? 0;
    const lf = latestFinish.get(task.id) ?? length;
    const slack = ls - es;
    const row: Row = {
      id: task.id,
      dur: task.dur,
      es,
      ef,
      ls,
      lf,
      slack,
      critical: slack === 0,
      start: dateAt === null ? null : dateAt(es),
      finish: dateAt === null ? null : dateAt(task.dur === 0 ? es : ef - 1),
    };
    return { row, fileIndex };
  });
  indexedRows.sort((left, right) => left.row.es - right.row.es || left.fileIndex - right.fileIndex);

  return {
    rows: indexedRows.map(({ row }) => row),
    length,
    finish: dateAt === null ? null : dateAt(length === 0 ? 0 : length - 1),
    dated: plan.start !== null,
  };
}
