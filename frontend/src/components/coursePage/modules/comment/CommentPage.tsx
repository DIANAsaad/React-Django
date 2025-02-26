import React, { useEffect } from 'react';
import { useCommentContext } from '../../../../context/CommentContext';
import { useParams } from 'react-router-dom';
import '../../../../styles/Comment.css';
import AddComment from './AddComment';
import BaseWrapper from '../../../base/BaseWrapper';

const CommentPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { comments, loading, fetchComments } = useCommentContext();

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
      {comments && comments.length>0 ? (comments.map((comment) => (
        <div key={comment.id} className="comment-form">
          <div className="comment-text"><strong>{`${comment.commentor.first_name} ${comment.commentor.last_name}: `}</strong>{comment.comment}</div>
          <div className="comment-images">
            {}
          
          </div>
        </div>
      ))):(
        <div>No Comments Found </div>
        
      )}
    </div>
    <AddComment/>
    </>
  );
};

const CommentPageWrapper: React.FC = () => {
    const { moduleId,courseId} = useParams<{ moduleId: string; courseId: string }>();
    return (
      <BaseWrapper
        options={[
          { link: "/courses", label: "Home" },
          { link: `/course/${courseId}/module/${moduleId}`, label: "Back to Lesson" },
        ]}
      >
        <CommentPage />
      </BaseWrapper>
    );
  };
  export default CommentPageWrapper;
  