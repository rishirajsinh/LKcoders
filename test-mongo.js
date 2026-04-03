const mongoose = require('mongoose');
require('dotenv').config({path: './backend/.env'});

console.log('Connecting to', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('SUCCESS'); process.exit(0); })
  .catch(e => { console.error('FAIL', e); process.exit(1); });
