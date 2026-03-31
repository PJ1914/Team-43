import { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebaseAdmin";
import { usersCollection } from "../services/firestoreService";
import { Role } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: Role;
    name: string;
    department: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    const token = header.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await usersCollection.doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const profile = userDoc.data() as {
      role: Role;
      name: string;
      department: string;
    };

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: profile.role,
      name: profile.name,
      department: profile.department,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: (error as Error).message });
  }
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};
