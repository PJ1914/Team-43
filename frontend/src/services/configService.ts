import api from "./api";

export interface SectionConfig {
  id: string;
  name: string;
}

export interface SectionField {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface SectionSchema {
  id: string;
  name: string;
  fields: SectionField[];
}

/**
 * Fetches all section configurations from the API
 */
export const getSections = async (): Promise<SectionConfig[]> => {
  const { data } = await api.get<{ sections: SectionConfig[] }>("/config/sections");
  return data.sections;
};

/**
 * Fetches all department names from the API
 */
export const getDepartments = async (): Promise<string[]> => {
  const { data } = await api.get<{ departments: string[] }>("/config/departments");
  return data.departments;
};

/**
 * Fetches all section schemas from the API
 */
export const getSchemas = async (): Promise<Record<string, SectionSchema>> => {
  const { data } = await api.get<{ schemas: Record<string, SectionSchema> }>("/config/schemas");
  return data.schemas;
};
