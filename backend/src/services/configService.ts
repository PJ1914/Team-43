import { firestore as db } from "../config/firebaseAdmin";

interface SectionConfig {
  id: string;
  name: string;
}

interface SectionField {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface SectionSchema {
  id: string;
  name: string;
  fields: SectionField[];
}

// In-memory cache
let sectionsCache: SectionConfig[] | null = null;
let departmentsCache: string[] | null = null;
let schemasCache: Record<string, SectionSchema> | null = null;

/**
 * Fetches sections configuration from Firestore with caching
 */
export const getSectionsConfig = async (): Promise<SectionConfig[]> => {
  if (sectionsCache) {
    return sectionsCache;
  }

  const configDoc = await db.collection("config").doc("sections").get();
  if (!configDoc.exists) {
    throw new Error("Sections configuration not found in database");
  }

  sectionsCache = configDoc.data()?.sections || [];
  return sectionsCache!;
};

/**
 * Fetches departments configuration from Firestore with caching
 */
export const getDepartmentsConfig = async (): Promise<string[]> => {
  if (departmentsCache) {
    return departmentsCache;
  }

  const configDoc = await db.collection("config").doc("departments").get();
  if (!configDoc.exists) {
    throw new Error("Departments configuration not found in database");
  }

  departmentsCache = configDoc.data()?.departments || [];
  return departmentsCache!;
};

/**
 * Fetches section schemas configuration from Firestore with caching
 */
export const getSchemasConfig = async (): Promise<Record<string, SectionSchema>> => {
  if (schemasCache) {
    return schemasCache;
  }

  const configDoc = await db.collection("config").doc("schemas").get();
  if (!configDoc.exists) {
    throw new Error("Schemas configuration not found in database");
  }

  schemasCache = configDoc.data()?.schemas || {};
  return schemasCache!;
};

/**
 * Gets a specific section schema by ID
 */
export const getSectionSchema = async (sectionId: string): Promise<SectionSchema | null> => {
  const schemas = await getSchemasConfig();
  return schemas[sectionId] || null;
};

/**
 * Clears all configuration caches (useful for testing or manual refresh)
 */
export const clearConfigCache = () => {
  sectionsCache = null;
  departmentsCache = null;
  schemasCache = null;
};
