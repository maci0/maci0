// Claude Code PreToolUse hook (matcher Bash): refuses a command that starts a host load generator, or that runs a
// script which does. Enforces AGENTS.md, Testing: "Never load the host to reproduce a flake."
//
// Input: the hook JSON on stdin (tool_input.command, cwd, session_id). Exit 2 blocks the call and hands stderr to
// the agent; exit 0 lets it run. Each block is appended as one JSON line to ~/.cache/no-host-load/blocked.log.
//
// ponytail: regexes over the command text and over the script it runs (one level, files up to SCRIPT_MAX_BYTES).
// A burner started from inside a test suite or a compiled program is not seen; extend RULES or scan more file
// kinds when one gets past.
import { appendFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";

const SCRIPT_MAX_BYTES = 1 << 20;
const COMMAND_LOG_CHARS = 300;
const RULE_DOC = join(homedir(), "Desktop/Projects/maci0/AGENTS.md");

// A word at command position: line start, after a shell separator, or after a keyword or wrapper that runs it.
const AT = String.raw`(?:^|[;&|({}\n\x60]|\b(?:do|then|else|nohup|exec|command|setsid)\s|\bnice(?:\s+-n\s*-?\d+)?\s|\btimeout(?:\s+-\S+)*\s+\S+\s)\s*`;

const RULES: [string, RegExp][] = [
  ["yes writing to /dev/null or running in the background", new RegExp(AT + String.raw`yes\b(?:[ \t][^;&|\n]*?)?(?:>\s*\/dev\/null|&(?!&))`, "m")],
  ["a stress tool", new RegExp(AT + String.raw`(?:stress-ng|stress|stressapptest|cpuburn|burnP6|burnK7)\b`, "m")],
  ["a busy loop", /while\s+(?:true|:|\(\(\s*1\s*\)\))\s*;?\s*do\s*(?::|true)?\s*;?\s*done/],
  ["an endless copy from /dev/zero or /dev/urandom", /\b(?:dd\b[^;&|\n]*\bif=\/dev\/(?:zero|u?random)\b[^;&|\n]*\bof=\/dev\/null|cat\s+\/dev\/(?:zero|u?random)\s*>\s*\/dev\/null)/],
  ["a fork bomb", /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:?\s*&\s*\}\s*;\s*:/],
];

const INTERPRETERS = new Set(["bash", "sh", "zsh", "dash", "source", ".", "python", "python3", "perl", "bun", "node"]);
const WRAPPERS = new Set(["nohup", "exec", "time", "command", "setsid", "sudo", "env"]);

function firstRule(text: string): string | undefined {
  return RULES.find(([, pattern]) => pattern.test(text))?.[0];
}

// The script files a command runs directly (a path at command position) or through an interpreter.
function scriptsRun(command: string, cwd: string): string[] {
  const paths: string[] = [];
  for (const segment of command.split(/[;&|\n(){}]|\b(?:do|then|else)\b/)) {
    const words = segment.trim().split(/\s+/).map((w) => w.replace(/^['"]|['"]$/g, "")).filter(Boolean);
    let i = 0;
    while (i < words.length && (/^\w+=/.test(words[i]) || WRAPPERS.has(words[i]))) i++;
    if (words[i] === "uv" && words[i + 1] === "run") i += 2;
    let candidate = words[i];
    if (candidate !== undefined && INTERPRETERS.has(candidate)) {
      i++;
      while (i < words.length && words[i].startsWith("-")) i++;
      candidate = words[i];
    } else if (candidate !== undefined && !candidate.includes("/")) {
      continue;
    }
    if (candidate === undefined) continue;
    const expanded = candidate.startsWith("~/") ? join(homedir(), candidate.slice(2)) : candidate;
    paths.push(isAbsolute(expanded) ? expanded : resolve(cwd, expanded));
  }
  return paths;
}

const input = JSON.parse(await Bun.stdin.text()) as { tool_input?: { command?: unknown }; cwd?: unknown; session_id?: unknown };
const command = typeof input.tool_input?.command === "string" ? input.tool_input.command : "";
const cwd = typeof input.cwd === "string" ? input.cwd : process.cwd();

let where = "this command";
let rule = firstRule(command);
for (const path of rule === undefined ? scriptsRun(command, cwd) : []) {
  const file = Bun.file(path);
  if (!(await file.exists()) || file.size > SCRIPT_MAX_BYTES) continue;
  rule = firstRule(await file.text());
  if (rule !== undefined) {
    where = `the script it runs (${path})`;
    break;
  }
}
if (rule === undefined) process.exit(0);

const log = join(homedir(), ".cache/no-host-load/blocked.log");
await mkdir(dirname(log), { recursive: true });
const entry = { time: new Date().toISOString(), session: input.session_id ?? null, cwd, rule, where, command: command.slice(0, COMMAND_LOG_CHARS) };
await appendFile(log, JSON.stringify(entry) + "\n");
console.error(
  `Blocked by the host-load hook: ${where} starts ${rule}.\n` +
    "This machine is shared: CPU, memory or disk burners skew every other gate and check running on it.\n" +
    "Force the race instead: inject the delay at the racy point, use a fake clock, or wait on an event or barrier.\n" +
    `Rule: ${RULE_DOC}, Testing: "Never load the host to reproduce a flake."`,
);
process.exit(2);
