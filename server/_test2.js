console.log('[TEST2] Before requiring server.js');
const app = require('./server.js');
console.log('[TEST2] After require, typeof app:', typeof app);
let ticks = 0;
setInterval(()=>{ ticks++; console.log('[TEST2] alive tick=', ticks); if(ticks>=6) process.exit(0); }, 1200);
process.on('exit', c => console.log('[TEST2] process.on(exit) code=', c));
process.on('uncaughtException', e => console.log('[TEST2] UNCAUGHT:', e.message));
