import React, { useState } from "react";
import "../../../../styles/Flashcards.css"; // Import the CSS file for styling

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
          <div className="flashcard-content">
            <p>{question}</p>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-content">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;