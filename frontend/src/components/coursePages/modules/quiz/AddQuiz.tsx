import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Question, useQuizContext } from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/AddQuiz.css"

const AddQuiz: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { addQuiz } = useQuizContext();

  const [formData, setFormData] = useState<{
    module_id: number;
    quiz_title: string;
    quiz_description: string;
    total_mark: number;
    time_limit: number;
    attempts_allowed: number;
    questions: Question[];
  }>({
    module_id: Number(moduleId),
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
        question_point: 0,
        question_time_limit: 0,
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    type QuestionKey = keyof Question;
    const key = e.target.name as QuestionKey;
    const value = e.target.value;

    const newQuestions = [...formData.questions];

    if (key === "choices") {
      newQuestions[index].choices = value
        .split(",")
        .map((choice) => choice.trim());
    } else {
      newQuestions[index] = { ...newQuestions[index], [key]: value };
    }
    if (key === "question_type") {
      if (value === "TF") {
        newQuestions[index].question_type = "TF";
      } else if (value === "MCQ") {
        newQuestions[index].question_type = "MCQ";
      }
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
          question_type: "MCQ",
          correct_answer: "",
          question_point: 0,
          question_time_limit: 0,
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
          module_id: Number(moduleId),
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
              question_point: 0,
              question_time_limit: 0,
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
    <form onSubmit={handleSubmit} className="container mt-4">
      <div className="mb-3">
        <label htmlFor="quiz_title" className="form-label">
          Quiz Title:
        </label>
      
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

      <div className="mb-3">
        <label htmlFor="quiz_description" className="form-label">
          Quiz Description:
        </label>
        <textarea
          id="quiz_description"
          name="quiz_description"
          value={formData.quiz_description}
          onChange={handleChange}
          placeholder="Enter the quiz description"
          className="form-control"
        />
      </div>
   
      <div className="mb-3">
        <label htmlFor="time_limit" className="form-label">
          Time Limit:
        </label>
        <input
          type="number"
          id="time_limit"
          name="time_limit"
          value={formData.time_limit}
          onChange={handleChange}
          placeholder="Enter the quiz time limit"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="total_mark" className="form-label">
          Total Mark:
        </label>
        <input
          type="number"
          id="total_mark"
          name="total_mark"
          value={formData.total_mark}
          onChange={handleChange}
          placeholder="Enter the quiz total mark"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="attempts_allowed" className="form-label">
          Attempts Allowed:
        </label>
        <input
          type="number"
          id="attempts_allowed"
          name="attempts_allowed"
          value={formData.attempts_allowed}
          onChange={handleChange}
          placeholder="Enter the attempts allowed for this quiz"
          className="form-control"
        />
      </div>

      <h3>Questions</h3>
      {formData.questions.map((question, index) => (
        <div key={index} className="mb-4 p-3 border rounded">
          <div className="mb-3">
            <label htmlFor={`question_text_${index}`} className="form-label">
              Question Text:
            </label>
            <input
              type="text"
              id={`question_text_${index}`}
              name="question_text"
              value={question.question_text}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the question text"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`question_type_${index}`} className="form-label">
              Question Type:
            </label>
            <select
              id={`question_type_${index}`}
              name="question_type"
              onChange={(e) => handleQuestionChange(index, e)}
              className="form-control"
              value={question.question_type}
              required
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="TF">True/False</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor={`choices_${index}`} className="form-label">
              Choices:
            </label>
            <input
              type="text"
              id={`choices_${index}`}
              name="choices"
              value={question.choices.join(",")}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the choices separated by commas"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`correct_answer_${index}`} className="form-label">
              Correct Answer:
            </label>
            <input
              type="text"
              id={`correct_answer_${index}`}
              name="correct_answer"
              value={question.correct_answer}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the correct answer"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`question_point_${index}`} className="form-label">
              Question Point:
            </label>
            <input
              type="number"
              id={`question_point_${index}`}
              name="question_point"
              value={question.question_point}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the question point"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor={`question_time_limit_${index}`}
              className="form-label"
            >
              Question Time Limit:
            </label>
            <input
              type="number"
              id={`question_time_limit_${index}`}
              name="question_time_limit"
              value={question.question_time_limit}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the question time limit"
              className="form-control"
              required
            />
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => removeQuestion(index)}
          >
            Remove Question
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={addQuestion}>
        Add Question
      </button>
      <button type="submit" className="btn btn-success mt-3" disabled={loading}>
        {loading ? "Adding..." : "Add Quiz"}
      </button>
      {error && <p className="text-danger mt-3">{error}</p>}
    </form>
  );
};

const AddQuizWrapper: React.FC = () => {
  return (
    <BaseWrapper options={[{ link: "/home", label: "Home" }]}>
      <AddQuiz />
    </BaseWrapper>
  );
};
export default AddQuizWrapper;
