import { firestore } from "../config/firebaseAdmin";

export const usersCollection = firestore.collection("users");
export const reportsCollection = firestore.collection("reports");
export const sectionsCollection = firestore.collection("sections");
export const entriesCollection = firestore.collection("entries");
