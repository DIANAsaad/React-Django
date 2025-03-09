import React, { useState, useCallback } from "react";
import { useCommentContext } from "../../../../context/CommentContext";
import { useParams } from "react-router-dom";
import "../../../../styles/Comment.css";

interface AddCommentProps {
  reply_to_id: number | null;
}

const AddComment: React.FC<AddCommentProps> = ({ reply_to_id }) => {
  const { moduleId } = useParams();
  const { addComment, loading, error } = useCommentContext();
  const [formData, setFormData] = useState<{
    comment: string;
    images: File[];
    lesson_id: number;
    reply_to_id: number | null;
  }>({
    comment: "",
    images: [],
    lesson_id: Number(moduleId),
    reply_to_id: reply_to_id,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addComment(formData);
    setFormData({
      comment: "",
      images: [],
      lesson_id: Number(moduleId),
      reply_to_id: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="form-group">
        <label htmlFor="comment">
          Tell your instructor about your concerns, discussions, and questions.
          You can include images.
        </label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          required
          className="comment-input"
        />
      </div>
      <div className="form-group form-group-inline">
        <label htmlFor="images">Upload Images:</label>
        <input
          type="file"
          id="images"
          name="images"
          multiple
          onChange={handleImageChange}
          className="image-input"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Submitting..." : <i className="fas fa-paper-plane"></i>}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddComment;
