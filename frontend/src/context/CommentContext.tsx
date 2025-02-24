import {
  useCallback,
  useState,
  createContext,
  ReactNode,
  useContext,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of the comment.
interface Comment {
  id: number;
  lesson_id: number;
  commentor: {
    first_name: string;
    last_name: string;
  };
  comment: string;
  commented: Date;
  images: {
    image: File | null;
  };
}

//Define the context structure

interface CommentContextProps {
  comments: Comment[] | null;
  fetchComments: (lessonId: number) => Promise<void>;
  addComment: (data: {
    lesson_id: number;
    comment: string;
    images: File[];
  }) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CommentContext = createContext<CommentContextProps | undefined>(
  undefined
);
const ENDPOINT = "http://localhost:8000";

const normalizeComment = (comment: Comment) => ({
  ...comment,
  image: comment.images.image
    ? comment.images.image?.toString().startsWith(ENDPOINT)
      ? comment.images.image
      : `${ENDPOINT}${comment.images.image}`
    : null,
});

const normalizeComments = (comments: Comment[]) => {
  return comments.map(normalizeComment);
};

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // fetch comments when in lesson
  const fetchComments = useCallback(
    async (lessonId: number) => {
      if (!accessToken) {
        setError("No access token available");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/comments/${lessonId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setComments(normalizeComments(response.data.comments ?? []));
      } catch (err) {
        setError("Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const addComment = useCallback(
    async ({
      lesson_id,
      comment,
      images,
    }: {
      lesson_id: number;
      comment: string;
      images: File[];
    }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("lesson_id", lesson_id.toString());
        formData.append("comment", comment);
        if (images)     images.forEach((image) => {
          formData.append(`image`, image);
        });
        const response = await axios.post(`${ENDPOINT}/add_comment`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setComments((prevComments) => [
          ...(prevComments || []),
          normalizeComment(response.data),
        ]);
      } catch (error: any) {
        console.error(
          "Error adding comment:",
          error.response?.data || error.message
        );
        alert(
          `An error occurred while adding the comment: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [accessToken]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) {
        alert("comment not found");
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_comment/${commentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setComments(comments.filter((c) => c.id !== commentId));
      } catch (error) {
        console.error(`Error deleting comment:`, error);
        alert(
          `An error occurred while deleting the comment. Please try again.`
        );
      }
    },
    [comments, accessToken]
  );

  return (
    <CommentContext.Provider
      value={{
        fetchComments,
        comments,
        addComment,
        deleteComment,
        loading,
        error,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};
