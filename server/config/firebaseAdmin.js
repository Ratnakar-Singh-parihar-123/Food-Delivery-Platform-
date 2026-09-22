// import admin from "firebase-admin";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const serviceAccount = JSON.parse(
//   fs.readFileSync(
//     path.join(
//       __dirname,
//       "../food-app-778b7-firebase-adminsdk-fbsvc-0ff27c3f9c.json",
//     ),
//     "utf8",
//   ),
// );

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export default admin;

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

try {
  // Production / Render
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  // Local development
  else {
    const serviceAccountPath = path.join(
      __dirname,
      "../food-app-778b7-firebase-adminsdk-fbsvc-0ff27c3f9c.json",
    );

    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  }
} catch (error) {
  console.error("❌ Firebase Admin configuration failed:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin initialized successfully");

export default admin;
