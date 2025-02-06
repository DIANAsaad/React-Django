import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Answer, useQuizContext } from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/Quiz.css";

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const {
    quizzes,
    questions,
    fetchQuizById,
    submitAnswers,
    isStaff,
    isInstructor,
    loading: quizLoading,
  } = useQuizContext();
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (quizId) {
      fetchQuizById(Number(quizId));
    }
  }, [quizId, fetchQuizById]);

  const quiz = useMemo(() => {
    return quizzes?.find((q) => q.id === parseInt(quizId!, 10));
  }, [quizzes, quizId]);

  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    questionId: number
  ) => {
    const value = e.target.value;

    setAnswers((prevAnswers) => {
      const existingIndex = prevAnswers.findIndex(
        (a) => a.question_id === questionId
      );

      if (existingIndex !== -1) {
        return prevAnswers.map((answer, index) =>
          index === existingIndex ? { ...answer, answer_text: value } : answer
        );
      } else {
        return [
          ...prevAnswers,
          { question_id: questionId, answer_text: value },
        ];
      }
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        await submitAnswers(answers, Number(quizId));
        console.log(answers);
        setAnswers([]);
      } catch (error) {
        console.error("Failed to add quiz", error);
      } finally {
      }
    },
    [submitAnswers, answers, quizId]
  );

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <>
      <div className="col-md-10">
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
              {quiz.time_limit && (
                <p className="text-muted">
                  Time Limit: <span className="fw-bold">{quiz.time_limit}</span>
                </p>
              )}
            </div>
          </div>

          <div className="quiz-questions">
            {quizLoading ? (
              <div className="flashcard-alert">Loading quiz...</div>
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
                    disabled={quizLoading}
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
    >
      <QuizPage />
    </BaseWrapper>
  );
};
export default QuizPageWrapper;
