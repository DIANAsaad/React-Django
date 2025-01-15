import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
  } from "react";
  import axios from "axios";
  import { useAuth } from "./AuthContext";



// Define the shape of the flashcard

interface Flashcard{
    id: number;
    question: string;
    answer:string
}


// Define the context structure

interface FlashcardContextProps{
    flashcards: Flashcard[]| null;
    fetchFlashcards: (moduleId: number)=> Promise<void>;
    deleteFlashcard: (flashcardId: number) => Promise<void>;
    addFlashcard: (moduleId:number, question: string, answer:string)=> Promise<void>;
    loading: boolean;
    error: string | null;
}

const FlashcardContext = createContext<FlashcardContextProps | undefined>(undefined);

const ENDPOINT = "http://localhost:8000";

export const FlashcardProvider = ({children}: {children: ReactNode}) => {
      const { accessToken } = useAuth();
      const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
      const [loading, setLoading] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);

      const fetchFlashcards = useCallback(
        async (moduleId: number) => {
          if (!accessToken) {
            setError("No access token available");
            return;
          }
     
          try {
            setLoading(true);
            const response = await axios.get(`${ENDPOINT}/flashcards/${moduleId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setFlashcards(response.data.flashcards ?? []);
          } catch (err) {
            setError("Failed to fetch flashcards");
          } finally {
            setLoading(false);
          }
        },
        [accessToken]
      );


    const addFlashcard = useCallback(
    async (
      moduleId: number,
      question: string,
      answer:string
     
    ) => {
      try {
        const formData = new FormData();
        formData.append("module_id", moduleId.toString());
        formData.append("question", question);
        formData.append("answer", answer);
        const response = await axios.post(`${ENDPOINT}/add_flashcard`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setFlashcards((prevFlashcards) => [
          ...(prevFlashcards || []),
         response.data,
        ]);
      } catch (error: any) {
        console.error(
          `Error adding flashcard:`,
          error.response?.data || error.message
        );
        alert(
          `An error occurred while adding the flashcard: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [accessToken]
  );

  const deleteFlashcard = useCallback(
    async (flashcardId: number) => {
      const flashcard = flashcards.find((f) => f.id === flashcardId);

      if (!flashcard) {
        alert("Flashcard not found");
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_flashcard/${flashcardId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setFlashcards(flashcards.filter((f) => f.id !== flashcardId));
      } catch (error) {
        console.error(`Error deleting flashcard:`, error);
        alert(`An error occurred while deleting the flashcard. Please try again.`);
      }
    },
    [flashcards, accessToken]
  );

  return (
    <FlashcardContext.Provider
      value={{
        flashcards,
        fetchFlashcards,
        deleteFlashcard,
        addFlashcard,
        loading,
        error,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcardContext = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcardContext must be used within a FlashcardProvider");
  }
  return context;
};

