import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuizContext } from '../../../../context/QuizContext';

interface Question {
  question_text: string;
  question_type: string;
  correct_answer: string;
  question_point: string;
  question_time_limit: string;
  choices: string[];
}

const AddQuiz: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { addQuiz } = useQuizContext();

  const [formData, setFormData] = useState<{
    lesson_id: number;
    quiz_title: string;
    quiz_description: string;
    total_mark: number;
    time_limit: number;
    attempts_allowed: number;
    questions: Question[];
  }>({
    lesson_id: Number(moduleId),
    quiz_title: "",
    quiz_description: "",
    total_mark: 0,
    time_limit: 0,
    attempts_allowed: 0,
    questions: [
      {
        question_text: "",
        question_type: "",
        correct_answer: "",
        question_point: "",
        question_time_limit: "",
        choices: [""],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    type QuestionKey = keyof Question;
    const key = e.target.name as QuestionKey;
    const value = e.target.value;

    const newQuestions = [...formData.questions];

    if (key === "choices") {
      newQuestions[index].choices = value.split(",").map((choice) => choice.trim());
    } else {
      newQuestions[index] = { ...newQuestions[index], [key]: value };
    }

    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question_text: "",
          question_type: "",
          correct_answer: "",
          question_point: "",
          question_time_limit: "",
          choices: [""],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await addQuiz(formData);

        setFormData({
          lesson_id: Number(moduleId),
          quiz_title: "",
          quiz_description: "",
          total_mark: 0,
          time_limit: 0,
          attempts_allowed: 0,
          questions: [
            {
              question_text: "",
              question_type: "",
              correct_answer: "",
              question_point: "",
              question_time_limit: "",
              choices: [""],
            },
          ],
        });
      } catch (error) {
        console.error("Failed to add quiz", error);
        setError("Failed to add quiz");
      } finally {
        setLoading(false);
      }
    },
    [addQuiz, formData, moduleId]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="quiz_title">Quiz Title:</label>
        <input
          type="text"
          id="quiz_title"
          name="quiz_title"
          value={formData.quiz_title}
          onChange={handleChange}
          placeholder="Enter the quiz title"
          className="form-control"
        />
      </div>
      <div>
        <label htmlFor="quiz_description">Quiz Description:</label>
        <textarea
          id="quiz_description"
          name="quiz_description"
          value={formData.quiz_description}
          onChange={handleChange}
          placeholder="Enter the quiz description"
          className="form-control"
        />
      </div>
      <h3>Questions</h3>
      {formData.questions.map((question, index) => (
        <div key={index} className="question">
          <label htmlFor={`question_text_${index}`}>Question Text:</label>
          <input
            type="text"
            id={`question_text_${index}`}
            name="question_text"
            value={question.question_text}
            onChange={(e) => handleQuestionChange(index, e)}
            placeholder="Enter the question text"
            className="form-control"
          />
          <button type="button" onClick={() => removeQuestion(index)}>
            Remove Question
          </button>
        </div>
      ))}
      <button type="button" onClick={addQuestion}>Add Question</button>
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Quiz"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddQuiz;
