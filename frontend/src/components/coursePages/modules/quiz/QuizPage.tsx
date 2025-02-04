import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuizContext } from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/Quiz.css";

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { quizzes, questions, fetchQuizById, isStaff, isInstructor } =
    useQuizContext();

  useEffect(() => {
    if (quizId) {
      fetchQuizById(Number(quizId));
    }
  }, [quizId, fetchQuizById]);

  const quiz = useMemo(() => {
    return quizzes?.find((q) => q.id === parseInt(quizId!, 10));
  }, [quizzes, quizId]);

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
            {quiz.time_limit && (
              <p className="text-muted">
                Time Limit: <span className="fw-bold">{quiz.time_limit}</span>
              </p>
            )}
          </div>
        </div>

        <div className="quiz-questions">
          {questions && questions.length > 0 ? (
            questions.map((question) => (
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
                        <select>
                          {question.choices.map((choice, i) => (
                            <option value={choice} key={i}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <label className="form-label fs-6">True or False:</label>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">No questions found!</div>
          )}
        </div>

        <div className="text-end mt-4">
          <button
            id="submit-button"
            type="submit"
            className="btn btn-success btn-lg shadow-sm"
          >
            Submit Quiz
          </button>
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
