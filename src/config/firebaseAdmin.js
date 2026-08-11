import { initializeApp, cert, getApps } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// ==========================
// Current File Path
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// Firebase Service Account
// ==========================
let serviceAccount;

const serviceAccountPath = path.resolve(
  __dirname,
  "../../firebase-service-account.json"
);

// Local development:
// Use firebase-service-account.json if it exists.
if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );
}

// Render / Production:
// Use FIREBASE_SERVICE_ACCOUNT environment variable.
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );
  } catch (error) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT environment variable contains invalid JSON."
    );
  }
}

// ==========================
// Validate Firebase Credentials
// ==========================
if (!serviceAccount) {
  throw new Error(
    "Firebase service account credentials not found. " +
      "Add firebase-service-account.json locally or " +
      "set FIREBASE_SERVICE_ACCOUNT in the deployment environment."
  );
}

// ==========================
// Initialize Firebase Admin
// ==========================
const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });

// ==========================
// Export Firebase Admin App
// ==========================
export default app;