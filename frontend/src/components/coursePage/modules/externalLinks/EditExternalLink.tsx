import React, { useState, useEffect } from "react";
import { useExternalLinkContext } from "../../../../context/ExternalLinkContext";
import { useParams } from "react-router-dom";
import BaseWrapper from "../../../base/BaseWrapper";
import "../../../../styles/AddLessonProps.css";


const EditExternalLink: React.FC = () => {
  const { moduleId, linkId } = useParams<{
    moduleId: string;
    linkId: string;
  }>();
  const { editLink, fetchLinkById } = useExternalLinkContext();

  const [formData, setFormData] = useState({
    lesson_id: Number(moduleId) || 0,
    link: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!linkId) return; 

      try {
        const response = await fetchLinkById(Number(linkId));
        // Pre-fill the form data
        setFormData((prevState) => ({
          ...prevState,
          link: response.link || "",
          description: response.description || "",
        }));
      } catch (error) {
        console.error("Failed to fetch external link data", error);
        setError("Unable to fetch external link data.");
      }
    };
    fetchData();
  }, [linkId, fetchLinkById]);

 
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await editLink(Number(linkId), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to update external link", error);
      setError("Failed to update external link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Edit the lesson's external link</p>
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
            placeholder="Enter the link"
            className="form-control"
          />
        </div>
        {error && <p className="error text-danger">{error}</p>}
        {success && (
           <div className="alert alert-cstm-success">
           Link changed successfully, you can view it in the
           lesson page!
         </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-cstm"
        >
          {loading ? "Updating..." : "Update External Link"}
        </button>
      </form>
    </div>
  );
};

const EditExternalLinkWrapper: React.FC = () => {
  const {courseId,moduleId} = useParams<{courseId:string, moduleId:string}>();
  return (
    <BaseWrapper
      options={[
        { link: "/courses", label: "Home" },
        { link: `/course/${courseId}/module/${moduleId}`, label: "Back to Lesson" },
      ]}
      conditions={[]}
    >
      <EditExternalLink />
    </BaseWrapper>
  );
};

export default EditExternalLinkWrapper;
