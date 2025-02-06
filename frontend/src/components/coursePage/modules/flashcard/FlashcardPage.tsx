import React, { useState, useEffect } from "react";
import { useFlashcardContext } from "../../../../context/FlashcardContext";
import { useParams } from "react-router-dom";
import Flashcard from "./Flashcard"; // Assuming you have a Flashcard component
import "../../../../styles/FlashcardPage.css"; // Import CSS for styling
import BaseWrapper from "../../../base/BaseWrapper";
import DropdownMenu from "../../../DropdownMenu";

const FlashcardPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { flashcards, fetchFlashcards, loading, deleteFlashcard } =
    useFlashcardContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards(Number(moduleId));
    }
  }, [moduleId, fetchFlashcards]);

  if (!flashcards) {
    return <div>No Flaschards found</div>;
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : flashcards.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < flashcards.length - 1 ? prevIndex + 1 : 0
    );
  };

  if (loading) {
    return <div>Loading flashcards...</div>;
  }

  return (
    <div className="flashcard-page">
      {flashcards && flashcards.length > 0 ? (
        <>
          <div className="flashcard-container">
            <Flashcard
              key={flashcards[currentIndex].id}
              question={flashcards[currentIndex].question}
              answer={flashcards[currentIndex].answer}
            />
          </div>
          <div className="navigation-container">
            <div className="navigation-buttons">
              <button
                onClick={handlePrevious}
                className="btn-circular btn-previous"
                disabled={currentIndex === 0}
              >
                &#8592;
              </button>
              <button
                onClick={handleNext}
                className="btn-circular btn-next"
                disabled={currentIndex === flashcards.length - 1}
              >
                &#8594;
              </button>
            </div>
            <div className="flashcard-options">
              <DropdownMenu
                buttonContent={<i className="fas fa-pen"></i>}
                options={[
                  {
                    label: "Delete",
                    action: () => {
                      deleteFlashcard(flashcards[currentIndex].id);
                    },
                  },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <div>No flashcards available.</div>
      )}
    </div>
  );  
};

const FlashcardPageWrapper: React.FC = () => {
  const { moduleId,courseId} = useParams<{ moduleId: string; courseId: string }>();
  return (
    <BaseWrapper
      options={[
        { link: "/courses", label: "Home" },
        { link: `/course/${courseId}/module/${moduleId}`, label: "Back to Lesson" },
      ]}
    >
      <FlashcardPage />
    </BaseWrapper>
  );
};
export default FlashcardPageWrapper;
