import React, { useState, useCallback, useRef } from "react";
import { useModuleContext } from "../../context/ModuleContext";

interface AddModuleBoxProps {
  courseId: number;
}

const AddModuleBox: React.FC<AddModuleBoxProps> = ({ courseId }) => {
  const { addModule } = useModuleContext();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    course_id: courseId,
    module_title: "",
    topic: "",
    lesson_pdf: null as File | null,
    module_image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const toggleFormVisibility = useCallback(() => {
    setIsFormVisible((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await addModule(
          formData.course_id,
          formData.module_title,
          formData.topic,
          formData.module_image,
          formData.lesson_pdf
        );
        setFormData({
          course_id: courseId,
          module_title: "",
          topic: "",
          lesson_pdf: null,
          module_image: null,
        });
      } catch (error) {
        console.error("Failed to add course", error);
      } finally {
        setLoading(false);
      }
    },
    [addModule, formData, courseId]
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      setFormData((prev) => ({ ...prev, module_image: file }));
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      setFormData((prev) => ({ ...prev, lesson_pdf: file }));
    },
    []
  );

  const handleImageClick = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  return (
    <div className="modules-box-staff p-4 shadow-sm rounded mb-4 text-center">
      {!isFormVisible && (
        <button
          onClick={toggleFormVisibility}
          className="btn btn-outline-orange btn-lg mb-1 mt-1"
        >
          <i className="fas fa-plus"></i> Add Lesson
        </button>
      )}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="d-flex"
          encType="multipart/form-data"
        >
          <div className="image-upload" onClick={handleImageClick}>
            <img
              src={
                formData.module_image
                  ? URL.createObjectURL(formData.module_image)
                  : "/achieve_a_mark.png"
              }
              className="card-img-add-top"
              alt="Course"
            />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          <div className="form-group  w-100">
            <input
              type="text"
              name="module_title"
              value={formData.module_title}
              onChange={handleChange}
              placeholder="Lesson Title"
              required
              className="form-control form-control-sm mb-2"
            />
            <textarea
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Lesson Topic"
              required
              className="form-control form-control-sm mb-2"
            />
            <input
              type="file"
              name="lesson_pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              placeholder="Lesson PDF"
              className="form-control form-control-sm mb-2"
            />
            <button type="submit" className="btn btn-success">
              {loading ? "Adding..." : "Add Lesson"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddModuleBox;
