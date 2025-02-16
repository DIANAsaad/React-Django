import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SubmittedAnswer,
  Quiz,
  useQuizContext,
} from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/Quiz.css";

const QuizPage: React.FC = () => {
  const { quizId, courseId, moduleId } = useParams<{
    quizId: string;
    courseId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const {
    questions,
    fetchQuizById,
    submitAnswers,
    isStaff,
    isInstructor,
    submitLoading,
    loading: questionLoading,
  } = useQuizContext();
 
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      const getQuiz = async () => {
        try {
          const fetchedQuiz = await fetchQuizById(Number(quizId));
          setQuiz(fetchedQuiz);
        } finally {
          setLoading(false);
        }
      };
      getQuiz();
    }
  }, [quizId, fetchQuizById]);

  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    questionId: number
  ) => {
    const value = e.target.value;

    setAnswers((prevAnswers) => {
      const updatedAnswers = prevAnswers.filter(
        (a) => a.question_id !== questionId
      );
      return [
        ...updatedAnswers,
        { question_id: questionId, answer_text: value },
      ];
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const response = await submitAnswers(answers, Number(quizId));
        setAnswers([]);

        if (response) {
          navigate(
            `/course/${courseId}/module/${moduleId}/quiz/${quizId}/results/${response.id}`
          );
        } else {
          console.error("Quiz submission succeeded, but attemptId is missing.");
        }
      } catch (error) {
        console.error("Failed to submit quiz:", error);
      }
    },
    [submitAnswers, answers, quizId, courseId, moduleId, navigate]
  );

  if (loading) {
    return <div>Loading Quiz...</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <>
      <div className="container card-style mt-4">
        <div className="quiz-info-box d-flex align-items-center p-5 mb-4 shadow rounded">
          <div className="module-details ms-4">
            <h1 className="display-4">{quiz.quiz_title}</h1>
            <p className="text-muted">
              Total Marks: <span className="fw-bold">{quiz.total_mark}</span>
            </p>
            {quiz.attempts_allowed ? (
              <p className="text-muted">
                Allowed Attempts:{" "}
                <span className="fw-bold">{quiz.attempts_allowed}</span>
              </p>
            ) : (
              <p className="text-muted">
                Allowed Attempts: <span className="fw-bold">Open</span>
              </p>
            )}
            {(isStaff || isInstructor) && (
         
              <p className="text-muted">
                Created by:{" "}
                <span className="fw-bold">
                  {quiz.quiz_creator.first_name} {quiz.quiz_creator.last_name}
                </span>
              </p>
            )}
         
          </div>
        </div>

        <div className="quiz-questions">
          {questionLoading ? (
            <div className="flashcard-alert">Loading questions...</div>
          ) : questions && questions.length > 0 ? (
            <form onSubmit={handleSubmit}>
              {questions.map((question) => (
                <div
                  className="question-box p-4 shadow-lg rounded mb-4 hover-shadow"
                  key={question.id}
                >
                  <div className="question-content">
                    <h5 className="fw-bold">{question.question_text}</h5>
                    <div className="mb-3">
                      {question.question_type === "MCQ" ? (
                        <>
                          <label className="form-label fs-6">
                            Choose the correct option:
                          </label>
                          {question.choices.map((choice, index) => (
                            <div key={index} className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`question_${question.id}`}
                                value={choice}
                                onChange={(e) =>
                                  handleAnswerChange(e, question.id)
                                }
                              />
                              <label className="form-check-label">
                                {choice}
                              </label>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <label className="form-label fs-6">
                            True or False:
                          </label>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="answer_text"
                              value="True"
                              onChange={(e) =>
                                handleAnswerChange(e, question.id)
                              }
                            />
                            <label className="form-check-label">True</label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="answer_text"
                              value="False"
                              onChange={(e) =>
                                handleAnswerChange(e, question.id)
                              }
                            />
                            <label className="form-check-label">False</label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-end mt-4">
                <button
                  id="submit-button"
                  type="submit"
                  className="btn btn-success btn-lg shadow-sm"
                  disabled={submitLoading}
                >
                  Submit Quiz
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">No questions found!</div>
          )}
        </div>
      </div>
    </>
  );
};

const QuizPageWrapper: React.FC = () => {
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
      conditions={[{ isUserStaff: false, isUserInstructor: false }]} 
    >
      <QuizPage />
    </BaseWrapper>
  );
};
export default QuizPageWrapper;
