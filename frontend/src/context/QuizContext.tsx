import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of a Quiz
interface Quiz {
  id: number;
  quiz_title: string;
  quiz_description: string;
  total_mark: number;
  time_limit: number;
  lesson_id: number;
  attempts_allowed: number;
  quiz_creator: {
    first_name: string;
    last_name: string;
  };
}

// Define the shape of a Question
interface Question {
  id: number;
  question_point: number;
  question_text: string;
  question_type: string;
  question_time_limit: number;
  correct_answer: string;
  choices: string[];
}

// Define the shape of the answer
interface Answer {
  id: number;
  is_correct: boolean;
  answer_text: string;
  question_id: number;
}

// Define the shape of the submit answer
export type SubmittedAnswer = Omit<Answer, "id" | "is_correct">;

// Define the shape of the attempt
interface Attempt {
  id: number;
  taken_at: Date;
  taken_by: {
    first_name: string;
    last_name: string;
  };
  score: number;
}

export type QuestionWithoutId = Omit<Question, "id">;

// Define the context structure
interface QuizContextProps {
  quizzes: Quiz[] | null;
  questions: Question[] | null;
  answers: Answer[] | null;
  attempts: Attempt[] | null;
  fetchQuizzes: (lessonId: number) => Promise<void>;
  fetchQuizById: (quizId: number) => Promise<void>;
  fetchAnswers: (attemptId: number) => Promise<void>;
  addQuiz: (data: {
    quiz_title: string;
    quiz_description: string;
    total_mark: number;
    time_limit: number;
    module_id: number;
    attempts_allowed: number;
    questions: QuestionWithoutId[];
  }) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  isStaff: boolean;
  isInstructor: boolean;
  submitAnswers: (
    answers: SubmittedAnswer[],
    quizId: number
  ) => Promise<Attempt>;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);
const ENDPOINT = "http://localhost:8000";

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);

  // Fetch quizzes when entering into the lesson's (module's) page
  const fetchQuizzes = useCallback(
    async (moduleId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/quizzes/${moduleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setQuizzes(response.data.quizzes ?? []);
        setIsStaff(response.data.isStaff);
        setIsInstructor(response.data.isInstructor);
      } catch (err) {
        setError("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Fetch quiz and questions when entering to quiz page
  const fetchQuizById = useCallback(
    async (quizId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${ENDPOINT}/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const quiz = response.data.quiz;
        setQuizzes((prevQuizzes) => [
          ...prevQuizzes.filter((q) => q.id !== quiz.id),
          quiz,
        ]);
        setQuestions(response.data.questions ?? []);
        setIsStaff(response.data.isStaff);
        setIsInstructor(response.data.isInstructor);
      } catch {
        setError("Failed to fetch quiz");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Add quiz
  const addQuiz = useCallback(
    async ({
      quiz_title,
      quiz_description,
      total_mark,
      time_limit,
      module_id,
      attempts_allowed,
      questions,
    }: {
      quiz_title: string;
      quiz_description: string;
      total_mark: number;
      time_limit: number;
      module_id: number;
      attempts_allowed: number;
      questions: QuestionWithoutId[];
    }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("module_id", module_id.toString());
        formData.append("quiz_title", quiz_title);
        formData.append("quiz_description", quiz_description);
        formData.append("total_mark", total_mark.toString());
        formData.append("time_limit", time_limit.toString());
        formData.append("attempts_allowed", attempts_allowed.toString());
        formData.append("questions", JSON.stringify(questions));

        const response = await axios.post(`${ENDPOINT}/add_quiz`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setQuizzes((prevQuizzes) => [...(prevQuizzes || []), response.data]);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        console.error(`Error adding quiz: ${errorMessage}`);
        alert(`An error occurred while adding the quiz: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Delete quiz
  const deleteQuiz = useCallback(
    async (quizId: number) => {
      const quiz = quizzes.find((q) => q.id === quizId);
      if (!quiz) {
        alert("Quiz not found");
        return;
      }
      try {
        await axios.delete(`${ENDPOINT}/delete_quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      } catch (error) {
        console.error(`Error deleting quiz:`, error);
        alert(`An error occurred while deleting the quiz. Please try again.`);
      }
    },
    [quizzes, accessToken]
  );

  // Submit the answers
  const submitAnswers = useCallback(
    async (answers: SubmittedAnswer[], quizId: number): Promise<Attempt> => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${ENDPOINT}/submit_answers/${quizId}`,
          { answers },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(response.data);
        return response.data.attempt;

      } catch (error) {
        setError("Failed to submit answers");
        throw new Error("Failed to submit answers");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Fetch answers to show in results page
  const fetchAnswers = useCallback(
    async (attemptId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${ENDPOINT}/quiz_results/${attemptId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setAttempts(response.data.attempt ?? []);
        setAnswers(response.data.answers ?? []);
      } catch {
        setError("Failed to fetch Answers");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  return (
    <QuizContext.Provider
      value={{
        fetchQuizById,
        answers,
        quizzes,
        questions,
        attempts,
        fetchQuizzes,
        addQuiz,
        deleteQuiz,
        submitAnswers,
        fetchAnswers,
        loading,
        error,
        isStaff,
        isInstructor,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};
