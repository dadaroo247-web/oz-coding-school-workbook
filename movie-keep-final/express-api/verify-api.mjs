import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 실제 제출 서버를 실행하고, 추가 데이터 실험만 임시 소스 사본에서 합니다.
// server.js는 수정하지 않습니다. 테스트용 서버는 매 단계 종료 후 재시작합니다.
const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(directory, "server.js");
const original = await readFile(sourcePath, "utf8");
const temporaryPath = path.join(directory, `.verify-server-${process.pid}.js`);
const resultsPath = path.resolve(directory, "../results/express-http.json");
const sourceHash = createHash("sha256").update(original).digest("hex");
const added30 = { id: 30, userId: "user-b", movieId: 106, memo: "" };
const added31 = { id: 31, userId: "user-c", movieId: 105, memo: "추가 검증 영화" };
const scenarios = [
  { name: "initial", added: [], count: 8 },
  { name: "add-id-30", added: [added30], count: 9 },
  { name: "add-id-31", added: [added30, added31], count: 10 },
  { name: "remove-id-30", added: [added31], count: 9 },
  { name: "restore-initial", added: [], count: 8 },
];

// 기존 4000 포트 서비스를 중지하거나 검증 대상으로 오인하지 않습니다.
const probe = net.createServer();
probe.listen(4000);
await once(probe, "listening");
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));

const report = {
  checkedAt: new Date().toISOString(),
  node: process.version,
  serverSourceSha256: sourceHash,
  baseUrl: "http://localhost:4000",
  method: "Each stage starts a fresh real Express process; mutation stages use a temporary source copy.",
  stages: [],
};
let baseline;
let server;

async function stopServer() {
  if (server && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    await exited;
  }
  server = undefined;
}

async function request(route) {
  const response = await fetch(`${report.baseUrl}${route}`, { signal: AbortSignal.timeout(5000) });
  const body = await response.text();
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get("content-type"), /application\/json/);
  return {
    url: response.url,
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body,
    json: JSON.parse(body),
  };
}

try {
  for (const scenario of scenarios) {
    let entryPoint = sourcePath;
    if (scenario.added.length) {
      const marker = "\n];";
      assert.equal(original.split(marker).length, 2, "Expected exactly one favorites array");
      const extraRows = scenario.added.map(row => `  ${JSON.stringify(row)},`).join("\n");
      await writeFile(temporaryPath, original.replace(marker, `\n${extraRows}${marker}`));
      entryPoint = temporaryPath;
    }
    server = spawn(process.execPath, [entryPoint], { cwd: directory, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    server.stderr.on("data", chunk => { stderr += chunk.toString(); });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Server start timed out: ${stderr}`)), 10000);
      server.once("error", error => { clearTimeout(timer); reject(error); });
      server.once("exit", code => { clearTimeout(timer); reject(new Error(`Server exited (${code}): ${stderr}`)); });
      server.stdout.on("data", chunk => {
        stdout += chunk.toString();
        if (stdout.includes("http://localhost:4000")) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    const home = await request("/");
    const list = await request("/api/favorites");
    const count = await request("/api/favorite-count");
    assert.deepEqual(home.json, { message: "MovieKeep 찜 API 서버입니다." });
    assert.ok(Array.isArray(list.json));
    assert.equal(list.json.length, scenario.count);
    assert.deepEqual(count.json, { favoriteCount: scenario.count });
    if (!baseline) {
      baseline = list.json;
      assert.deepEqual(baseline.map(row => row.id), [1, 2, 3, 4, 5, 6, 7, 8]);
    }
    assert.deepEqual(list.json, [...baseline, ...scenario.added]);
    report.stages.push({
      stage: scenario.name,
      expectedCount: scenario.count,
      addedToInitialArray: scenario.added,
      serverEntry: entryPoint === sourcePath ? "server.js" : "temporary copy of server.js",
      serverStdout: stdout.trim(),
      serverStderr: stderr,
      requests: [home, list, count],
      passed: true,
    });
    await stopServer();
    console.log(`PASS ${scenario.name}: list=${list.json.length}, count=${count.json.favoriteCount}`);
  }
  assert.equal(await readFile(sourcePath, "utf8"), original, "Submission source must remain unchanged");
  report.finalSourceUnchanged = true;
  report.passed = true;
  await mkdir(path.dirname(resultsPath), { recursive: true });
  await writeFile(resultsPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log("PASS original source unchanged; final array restored to the initial 8 records.");
  console.log("HTTP evidence: ../results/express-http.json");
} finally {
  await stopServer();
  await rm(temporaryPath, { force: true });
}
