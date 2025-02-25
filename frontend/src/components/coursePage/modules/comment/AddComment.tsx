import React, { useState, useCallback } from 'react';
import { useCommentContext } from '../../../../context/CommentContext';
import { useParams } from "react-router-dom";
import '../../../../styles/AddComment.css'; 
import BaseWrapper from '../../../base/BaseWrapper';

const AddComment: React.FC = () => {
    const { moduleId } = useParams();
    const { addComment, loading, error } = useCommentContext();
    const [formData, setFormData] = useState<{ comment: string, images: File[], lesson_id: number }>({
        comment: '',
        images: [],
        lesson_id: Number(moduleId)
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
        setFormData({ comment: '', images: [], lesson_id: Number(moduleId) });
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    required
                    className="comment-input"
                />
            </div>
            <div className="form-group">
                <label htmlFor="images">Upload Images:</label>
                <input
                    type="file"
                    id="images"
                    name="images"
                    multiple
                    onChange={handleImageChange}
                    className="image-input"
                />
            </div>
            <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Submitting...' : 'Submit'}
            </button>
            {error && <p className="error">{error}</p>}
        </form>
    );
};

const CommentWrapper: React.FC = () => {
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
        <AddComment />
      </BaseWrapper>
    );
};

export default CommentWrapper;