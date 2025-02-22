import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SubmittedAnswer,
  Quiz,
  useQuizContext,
  Question,
} from "../../../../context/QuizContext";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/Quiz.css";
import { useEditButtonContext } from "../../../../context/EditButtonContext";

const useQuestionTimer = (questionLimit: number) => {
  const [remQuestionTime, setRemQuestionTime] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  useEffect(() => {
    if (isTimerActive && questionLimit > 0) {
      setRemQuestionTime(questionLimit * 60);
    }
  }, [isTimerActive, questionLimit]);

  useEffect(() => {
    if (!isTimerActive || remQuestionTime === null || remQuestionTime <= 0)
      return;

    const timer = setTimeout(() => {
      setRemQuestionTime((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTimerActive, remQuestionTime]);

  const startTimer = () => {
    setIsTimerActive(true);
  };

  return [remQuestionTime, startTimer] as [
    remQuestionTime: number | null,
    startTimer: () => void
  ];
};

const QuestionRow: React.FC<{
  question: Question;
  handleAnswerChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    questionId: number
  ) => void;
}> = ({ question, handleAnswerChange }) => {
  const [remQuestionTime, startTimer] = useQuestionTimer(
    question.question_time_limit || 0
  );
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <div
      className="question-box p-4 shadow-lg rounded mb-4 hover-shadow"
      key={question.id}
    >
      {question.question_time_limit && (
        <div
          onClick={() => {
            if (question.question_time_limit !== null) {
              startTimer();
              setIsVisible(true);
            }
          }}
        >
          {!isVisible && <p>This is a timed question. show Question</p>}
        </div>
      )}
      {((question.question_time_limit && isVisible) ||
        !question.question_time_limit) && (
        <div className="question-content">
          <h5 className="fw-bold">{question.question_text}</h5>
          {remQuestionTime !== null && (
            <>
              {Math.floor(remQuestionTime / 60)}:
              {remQuestionTime % 60 < 10 ? "0" : ""}
              {remQuestionTime % 60} / {question.question_time_limit} minutes
            </>
          )}
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
                      onChange={(e) => handleAnswerChange(e, question.id)}
                      disabled={remQuestionTime === 0}
                    />
                    <label className="form-check-label">{choice}</label>
                  </div>
                ))}
              </>
            ) : (
              <>
                <label className="form-label fs-6">True or False:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer_text"
                    value="True"
                    onChange={(e) => handleAnswerChange(e, question.id)}
                  />
                  <label className="form-check-label">True</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer_text"
                    value="False"
                    onChange={(e) => handleAnswerChange(e, question.id)}
                    disabled={remQuestionTime === 0}
                  />
                  <label className="form-check-label">False</label>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    submitLoading,
    loading: questionLoading,
  } = useQuizContext();
  const { editButton } = useEditButtonContext();
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
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

  // In case of we have a time limit for the quiz
  useEffect(() => {
    if (quiz && quiz.time_limit) {
      setRemainingTime(quiz.time_limit * 60); // convert into miniutes
    }
  }, [quiz]);

  useEffect(() => {
    if (remainingTime === null) {
      return;
    }

    if (remainingTime <= 0) {
      alert("Time's up! Your answers have been submitted.");
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setRemainingTime((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [remainingTime, quiz]);

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
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
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
            {quiz.time_limit ? (
              <p className="text-muted">
                Time Limit:{" "}
                <span className="fw-bold">
                  {" "}
                  {remainingTime !== null ? (
                    <>
                      {Math.floor(remainingTime / 60)}:
                      {remainingTime % 60 < 10 ? "0" : ""}
                      {remainingTime % 60} / {quiz?.time_limit} minutes
                    </>
                  ) : (
                    <>Loading...</>
                  )}
                </span>
              </p>
            ) : (
              <p className="text-muted">
                Time Limit: <span className="fw-bold">Open</span>
              </p>
            )}
            {editButton && (
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
                <QuestionRow
                  key={question.id}
                  question={question}
                  handleAnswerChange={handleAnswerChange}
                />
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
    >
      <QuizPage />
    </BaseWrapper>
  );
};
export default QuizPageWrapper;
