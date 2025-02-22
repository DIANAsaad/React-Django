import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

//Define the shape of a Module

export interface Module {
  id: number;
  module_title: string;
  topic: string;
  module_image: File | string;
  course_id: number;
  lesson_pdf: File | string;
  module_creator: {
    first_name: string;
    last_name: string;
  };
}

// Define the context structure

interface ModuleContextProps {
  modules: Module[] | null;
  fetchModules: (courseId: number) => Promise<void>;
  deleteModule: (moduleId: number) => Promise<void>;
  fetchModulesById: (moduleId: number) => Promise<Module>;
  addModule: (
    courseId: number,
    Module_name: string,
    topic: string,
    module_image: File | null,
    lesson_pdf: File | null
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ModuleContext = createContext<ModuleContextProps | undefined>(undefined);

const ENDPOINT = "http://localhost:8000";

const normalizeModule = (module: Module) => ({
  ...module,
  module_image: module.module_image
    ? module.module_image?.toString().startsWith(ENDPOINT)
      ? module.module_image
      : `${ENDPOINT}${module.module_image}`
    : "/achieve_a_mark.png",
  lesson_pdf: module.lesson_pdf
    ? module.lesson_pdf?.toString().startsWith(ENDPOINT)
      ? module.lesson_pdf
      : `${ENDPOINT}${module.lesson_pdf}`
    : "/*",
});

const normalizeModules = (modules: Module[]) => {
  return modules.map(normalizeModule);
};

// Provider component
export const ModuleProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(
    async (courseId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/modules/${courseId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setModules(normalizeModules(response.data.modules ?? []));
      } catch (err) {
        setError("Failed to fetch modules");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // This function will fetch modules using the ID's

  const fetchModulesById = useCallback(
    async (moduleId: number): Promise<Module> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/module/${moduleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const module = normalizeModule(response.data.module);

        return module;
      } catch (err) {
        throw new Error("Failed to fetch module");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const addModule = useCallback(
    async (
      courseId: number,
      module_title: string,
      topic: string,
      module_image: File | null,
      lesson_pdf: File | null
    ) => {
      try {
        const formData = new FormData();
        formData.append("course_id", courseId.toString());
        formData.append("module_title", module_title);
        formData.append("topic", topic);
        if (module_image) formData.append("module_image", module_image);
        if (lesson_pdf) formData.append("lesson_pdf", lesson_pdf);
        const response = await axios.post(`${ENDPOINT}/add_module`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setModules((prevModules) => [
          ...(prevModules || []),
          normalizeModule(response.data),
        ]);
      } catch (error: any) {
        console.error(
          `Error adding module:`,
          error.response?.data || error.message
        );
        alert(
          `An error occurred while adding the module: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [accessToken]
  );

  const deleteModule = useCallback(
    async (moduleId: number) => {
      const module = modules.find((m) => m.id === moduleId);

      if (!module) {
        alert("Module not found");
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_module/${moduleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setModules(modules.filter((m) => m.id !== moduleId));
      } catch (error) {
        console.error(`Error deleting module:`, error);
        alert(`An error occurred while deleting the module. Please try again.`);
      }
    },
    [modules, accessToken]
  );

  return (
    <ModuleContext.Provider
      value={{
        modules,
        fetchModules,
        fetchModulesById,
        deleteModule,
        addModule,
        loading,
        error,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};

// Custom hook for easier usage of the context
export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModuleContext must be used within a ModuleProvider");
  }
  return context;
};
