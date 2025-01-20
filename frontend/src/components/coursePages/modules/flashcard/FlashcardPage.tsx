import React, { useEffect} from "react";
import { useParams } from "react-router-dom";
import { useFlashcardContext } from "../../../../context/FlashcardContext";
import "../../../../styles/flashcards.css"; 
import Flashcard from "./Flashcard";

const FlashcardPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();

  const {
    flashcards,
    fetchFlashcards,
    loading,
  } = useFlashcardContext();

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards(Number(moduleId));
    }
  }, [moduleId, fetchFlashcards]);

  if (loading) {
    return <div>Loading flashcards...</div>;
  }

  return (
    <div className="flashcard-container">
      {flashcards && flashcards.length > 0 ? (
        flashcards.map((flashcard) => (
          <Flashcard key={flashcard.id} question={flashcard.question} answer={flashcard.answer} />
        ))
      ) : (
        <div>No flashcards available.</div>
      )}
    </div>
  );
};

export default FlashcardPage;