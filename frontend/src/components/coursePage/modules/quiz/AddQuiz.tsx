import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  QuestionWithoutId,
  useQuizContext,
} from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/AddQuiz.css";

const AddQuiz: React.FC = () => {
  const { moduleId, courseId } = useParams<{
    moduleId: string;
    courseId: string;
  }>();
  const { addQuiz, loading: quizLoading } = useQuizContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    module_id: number;
    quiz_title: string;
    quiz_description: string;
    total_mark: number | null;
    time_limit: number | null;
    attempts_allowed: number | null;
    questions: QuestionWithoutId[];
  }>({
    module_id: Number(moduleId),
    quiz_title: "",
    quiz_description: "",
    total_mark: null,
    time_limit: null,
    attempts_allowed: null,
    questions: [
      {
        question_text: "",
        question_type: "MCQ",
        correct_answer: "",
        question_point: null,
        question_time_limit: null,
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
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    const key = name as keyof QuestionWithoutId;
    setFormData((prevFormData) => {
      const updatedQuestions = [...prevFormData.questions];
      const questionToUpdate = { ...updatedQuestions[index] };

      switch (key) {
        case "choices": {
          const choices = value.split(",").map((choice) => choice.trim());
          questionToUpdate.choices = choices;
          questionToUpdate.correct_answer = choices[0] ?? "";
          break;
        }
        case "question_type": {
          questionToUpdate.question_type = value as QuestionWithoutId["question_type"];
          if (value === "TF") {
            questionToUpdate.choices = ["True", "False"];
            questionToUpdate.correct_answer = "True";
          }
          break;
        }
        case "question_text":
        case "correct_answer":{
          questionToUpdate[key] = value 
          break;
        }
        case "question_point":
        case "question_time_limit":{
          questionToUpdate[key]=value===""?null:Number(value);
          break;
        }
        default: {
          break;
        }
      }
      if (!questionToUpdate.question_type) {
        questionToUpdate.question_type = "MCQ";
      }
      updatedQuestions[index] = questionToUpdate;
      return { ...prevFormData, questions: updatedQuestions };
    });
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
          question_point: null,
          question_time_limit: null,
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
          total_mark: null,
          time_limit: null,
          attempts_allowed: null,
          questions: [
            {
              question_text: "",
              question_type: "MCQ",
              correct_answer: "",
              question_point: null,
              question_time_limit: null,
              choices: [""],
            },
          ],
        });
        navigate(`/course/${courseId}/module/${moduleId}`);
      } catch (error) {
        console.error("Failed to add quiz", error);
        setError("Failed to add quiz");
      } finally {
        setLoading(false);
      }
    },
    [addQuiz, formData, moduleId, courseId, navigate]
  );

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
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
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="quiz_description" className="form-label">
              Quiz Description:
            </label>
            <input
              type="text"
              id="quiz_description"
              name="quiz_description"
              value={formData.quiz_description}
              onChange={handleChange}
              placeholder="Enter the quiz description"
              className="form-control"
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="time_limit" className="form-label">
              Time Limit:
            </label>
            <input
              type="number"
              id="time_limit"
              name="time_limit"
              value={formData.time_limit ?? ""}
              onChange={handleChange}
              placeholder="Enter the quiz time limit"
              className="form-control"
              min="0"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="total_mark" className="form-label">
              Total Mark:
            </label>
            <input
              type="number"
              id="total_mark"
              name="total_mark"
              value={formData.total_mark ?? ""}
              onChange={handleChange}
              placeholder="Enter the quiz total mark"
              className="form-control"
              min="0"
              required
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="attempts_allowed" className="form-label">
              Attempts Allowed:
            </label>
            <input
              type="number"
              id="attempts_allowed"
              name="attempts_allowed"
              value={formData.attempts_allowed ?? ""}
              onChange={handleChange}
              placeholder="Enter the attempts allowed for this quiz"
              className="form-control"
              min="0"
            />
          </div>
        </div>
      </div>

      {formData.questions.map((question, index) => (
        <div key={index} className="question-container">
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor={`question_type_${index}`} className="form-label">
              Question Type:
            </label>
            <select
              id={`question_type_${index}`}
              name="question_type"
              onChange={(e) => handleQuestionChange(index, e)}
              className="form-control"
              value={question.question_type || "MCQ"}
              required
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="TF">True/False</option>
            </select>
          </div>
          <div className="form-group">
            {question.question_type === "MCQ" && (
              <>
                <label htmlFor={`choices_${index}`} className="form-label">
                  Choices:
                </label>
                <div className="form-group mb-3">
                  {question.choices.map((choice, i) => (
                    <div
                      key={i}
                      className="d-flex align-items-center gap-2 mb-2"
                    >
                      <label
                        htmlFor={`choices_${index}_${i}`}
                        className="form-label me-2"
                      >
                        {String.fromCharCode(97 + i)}.
                      </label>
                      <input
                        type="text"
                        id={`choices_${index}_${i}`}
                        name="choices"
                        value={choice}
                        onChange={(e) => {
                          const newQuestions = [...formData.questions];
                          newQuestions[index].choices[i] = e.target.value;
                          if (!newQuestions[index].correct_answer) {
                            newQuestions[index].correct_answer =
                              newQuestions[index].choices[0];
                          }
                          setFormData({ ...formData, questions: newQuestions });
                        }}
                        placeholder={`Enter choice ${i + 1}`}
                        className="form-control flex-grow-1"
                        required
                      />
                      <span
                        className="text-danger fw-bold ms-2 cursor-pointer"
                        onClick={() => {
                          const newQuestions = [...formData.questions];
                          newQuestions[index].choices = newQuestions[
                            index
                          ].choices.filter((_, j) => j !== i);
                          setFormData({ ...formData, questions: newQuestions });
                        }}
                      >
                        ✖
                      </span>
                    </div>
                  ))}
                  <span
                    className="text-primary fw-bold mt-2 cursor-pointer"
                    onClick={() => {
                      const newQuestions = [...formData.questions];
                      newQuestions[index].choices.push("");
                      setFormData({ ...formData, questions: newQuestions });
                    }}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    ➕ Add Choice
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`correct_answer_${index}`} className="form-label">
              Correct Answer:
            </label>
            <select
              id={`correct_answer_${index}`}
              name="correct_answer"
              value={question.correct_answer || question.choices[0]}
              onChange={(e) => handleQuestionChange(index, e)}
              className="form-control"
              required
            >
              {question.choices.map((choice, i) => (
                <option value={choice} key={i}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={`question_point_${index}`} className="form-label">
              Question Point:
            </label>
            <input
              type="number"
              id={`question_point_${index}`}
              name="question_point"
              value={question.question_point ?? ""}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the question point"
              className="form-control"
              min="0"
              required
            />
          </div>
          <div className="form-group">
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
              value={question.question_time_limit ?? ""}
              onChange={(e) => handleQuestionChange(index, e)}
              placeholder="Enter the question time limit"
              className="form-control"
            />
          </div>
          <div className="d-flex">
            <button
              type="button"
              className="btn btn-cstm"
              onClick={() => removeQuestion(index)}
            >
              Remove
            </button>
            <button
              type="button"
              className="btn btn-cstm"
              onClick={addQuestion}
            >
              Add
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="btn btn-cstm-submit"
        disabled={quizLoading}
      >
        {loading ? "Adding..." : "Add Quiz"}
      </button>
      {error && <p className="text-danger mt-3">{error}</p>}
    </form>
  );
};

const AddQuizWrapper: React.FC = () => {
  const { moduleId, courseId } = useParams<{
    moduleId: string;
    courseId: string;
  }>();
  return (
    <BaseWrapper
      options={[
        { link: "/courses", label: "Home" },
        {
          link: `/course/${courseId}/module/${moduleId}`,
          label: "Back to Lesson",
        },
      ]}
    >
      <AddQuiz />
    </BaseWrapper>
  );
};
export default AddQuizWrapper;