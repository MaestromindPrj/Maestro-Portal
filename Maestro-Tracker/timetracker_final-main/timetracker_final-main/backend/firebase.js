const admin = require("firebase-admin");
const serviceAccount = require("./timetracker-29cab-firebase-adminsdk-fbsvc-f9fd1c9c76.json"); // put this file in /backend

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;