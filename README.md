<p align="center"><img src="docs/logo.svg" width="96" alt="" /></p>

# slackbar

[![CI](https://github.com/Gulliby-development/slackbar/actions/workflows/ci.yml/badge.svg)](https://github.com/Gulliby-development/slackbar/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

slackbar computes a working-day schedule from project tasks and their dependencies. It is intended for project leads and students learning the critical path method. It reports earliest and latest dates in the schedule, slack, critical tasks, and project duration; dated plans also account for weekends and holidays. Durations and schedule calculations use whole working days, with no fractional days or time zones.

## Requirements and setup

Use Node.js 20 or newer and Bun on Windows, macOS, or Linux. From the repository directory, install the project dependencies:

```sh
bun install
```

Run the CLI from that directory with `bun run --silent slackbar ARGS`, replacing `ARGS` with a command and its arguments. Give it a plan-file path, or use `-` to read the plan from standard input.

## Plan files

A plan is UTF-8 text. One leading byte order mark is accepted. Lines may use LF or CRLF endings; fields are separated by one or more spaces or tabs, and leading or trailing spaces and tabs are ignored. Blank lines and lines whose first field begins with `#` are ignored. Directives are case-sensitive:

```text
start YYYY-MM-DD
holiday YYYY-MM-DD
task ID DUR
task ID DUR after ID[,ID...]
```

There may be at most one `start` directive and any number of holidays. Dates must be real calendar dates from 1970-01-01 through 2200-12-31. Task IDs contain 1–12 ASCII letters, digits, underscores, or hyphens. Durations are unsigned whole numbers from 0 through 9999, with no leading zeroes except for `0`. Zero marks a milestone. A task may omit `after`; otherwise its comma-separated predecessor list has no spaces. Predecessors may be declared later in the file, but each must name a task that exists. Repeated holidays and repeated predecessor IDs are accepted; task IDs and the start directive cannot be duplicated.

## Scheduling

The scheduler numbers working time from zero. A task's earliest start (ES) is the greatest predecessor earliest finish (EF), or zero when it has no predecessors; EF is ES plus duration. Project length is the greatest EF. Latest finish (LF) is project length for a task with no followers, or the smallest latest start (LS) among its followers. LS is LF minus duration, and slack is LS minus ES. A task with zero slack is critical. Rows sort by ES, with original file order breaking ties. Projects of exactly 20,000 working days are allowed; longer projects are rejected.

For a dated plan, working day zero is the first weekday on or after the start date that is not a holiday. Later working days skip weekends and listed holidays. Task dates use ES for the start and EF minus one for the finish; milestones use ES for both dates, including at the end of a project. The project finish is working day length minus one, or working day zero for a zero-length project. Computed dates may go beyond year 2200 even though input dates cannot.

## Commands

```text
usage: slackbar plan FILE
       slackbar critical FILE
       slackbar chart [--width W] FILE
       slackbar html FILE
```

`FILE` is a path or `-` for standard input. The sole argument `--help` prints the usage text. After the command is recognized, later arguments are checked from left to right. `--width W` and `--width=W` are accepted only for `chart`; each width is validated as it is encountered, and the last valid value is used (an invalid earlier value still fails even if a later width is valid). The default is 80 columns and the accepted range is 10 through 200. Other arguments beginning with `-` are unknown options, except for `-` itself, which names standard input. The first remaining argument is FILE; another is an error, and FILE is required.

- **plan** prints a column-aligned table with one row per task, followed by project length and, for a dated plan, a finish-date line. Numeric columns are right-aligned; other columns are left-aligned.
- **critical** lists critical tasks with nonzero duration in table order, or `critical: none`, followed by the same summary lines. Milestones do not appear in this list.
- **chart** prints one row per task in table order. A task's working days are marked with `#` when critical and `=` otherwise; milestones use `*`, and unused days use `.`. The chart width is the greatest task end position (with at least one cell for a milestone). It has no summary line. If it exceeds the selected width, the command fails instead of truncating it.
- **html** renders a Vue server-side HTML table fragment, not a complete HTML page. It has lower-case headers and omits the CRIT column. Rows carry a `critical` class when critical and a `data-slack` attribute; dated plans include START and FINISH columns. The footer spans the table columns and contains the summary, including the finish date for dated plans. Vue's comment markers are removed, tags have no intervening whitespace, and output ends with one line feed.

## Errors and exit codes

Successful commands exit with code 0. Argument, input, plan, dependency, cycle, and chart-width errors exit with code 2; failures produce no standard output and print a `slackbar:` diagnostic to standard error. Argument checks happen before input is read, in this order: `--help` is special only when it is the sole argument; otherwise the command is required and recognized first, then each later argument is processed left to right. Width options on non-chart commands fail as unknown options. On `chart`, `--width` without a following value fails; each supplied width is then validated before parsing continues, so a later width cannot mask an invalid earlier one. Other dash-prefixed arguments fail as unknown options, then the first ordinary argument is FILE, a second ordinary argument is too many arguments, and a missing FILE is reported last. A plan error identifies the displayed input name and line where applicable. Paths in diagnostics use forward slashes, and standard input is displayed as `<stdin>`.

Diagnostics include:

- `missing command (plan, critical, chart or html)`, `unknown command "X"`, `unknown option "ARG"`, `too many arguments`, and `missing FILE`.
- `--width needs a value` and `invalid --width "W" (expected a whole number from 10 to 200)`.
- `FILE: cannot read the file` and `FILE: input is not valid UTF-8`.
- `FILE:LINE: unknown directive "X"`; `start needs a date` and `holiday needs a date`; `too many fields`; `invalid date "X"`; and `duplicate start`.
- `task needs an id and a duration`, `invalid id "X"`, `invalid duration "X"`, `duplicate task "X"`, `expected "after" but found "X"`, and `after needs a list of ids`.
- `FILE: no tasks`, `FILE:LINE: unknown task "X"`, `FILE: cycle A > B > A`, `FILE: project is longer than 20000 working days`, and `chart needs C columns but --width is W`.

The earliest offending source line wins. Within a `start` or `holiday` line, checks are ordered: require a date, reject extra fields, validate the date, then (for `start`) reject a duplicate start. Within a `task` line, checks are ordered: require ID and duration, validate the ID, validate duration, reject a duplicate task, then check the optional dependency clause: require the exact `after` marker, require its list, reject extra fields, and validate list IDs from left to right. An unknown directive is reported when its line is reached. After the whole file is parsed, an empty task list is reported first; otherwise unknown references are checked in task/file order and predecessor-list order, before any cycle check. Cycles are found by depth-first traversal starting in file order and following each task's predecessor list in written order; the reported path runs from the repeated task through the path back to that task. The plan's displayed file name is preserved (except for slash normalization); standard input uses `<stdin>`.

## Examples

The following transcripts use a POSIX shell in the repository directory. The invocation form shown runs the program directly:

```text
$ printf 'task A 3\ntask B 2 after A\ntask C 4 after A\ntask D 1 after B,C\n' | bun run --silent slackbar plan -
ID  DUR  ES  EF  LS  LF  SLACK  CRIT
A     3   0   3   0   3      0  *
B     2   3   5   5   7      2
C     4   3   7   3   7      0  *
D     1   7   8   7   8      0  *
length: 8 working days
$ printf 'start 2024-05-01\nholiday 2024-05-02\ntask A 3\ntask B 2 after A\n' | bun run --silent slackbar critical -
critical: A B
length: 5 working days
finish: 2024-05-08
$ printf 'task A 2\ntask B 3 after A\ntask C 1 after A\n' | bun run --silent slackbar chart -
A |##...|
B |..###|
C |..=..|
$ printf 'task A 1 after B\ntask B 1 after A\n' | bun run --silent slackbar plan - 2>&1; echo "exit $?"
slackbar: <stdin>: cycle A > B > A
exit 2
```

## Development

Run the project's quality checks with:

```sh
bun run typecheck
bun run lint
bun run format:check
bun run test
```

See [LICENSE](LICENSE) for the MIT license.

---

Built with [BAKED](https://github.com/Gulliby-development/baked), an open-source coding agent (bench round R87).
