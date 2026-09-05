console.log('[SRVTEST] Starting...');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');

async function go() {
  console.log('[SRVTEST] Calling connectDB...');
  try { await connectDB(); console.log('[SRVTEST] DB OK'); }
  catch(e){ console.log('[SRVTEST] DB FAIL:', e.message); process.exit(1); }
  const PORT = process.env.PORT || 5000;
  const app = express();
  app.get('/api/health', (req,res)=> res.json({ok:1, mongoose: mongoose.connection.readyState}));
  console.log('[SRVTEST] calling app.listen(' + PORT + ')');
  const server = app.listen(PORT);
  server.once('listening', ()=>{
    console.log('[SRVTEST] LISTENING on port', PORT);
  });
  server.on('error', (err)=>{
    console.log('[SRVTEST] SERVER EVENT ERROR:', err.code, err.message);
  });
  setTimeout(()=>{
    console.log('[SRVTEST] After 3s, state:',
      server.listening ? 'LISTENING' : 'NOT LISTENING',
      'readyState=', mongoose.connection.readyState);
    process.exit(server.listening ? 0 : 4);
  }, 3000);
}
go();
