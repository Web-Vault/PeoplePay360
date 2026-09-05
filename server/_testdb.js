require('dotenv').config();
const { connectDB } = require('./config/db');
console.log('[DBTEST] MONGO_URI set:', !!process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'no');
console.log('[DBTEST] PORT:', process.env.PORT);
console.log('[DBTEST] Calling connectDB...');
const t = setTimeout(() => {
  console.log('[DBTEST] TIMEOUT after 10s');
  process.exit(2);
}, 10000);
connectDB()
  .then(() => {
    clearTimeout(t);
    console.log('[DBTEST] CONNECT OK');
    process.exit(0);
  })
  .catch((e) => {
    clearTimeout(t);
    console.log('[DBTEST] CONNECT ERROR:', e.message);
    process.exit(1);
  });
