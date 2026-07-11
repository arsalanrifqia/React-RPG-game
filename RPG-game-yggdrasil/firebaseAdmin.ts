import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
      clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });

export const firestore = getFirestore(app);
