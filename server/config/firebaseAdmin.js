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

// import admin from "firebase-admin";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// let serviceAccount;

// try {
//   // Production / Render
//   if (process.env.FIREBASE_SERVICE_ACCOUNT) {
//     serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
//   }
//   // Local development
//   else {
//     const serviceAccountPath = path.join(
//       __dirname,
//       "../foodmitra-266d2-firebase-adminsdk-fbsvc-694eea8b74.json",
//     );

//     serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
//   }
// } catch (error) {
//   console.error("❌ Firebase Admin configuration failed:", error.message);
//   process.exit(1);
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// console.log("✅ Firebase Admin initialized successfully");

// export default admin;

import admin from "firebase-admin";

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase environment variables are missing");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin configuration failed:", error.message);
  process.exit(1);
}

export default admin;
