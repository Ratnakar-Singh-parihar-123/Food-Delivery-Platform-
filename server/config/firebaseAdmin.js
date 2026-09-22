import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../food-app-778b7-firebase-adminsdk-fbsvc-0ff27c3f9c.json",
    ),
    "utf8",
  ),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
