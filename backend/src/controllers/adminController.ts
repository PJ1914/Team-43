import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import { usersCollection } from "../services/firestoreService";

const roleSchema = z.object({ role: z.enum(["faculty", "coordinator", "admin"]) });

export const getUsers = async (_req: AuthenticatedRequest, res: Response) => {
  const snapshot = await usersCollection.get();
  const users = snapshot.docs.map((doc) => doc.data());
  return res.status(200).json({ users });
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const uid = String(req.params.uid ?? "");
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid role" });
  }

  await usersCollection.doc(uid).set({ role: parsed.data.role }, { merge: true });
  return res.status(200).json({ message: "Role updated" });
};
