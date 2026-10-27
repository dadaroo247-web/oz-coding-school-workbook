// 실제 /api 응답을 같은 서버의 검증 화면에서 요청하여 URL·상태·본문을 표시합니다.
// server.js는 변경하지 않고 임시 사본을 실행합니다. Ctrl+C로 종료하면 사본을 지웁니다.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const original = new URL('./server.js', import.meta.url);
const temporary = new URL(`./.capture-server-${process.pid}.js`, import.meta.url);
let source = await readFile(original, 'utf8');
const nine = process.argv.includes('--nine');
if (nine) source = source.replace('\n];', '\n  { id: 30, userId: "user-b", movieId: 106, memo: "" },\n];');
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>MovieKeep 실제 API 검증</title>
<style>body{font:16px system-ui;margin:32px;background:#f4f6f8;color:#17222e}main{max-width:1150px;margin:auto}h1{font-size:25px}p{line-height:1.6}section{background:white;border:1px solid #d7dde4;border-radius:12px;padding:20px;margin:18px 0}a{color:#185fba}pre{white-space:pre-wrap;word-break:break-word;font:15px/1.6 monospace}#rows{display:grid;grid-template-columns:1fr 1fr;gap:10px}#rows pre{margin:0;padding:10px;background:#f5f7fa;border-radius:6px}#count{font-size:22px}small{color:#59636f}</style>
<main><h1>MovieKeep · 실제 Express API 응답</h1><p>검증용 화면입니다. 아래 결과는 표시된 주소로 보낸 실제 GET 요청의 응답이며 예시 데이터가 아닙니다.</p><section><h2>찜 목록</h2><a id="listUrl"></a><p id="listStatus">요청 중</p><div id="rows"></div></section><section><h2>찜 개수</h2><a id="countUrl"></a><p id="countStatus">요청 중</p><pre id="count"></pre></section><small id="time"></small></main>
<script>
async function load(route, prefix) {
 const url = location.origin + route;
 const link = document.getElementById(prefix+'Url'); link.textContent='GET '+url; link.href=url;
 const response = await fetch(url, {cache:'no-store'}); const data = await response.json();
 document.getElementById(prefix+'Status').textContent='HTTP '+response.status+' · '+response.headers.get('content-type')+(Array.isArray(data)?' · '+data.length+'건':'');
 if(prefix==='list') { for(const item of data){const row=document.createElement('pre'); row.textContent=JSON.stringify(item,null,2); document.getElementById('rows').appendChild(row);} }
 else document.getElementById('count').textContent=JSON.stringify(data);
}
Promise.all([load('/api/favorites','list'),load('/api/favorite-count','count')]).then(()=>{document.getElementById('time').textContent='실제 요청 시각: '+new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' (KST)';}).catch(error=>{document.getElementById('time').textContent='요청 실패: '+error.message;});
</script></html>`;
source = source.replace('app.listen(4000', `app.get('/__evidence', (req, res) => res.send(${JSON.stringify(html)}));\n\napp.listen(4000`);
await writeFile(temporary, source);
const child = spawn(process.execPath,[fileURLToPath(temporary)],{stdio:'inherit'});
process.on('SIGINT',()=>child.kill('SIGINT'));
process.on('SIGTERM',()=>child.kill('SIGTERM'));
child.on('exit',async code=>{await rm(temporary,{force:true});process.exit(code ?? 0);});
child.on('error',async error=>{await rm(temporary,{force:true});console.error(error.message);process.exit(1);});
console.log('검증 화면: http://localhost:4000/__evidence (배열 '+(nine?9:8)+'건)');
