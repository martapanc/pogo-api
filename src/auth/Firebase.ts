import * as dotenv from "dotenv";

dotenv.config();

const admin = require('firebase-admin');

const serviceAccount = require(`./pogo-connect-api-firebase-${process.env.FIREBASE_SERVICE_ACCOUNT_KEY}.json`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

export default admin;
