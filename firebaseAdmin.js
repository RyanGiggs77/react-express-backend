const admin = require("firebase-admin");
require('dotenv').config();

// Pastikan FIREBASE_CREDENTIALS sudah diset di environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
