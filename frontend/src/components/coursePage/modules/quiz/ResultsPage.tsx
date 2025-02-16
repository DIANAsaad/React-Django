import React, { useEffect, useState } from "react";
import { Attempt, useQuizContext } from "../../../../context/QuizContext";
import { useParams } from "react-router-dom";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/ResultsPage.css";

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
    <div className="container mt-4">
      <div className="cstm-card shadow-sm p-4 mb-4">
        <h1 className="display-4 text-center">Quiz Results</h1>
        <div className="row mt-4">
          <div className="col-md-6">
            <p className="text-muted">
              <strong>Taken By: </strong>
              <span>{`${attempt.taken_by.first_name} ${attempt.taken_by.last_name}`}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="text-muted">
              <strong>Score: </strong>
              <span>{attempt.score}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="text-muted">
              <strong>Taken At: </strong>
              <span>{new Date(attempt.taken_at).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="card shadow-sm p-4">
        <h2 className="h4 text-center mb-4">Answers</h2>
        <ul className="list-group">
          {answers &&
            questions &&
            questions.length > 0 &&
            answers.length > 0 &&
            answers.map((answer) => {
              const question = questions.find(
                (q) => q.id === answer.question_id
              );
              return (
                <li key={answer.id} className="list-group-item mb-3">
                  <p className="mb-1">
                    <strong>Question:</strong> {question?.question_text}
                  </p>
                  <p className="mb-1">
                    <strong>Correct Answer:</strong> {question?.correct_answer}
                  </p>
                  <p className="mb-1">
                    <strong>Your Answer:</strong> {answer.answer_text}
                  </p>
                  {answer.is_correct ? (
                    <p className="mb-1 text-success">
                      <strong>Correct</strong>
                    </p>
                  ) : (
                    <p className="mb-1 text-danger">
                      <strong>Not Correct</strong>
                    </p>
                  )}
                </li>
              );
            })}
        </ul>
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
      conditions={[{ isUserStaff: false, isUserInstructor: false }]} 
    >
      <ResultsPage />
    </BaseWrapper>
  );
};

export default ResultsPageWrapper;
