import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import axios from 'axios';

// Define the context structure

interface ExternalLink {
  id: number;
  link: string;
  description: string;
  lesson_id: number;
}

interface ExternalLinkContextProps {
  links: ExternalLink[] | null;
  fetchLinks: (lessonId: number) => Promise<void>;
  fetchLinkById: (linkId:number)=>Promise<ExternalLink>;
  deleteLink: (linkId: number) => Promise<void>;
  editLink: (linkId: number, data: { lesson_id: number; link: string; description: string }) => Promise<void>;
  addLink: ({
    lesson_id,
    link,
    description,
  }: {
    lesson_id: number;
    link: string;
    description: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;

}

const ExternalLinkContext = createContext<ExternalLinkContextProps | undefined>(
  undefined
);

const ENDPOINT = "http://localhost:8000";

export const ExternalLinkProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const fetchLinks = useCallback(
    async (moduleId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${ENDPOINT}/external_links/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setLinks(response.data.external_links ?? []);
     
      } catch (err) {
        setError("Failed to fetch External Links");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

 
  const fetchLinkById = useCallback(
    async (linkId: number): Promise<ExternalLink> => {
      setLoading(true);
      try {
        const response = await axios.get<{external_link:ExternalLink}>(`${ENDPOINT}/external_link/${linkId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        return response.data.external_link;
      } catch (err) {
        setError('Failed to fetch link');
        console.error(err);
        throw err;

      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );
  
  
  const addLink = useCallback(
    async ({
      lesson_id,
      link,
      description,
    }: {
      lesson_id: number;
      link: string;
      description: string;
    }) => {
      if (!lesson_id || !link || !description) {
        alert("All fields are required to add a external link.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("lesson_id", lesson_id.toString());
        formData.append("description", description);
        formData.append("link", link);

        const response = await axios.post(
          `${ENDPOINT}/add_external_link`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setLinks((prevLinks) => [...(prevLinks || []), response.data]);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        console.error(`Error adding External Link: ${errorMessage}`);
        alert(
          `An error occurred while adding the external link: ${errorMessage}`
        );
      }
    },
    [accessToken]
  );

  const editLink = useCallback(async (linkId:number, data:{ lesson_id: number; link: string; description: string }) => {
    try {
      const response = await axios.put(`${ENDPOINT}/edit_external_link/${linkId}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === linkId ? response.data : link))
      );
      return;
    } catch (error) {
      console.error('Error editing external link:', error);
      throw error;
    }
  }, [accessToken]);

  const deleteLink = useCallback(
    async (linkId: number) => {
      const Link = links.find((l) => l.id === linkId);
      if (!Link) {
        alert("link not found");
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_external_link/${linkId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setLinks(links.filter((l) => l.id !== linkId));
      } catch (error) {
        console.error(`Error deleting link:`, error);
        alert(`An error occurred while deleting the link. Please try again.`);
      }
    },
    [links, accessToken]
  );
  return (
    <ExternalLinkContext.Provider
      value={{
        links,
        editLink,
        fetchLinkById,
        fetchLinks,
        deleteLink,
        addLink,
        loading,
        error,
      
      }}
    >
      {children}
    </ExternalLinkContext.Provider>
  );
};

export const useExternalLinkContext = () => {
  const context = useContext(ExternalLinkContext);
  if (!context) {
    throw new Error(
      "useExternalLink must be used within a ExternalLinkContextProvider"
    );
  }
  return context;
};
