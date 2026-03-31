import { create } from "zustand";
import { getSections, getDepartments, getSchemas, SectionConfig, SectionSchema } from "../services/configService";

interface ConfigState {
  sections: SectionConfig[];
  departments: string[];
  schemas: Record<string, SectionSchema>;
  isLoaded: boolean;
  loadConfig: () => Promise<void>;
  getSchemaById: (sectionId: string) => SectionSchema | null;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  sections: [],
  departments: [],
  schemas: {},
  isLoaded: false,

  loadConfig: async () => {
    if (get().isLoaded) {
      return; // Already loaded, skip
    }

    try {
      const [sections, departments, schemas] = await Promise.all([
        getSections(),
        getDepartments(),
        getSchemas(),
      ]);

      set({
        sections,
        departments,
        schemas,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to load configuration:", error);
      throw error;
    }
  },

  getSchemaById: (sectionId: string) => {
    const { schemas } = get();
    return schemas[sectionId] || null;
  },
}));
