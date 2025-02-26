import React, { useEffect } from "react";
import { useCommentContext } from "../../../../context/CommentContext";
import { useParams } from "react-router-dom";
import "../../../../styles/Comment.css";
import AddComment from "./AddComment";
import BaseWrapper from "../../../base/BaseWrapper";

const CommentPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { comments, loading, fetchComments, deleteComment} = useCommentContext();
  console.log(comments);
  useEffect(() => {
    if (moduleId) {
      fetchComments(Number(moduleId));
    }
  }, [moduleId, fetchComments]);

  if (loading) {
    return <div>Loading Comments...</div>;
  }

  return (
    <>
      <div className="comments-container">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment-form">
              <div className="comment-header">
                <div className="comment-text">
                  <strong>{`${comment.commentor.first_name} ${comment.commentor.last_name}: `}</strong>
                  {comment.comment}
                </div>
                <div className="comment-options">
                  <a href="#">Reply </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteComment(comment.id);
                    }}
                  >
                    | Delete
                  </a>
                </div>
              </div>
              <div className="comment-images">
                {comment.images?.map((imageObj, index) => (
                  <div key={index} className="comment-image-container">
                    <img
                      src={String(imageObj.image)}
                      alt="screenshots"
                      className="comment-image"
                      onClick={() => window.open(String(imageObj.image), "_blank")}
                    />
                  </div>
                ))}
              </div>
              <div className="comment-time">
                {new Date(comment.commented_at).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div>No Comments Found</div>
        )}
           <AddComment />
      </div>
   
    </>
  );
};

const CommentPageWrapper: React.FC = () => {
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
      <CommentPage />
    </BaseWrapper>
  );
};

export default CommentPageWrapper;