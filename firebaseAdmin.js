const admin = require("firebase-admin");
const serviceAccount = require(process.env.FIREBASE_KEY); // Ganti dengan path ke file kredensial Firebase kamu

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
