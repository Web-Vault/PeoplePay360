console.log('[TEST] Before requiring server.js');
const t = setTimeout(()=>{ console.log('[TEST] Timeout 12s reached - something blocks'); process.exit(5); }, 12000);
const app = require('./server.js');
console.log('[TEST] After require, typeof app:', typeof app);
setTimeout(()=>{ clearTimeout(t); console.log('[TEST] 3s after require, process still running'); process.exit(99); }, 3000);
