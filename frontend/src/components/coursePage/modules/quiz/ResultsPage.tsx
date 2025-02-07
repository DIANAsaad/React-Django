import React, { useEffect, useMemo } from "react";
import { useQuizContext } from "../../../../context/QuizContext";
import { useParams } from "react-router-dom";

const ResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { answers, fetchAnswers, attempts } = useQuizContext();

  useEffect(() => {
    if (attemptId) {
      fetchAnswers(Number(attemptId));
    }
  }, [fetchAnswers, attemptId]);

  const attempt = useMemo(() => {
    return attempts?.find((a) => a.id === parseInt(attemptId!, 10));
  }, [attempts, attemptId]);

  if (!attempt) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="display-4">Quiz Results</h1>
      <p className="text-muted">
        Attempt ID: <span className="fw-bold">{attempt.id}</span>
      </p>
      <p className="text-muted">
        Score: <span className="fw-bold">{attempt.score}</span>
      </p>
      <div className="mt-4">
        <h2 className="h4">Answers</h2>
        <ul className="list-group">
          {answers &&
            answers.length > 0 &&
            answers.map((answer) => (
              <li key={answer.question_id} className="list-group-item">
                <p className="mb-1">
                  <strong>Question ID:</strong> {answer.question_id}
                </p>
                <p className="mb-1">
                  <strong>Your Answer:</strong> {answer.answer_text}
                </p>
                <p className="mb-1">
                  <strong>Correct:</strong> {answer.is_correct}
                </p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsPage;
