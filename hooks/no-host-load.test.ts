// Drives no-host-load.ts as Claude Code does: hook JSON on stdin, exit 2 and stderr on a block, exit 0 otherwise.
// HOME points at a scratch directory so the block log is the test's own.
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const hook = join(import.meta.dir, "no-host-load.ts");
const scratch = await mkdtemp(join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "no-host-load-test-"));
afterAll(() => rm(scratch, { recursive: true, force: true }));

await Bun.write(join(scratch, ".scratch/loadrun.sh"), "#!/usr/bin/env bash\nfor i in $(seq 64); do yes > /dev/null & done\npytest \"$1\"\n");
await Bun.write(join(scratch, "fine.sh"), "#!/usr/bin/env bash\nyes | head -3\n");

async function run(command: string): Promise<{ code: number; stderr: string }> {
  const proc = Bun.spawn([process.execPath, hook], {
    stdin: new TextEncoder().encode(JSON.stringify({ tool_name: "Bash", tool_input: { command }, cwd: scratch, session_id: "test" })),
    stderr: "pipe",
    env: { ...process.env, HOME: scratch },
  });
  return { code: await proc.exited, stderr: await new Response(proc.stderr).text() };
}

describe("blocks", () => {
  for (const command of [
    "pids=; for i in $(seq 1 $(nproc)); do (yes > /dev/null & echo $! >> burn.pids); done; bun test",
    "yes &",
    "nohup yes y >/dev/null 2>&1 &",
    "stress-ng --cpu 8 --timeout 60",
    "timeout 60 stress --cpu 4",
    "while true; do :; done &",
    "dd if=/dev/zero of=/dev/null bs=1M",
    ":(){ :|:& };:",
  ]) {
    test(command, async () => {
      const { code, stderr } = await run(command);
      expect(code).toBe(2);
      expect(stderr).toContain("Never load the host to reproduce a flake");
    });
  }

  for (const command of [".scratch/loadrun.sh tests/test_ops.py > out 2>&1", "bash .scratch/loadrun.sh x", `bash ${join(scratch, ".scratch/loadrun.sh")}`]) {
    test(`a script that starts burners: ${command}`, async () => {
      const { code, stderr } = await run(command);
      expect(code).toBe(2);
      expect(stderr).toContain(join(scratch, ".scratch/loadrun.sh"));
    });
  }

  test("records the block", async () => {
    await run("yes &");
    const lines = (await Bun.file(join(scratch, ".cache/no-host-load/blocked.log")).text()).trim().split("\n");
    const last = JSON.parse(lines.at(-1) ?? "{}");
    expect(last.command).toBe("yes &");
    expect(last.session).toBe("test");
  });
});

describe("allows", () => {
  for (const command of [
    "ssh -o BatchMode=yes maci@host 'kubectl -n relumea rollout restart deploy/x >/dev/null'",
    "echo yes > /dev/null",
    "yes | head -3",
    "yes n | some-installer",
    "while true; do sleep 5; done",
    "cat .scratch/loadrun.sh",
    "rg -n \"yes > /dev/null\" logs.txt",
    "bash fine.sh",
    "bun test",
    "dd if=/dev/zero of=disk.img bs=1M count=8",
  ]) {
    test(command, async () => {
      expect((await run(command)).code).toBe(0);
    });
  }
});
