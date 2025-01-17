import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFlashcardContext } from "../../../../context/FlashcardContext";
import "../../../styles/flashcards.css";


interface FlashcardProps {
  question: string;
  answer: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={handleFlip}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <strong>Question:</strong> {question}
        </div>
        <div className="flashcard-back">
          <strong>Answer:</strong> {answer}
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;

