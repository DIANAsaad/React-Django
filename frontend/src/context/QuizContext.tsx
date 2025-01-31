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


export interface Question {
  question_point: number;
  question_text: string;
  question_type: string;
  question_time_limit:number;
  correct_answer: string;
  choices: string[];
}

// Define the context structure
interface QuizContextProps {
  quizzes: Quiz[] | null;
  questions: Question[] | null;
  fetchQuizzes: (lessonId: number) => Promise<void>;
  fetchQuizbyId:(quizId:number)=>Promise<void>;
  addQuiz: (data: {
    quiz_title: string;
    quiz_description: string;
    total_mark: number;
    time_limit: number;
    module_id: number;
    attempts_allowed: number;
    questions: Question[];
  }) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  isStaff: boolean;
  isInstructor: boolean;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);
const ENDPOINT = "http://localhost:8000";

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);

  const fetchQuizzes = useCallback(
    async (lessonId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/quizzes/${lessonId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setQuizzes(response.data.quizzes ?? []);
        setQuestions(response.data.questions ?? []);
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
  const fetchQuizbyId = useCallback(
    async(quizId:number)=>{

    setLoading(true);
    try{
      const response= await axios.get(`${ENDPOINT}/quiz/${quizId}`
        ,{headers: { Authorization: `Bearer ${accessToken}` }});
       setQuizzes(response.data.quiz??[]);
       setQuestions(response.data.questions??[]);
       setIsStaff(response.data.isStaff);
       setIsInstructor(response.data.isInstructor);
    }catch{
      setError("Failed to fetch quiz");
    }finally{
      setLoading(false);
    }
    }, [accessToken]);


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
      questions: Question[];
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

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        questions,
        fetchQuizzes,
        addQuiz,
        deleteQuiz,
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
