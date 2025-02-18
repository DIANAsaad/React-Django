import React, { useState, useCallback } from "react";
import { useExternalLinkContext } from "../../../../context/ExternalLinkContext";
import { useParams } from "react-router-dom";
import "../../../../styles/AddLessonProps.css";
import BaseWrapper from "../../../base/BaseWrapper";

const AddExternalLink: React.FC = () => {
  const { addLink } = useExternalLinkContext();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [formData, setFormData] = useState({
    lesson_id: Number(moduleId),
    link: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null); 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// Add security measure to avoid inserting malecious links (not done)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        await addLink(formData);
        setFormData({
          lesson_id: Number(moduleId),
          link: "",
          description: "",
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 7000);
      } catch (error) {
        console.error("Failed to add link", error);
        setError("Failed to add external link.");
      } finally {
        setLoading(false);
      }
    },
    [addLink, formData, moduleId]
  );

  return (
    <>
      <p>Add the lesson's external links one by one</p>
      <form onSubmit={handleSubmit} className="add-lesson-props-form">
        <div className="form-group">
          <label htmlFor="description">Link's Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter the description"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="link">Link:</label>
          <textarea
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="Enter the answer"
            className="form-control"
          />
        </div>
        {error && <p className="error text-danger">{error}</p>}
        {success && (
          <div className="alert alert-cstm-success">
            Link added successfully, you can add a new one and view them in the
            lesson page!
          </div>
        )}
        <button type="submit" disabled={loading} className="btn btn-cstm">
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>
    </>
  );
};

const AddExternalLinkWrapper: React.FC = () => {
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
      <AddExternalLink />
    </BaseWrapper>
  );
};

export default AddExternalLinkWrapper;
