import { Request, Response } from "express";
import { z } from "zod";
import { adminAuth } from "../config/firebaseAdmin";
import { usersCollection } from "../services/firestoreService";
import { AuthenticatedRequest } from "../middleware/auth";

const loginSchema = z.object({ token: z.string().min(10) });

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const decoded = await adminAuth.verifyIdToken(parsed.data.token);
  const profileDoc = await usersCollection.doc(decoded.uid).get();

  if (!profileDoc.exists) {
    return res.status(404).json({ message: "User profile missing in users collection" });
  }

  return res.status(200).json({
    message: "Login successful",
    uid: decoded.uid,
  });
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ user: req.user });
};
