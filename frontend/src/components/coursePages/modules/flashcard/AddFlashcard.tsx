import React, { useState, useCallback } from "react";
import { useFlashcardContext } from "../../../../context/FlashcardContext";
import { useParams } from "react-router-dom";
import "../../../../styles/AddFlashcard&Link.css";
import BaseWrapper from "../../../base/BaseWrapper";

const AddFlashcard: React.FC = () => {
  const { addFlashcard } = useFlashcardContext();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [formData, setFormData] = useState({
    lesson_id: Number(moduleId),
    question: "",
    answer: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true); 
      try {
        await addFlashcard(
               formData,
        );
        setFormData({
          lesson_id: Number(moduleId),
          question: "",
          answer: "",
        });
       
        setSuccess(true);
        setTimeout(() => setSuccess(false), 7000)
      } catch (error) {
        console.error("Failed to add flashcard", error);
      } finally {
        setLoading(false);
      }
    },
    [addFlashcard, formData, moduleId]
  );

  return (
    <>
      <p>Add the lesson's flashcards one by one</p>
      <form onSubmit={handleSubmit} className="add-flashcard-link-form">
        <div className="form-group">
          <label htmlFor="question">Question:</label>
          <input
            type="text"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Enter the question"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="answer">Answer:</label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Enter the answer"
            className="form-control"
          />
        </div>
        {success && (
          <div className="alert alert-cstm-success">
            Flashcard added successfully, you can add a new one and view them in the lesson page!
          </div>
        )}
        <button type="submit" disabled={loading} className="btn btn-cstm">
          {loading ? "Adding..." : "Add Flashcard"}
        </button>
      </form>
    </>
  );
};

const AddFlashcardWrapper: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();

  return (
    <BaseWrapper
      options={[
        { link: "/home", label: "Home" },
        { link: `/modulePage/${moduleId}`, label: "Back to Lesson" },
      ]}
    >
      <AddFlashcard />
    </BaseWrapper>
  );
};

export default AddFlashcardWrapper;
