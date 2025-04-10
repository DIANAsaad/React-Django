import {
  useCallback,
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of the comment (Discussion Forum)
export interface Comment {
  id: number;
  lesson_id: number;
  commentor: {
    id: number;
    first_name: string;
    last_name: string;
  };
  comment: string;
  commented_at: Date;
  reply_to_id: number;
  replies: number[];
  images: {
    image: string | File | null;
  }[];
}

interface CommentWithReplies extends Omit<Comment, "replies"> {
  replies: CommentWithReplies[];
}

// Define the context structure
interface CommentContextProps {
  comments: CommentWithReplies[] | null;
  fetchComments: (lessonId: number) => Promise<void>;
  addComment: (data: {
    lesson_id: number;
    reply_to_id: number | null;
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

const normalizeComment = (comment: Comment): Comment => ({
  ...comment,
  images: comment.images.map((image) => ({
    image: image.image
      ? image.image.toString().startsWith(ENDPOINT)
        ? image.image
        : `${ENDPOINT}${image.image}`
      : null,
  })),
});

const normalizeComments = (comments: Comment[]) => {
  return comments.map(normalizeComment);
};
const translateCommentsToCommentWithReplies = (
  comments: Comment[]
): CommentWithReplies[] => {
  const buildCommentWithReplies = (comment: Comment): CommentWithReplies => {
    const replies = comments
      .filter((c) => c.reply_to_id === comment.id)
      .map(buildCommentWithReplies);
    return {
      ...comment,
      replies,
    };
  };

  return comments
    .filter((c) => c.reply_to_id === null)
    .map(buildCommentWithReplies);
};

const handleNewComment = (
  comments: CommentWithReplies[],
  newComment: Comment
): CommentWithReplies[] => {
  const commentWithReplies = {
    ...newComment,
    replies: [],
  };

  if (newComment.reply_to_id === null) {
    return [commentWithReplies, ...comments];
  }

  return comments.map((comment) => {
    if (comment.id === newComment.reply_to_id) {
      return {
        ...comment,
        replies: [...comment.replies, commentWithReplies],
      };
    }
    return comment;
  });
};

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, registerSocketHandler } = useAuth();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
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
        setComments(
          translateCommentsToCommentWithReplies(
            normalizeComments(response.data.comments ?? [])
          )
        );
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
      reply_to_id,
    }: {
      lesson_id: number;
      comment: string;
      images: File[];
      reply_to_id: number | null;
    }) => {
      try {
        const formData = new FormData();
        formData.append("lesson_id", lesson_id.toString());
        formData.append("comment", comment);
        if (images)
          images.forEach((image) => {
            formData.append(`images`, image);
          });
        if (reply_to_id) formData.append("reply_to_id", reply_to_id.toString());
        await axios.post(`${ENDPOINT}/add_comment`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });
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
      try {
        await axios.delete(`${ENDPOINT}/delete_comment/${commentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (error) {
        console.error(`Error deleting comment:`, error);
        alert(
          `An error occurred while deleting the comment. Please try again.`
        );
      }
    },
    [comments, accessToken]
  );

  useEffect(() => {
    registerSocketHandler("comment_created", (message: any) => {
      setComments((prevComments) => {
        return handleNewComment(prevComments || [], normalizeComment(message));
      });
    });
    registerSocketHandler("student_commented", (message: any) => {
      setComments((prevComments) => {
        return handleNewComment(prevComments || [], normalizeComment(message));
      });
    });
    registerSocketHandler("comment_deleted", (message: any) => {
      const removeComment = (
        comments: CommentWithReplies[],
        message: any
      ): CommentWithReplies[] => {
        return comments.reduce((acc, comment) => {
          if (comment.id === message) {
            return acc;
          }
          return [
            ...acc,
            {
              ...comment,
              replies: removeComment(comment.replies, message),
            },
          ];
        }, [] as CommentWithReplies[]);
      };

      setComments((prevComments) => removeComment(prevComments, message));
    });
  }, []);

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
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};
