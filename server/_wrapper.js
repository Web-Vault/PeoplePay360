const { spawn } = require('child_process');
const s = spawn(process.execPath, ['server.js'], { cwd: __dirname, stdio: 'pipe' });
let out='', err='';
s.stdout.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
s.stderr.on('data', d => { err += d.toString(); process.stderr.write(d.toString()); });
s.on('close', (code) => {
  console.log('\n[WRAPPER] child exit code', code, 'stdout.len=', out.length, 'stderr.len=', err.length);
});
setTimeout(()=>{ console.log('\n[WRAPPER] 6 second mark: sending GET /api/health ...');
  try {
    const http = require('http');
    http.get('http://localhost:5000/api/health', (r) => {
      let d=''; r.on('data', c=>d+=c); r.on('end', ()=> console.log('[WRAPPER] /api/health HTTP', r.statusCode, d.slice(0,150)));
    }).on('error', e => console.log('[WRAPPER] /api/health error:', e.message));
  } catch(e) { console.log('[WRAPPER] http test failed:', e.message); }
}, 6000);
setTimeout(()=> { console.log('\n[WRAPPER] 9 second mark: stopping child.'); s.kill('SIGINT'); process.exit(0); }, 9000);
