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
        <img src="/achieve_a_mark.png"  className="watermark" />
          <div className="flashcard-content">
            <p>{question}</p>
          </div>
        </div>
        <div className="flashcard-back">
        <img src="/achieve_a_mark.png"  className="watermark" />
          <div className="flashcard-content">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;