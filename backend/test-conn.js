require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    return mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
  });
