import React, { useState, useEffect } from "react";
import { useExternalLinkContext } from "../../../../context/ExternalLinkContext";
import { useParams } from "react-router-dom";

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

  // Fetch data on mount and pre-fill the form
  useEffect(() => {
    const fetchData = async () => {
      if (!linkId) return; // Ensure `linkId` exists

      try {
        const response = await fetchLinkById(Number(linkId));
        console.log(response);
     
        // Pre-fill the form data
        setFormData((prevState) => ({
          ...prevState,
          link: response.link || "",
          description: response.description || "",
        }));
        console.log(formData);
      } catch (error) {
        console.error("Failed to fetch external link data", error);
        setError("Unable to fetch external link data.");
      }
    };

    fetchData();
  }, [linkId, fetchLinkById]);

  // Handle input changes
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
      <form onSubmit={handleSubmit} className="edit-external-link-form">
        <div className="form-group">
          <label htmlFor="description">Link's Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description} // Pre-filled from the backend
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
            value={formData.link} // Pre-filled from the backend
            onChange={handleChange}
            placeholder="Enter the link"
            className="form-control"
          />
        </div>
        {error && <p className="error text-danger">{error}</p>}
        {success && (
          <p className="text-success">External link updated successfully!</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary mt-3"
        >
          {loading ? "Updating..." : "Update External Link"}
        </button>
      </form>
    </div>
  );
};

export default EditExternalLink;
