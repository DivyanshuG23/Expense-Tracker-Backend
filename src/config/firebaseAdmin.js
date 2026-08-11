import { initializeApp, cert, getApps } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ==========================
// Current File Path
// ==========================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// Firebase Service Account
// ==========================

const serviceAccountPath = path.resolve(
  __dirname,
  "../../firebase-service-account.json"
);

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Firebase service account file not found at: ${serviceAccountPath}`
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

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