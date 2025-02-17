import React, { useEffect, useState } from "react";
import { Attempt, useQuizContext } from "../../../../context/QuizContext";
import { useParams } from "react-router-dom";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/Quiz.css";

const ResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { answers, fetchAnswers, questions } = useQuizContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    if (attemptId) {
      setLoading(true);
      const getAttempt = async () => {
        try {
          const attempt = await fetchAnswers(Number(attemptId));
          setAttempt(attempt);
        } finally {
          setLoading(false);
        }
      };
      getAttempt();
    }
  }, [fetchAnswers, attemptId]);

  if (loading) {
    return <div className="text-center mt-5">Loading Quiz Results...</div>;
  }
  if (!attempt) {
    return <div className="text-center mt-5">Results Not Found</div>;
  }

  return (
    <div className="container card-dtylr mt-4">
      <div className="quiz-info-box d-flex align-items-center p-5 mb-4 shadow rounded">
        <div className="module-details ms-4">
          <h1 className="display-4">Quiz Results</h1>
          <p className="text-muted">
            <strong>Taken By: </strong>
            <span>{`${attempt.taken_by.first_name} ${attempt.taken_by.last_name}`}</span>
          </p>
          <p className="text-muted">
            <strong>Score: </strong>
            <span>{attempt.score}</span>
          </p>
          <p className="text-muted">
            <strong>Taken At: </strong>
            <span>{new Date(attempt.taken_at).toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="quiz-questions">
        {answers &&
          questions &&
          questions.length > 0 &&
          answers.length > 0 &&
          answers.map((answer) => {
            const question = questions.find((q) => q.id === answer.question_id);
            return (
              <div
                key={answer.id}
                className="question-box p-4 shadow-lg rounded mb-4 hover-shadow"
              >
                <div className="question-content">
                  <h5 className="fw-bold">{question?.question_text}</h5>
                  {question?.choices.map((choice, index) => (
                    <div key={index} className="form-check">
                      {choice === question?.correct_answer ? (
                        <div className="text-success-answer"><strong>{choice}</strong></div>
                      ) : choice === answer.answer_text ? (
                        <div
                          className={
                            answer.is_correct ? "text-success-answer" : "text-danger-answer"
                          }
                        >
                          <strong>{choice}</strong> 
                        </div>
                      ) : (
                        <span>{choice}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const ResultsPageWrapper: React.FC = () => {
  const { courseId, moduleId } = useParams<{
    courseId: string;
    moduleId: string;
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
      <ResultsPage />
    </BaseWrapper>
  );
};

export default ResultsPageWrapper;
