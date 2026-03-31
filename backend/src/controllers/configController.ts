import { Request, Response } from "express";
import { firestore as db } from "../config/firebaseAdmin";

/**
 * GET /api/config/sections
 * Returns all section definitions
 */
export const getSections = async (req: Request, res: Response) => {
  try {
    const configDoc = await db.collection("config").doc("sections").get();
    
    if (!configDoc.exists) {
      return res.status(404).json({ error: "Sections configuration not found" });
    }

    const sections = configDoc.data()?.sections || [];
    res.json({ sections });
  } catch (error) {
    console.error("Error fetching sections config:", error);
    res.status(500).json({ error: "Failed to fetch sections configuration" });
  }
};

/**
 * GET /api/config/departments
 * Returns all department names
 */
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const configDoc = await db.collection("config").doc("departments").get();
    
    if (!configDoc.exists) {
      return res.status(404).json({ error: "Departments configuration not found" });
    }

    const departments = configDoc.data()?.departments || [];
    res.json({ departments });
  } catch (error) {
    console.error("Error fetching departments config:", error);
    res.status(500).json({ error: "Failed to fetch departments configuration" });
  }
};

/**
 * GET /api/config/schemas
 * Returns all section schemas
 */
export const getSchemas = async (req: Request, res: Response) => {
  try {
    const configDoc = await db.collection("config").doc("schemas").get();
    
    if (!configDoc.exists) {
      return res.status(404).json({ error: "Schemas configuration not found" });
    }

    const schemas = configDoc.data()?.schemas || {};
    res.json({ schemas });
  } catch (error) {
    console.error("Error fetching schemas config:", error);
    res.status(500).json({ error: "Failed to fetch schemas configuration" });
  }
};
