import React, { useState, useRef, useCallback } from "react";
import { useCourseContext } from "../../context/CourseContext";
import "../../styles/AddCourseCard.css";

const AddCourseCard: React.FC = () => {
  const { addCourse } = useCourseContext();
  const [showInputs, setShowInputs] = useState(false);
  const [formData, setFormData] = useState({
    course_title: "",
    description: "",
    study_guide: "",
    course_image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, course_image: file }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await addCourse(formData.course_title, formData.description, formData.course_image, formData.study_guide);
        setFormData({
          course_title: '',
          description: '',
          study_guide: '',
          course_image: null
        });
        setShowInputs(false);
      } catch (error) {
        console.error('Failed to add course', error);
      } finally {
        setLoading(false);
      }
    },
    [addCourse, formData]
  );

  const handleImageClick = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  return (
    <div className="col-12 mb-4">
      <div className="card add-course-card text-center">
        <form onSubmit={handleSubmit} className="add-course-form">
          <div onClick={handleImageClick}>
            <img
              src={
                formData.course_image
                  ? URL.createObjectURL(formData.course_image)
                  : "/logo.png"
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
          <div className="card-body">
            {showInputs && (
              <>
                <input
                  type="text"
                  name="course_title"
                  value={formData.course_title}
                  onChange={handleChange}
                  placeholder="Course Title"
                  required
                  className="form-control form-control-sm mb-2"
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Course Description"
                  required
                  className="form-control form-control-sm mb-2"
                />
                <input
                  type="text"
                  name="study_guide"
                  value={formData.study_guide}
                  onChange={handleChange}
                  placeholder="Study Guide"
                  className="form-control form-control-sm mb-2"
                />
              </>
              
            )}
            
            <button
              type="button"
              className="btn btn-outline-orange btn-sm"
              onClick={() => setShowInputs(true)}
              style={{ display: !showInputs ? "block" : "none" }}
            >
              Add Course Details
            </button>
            {showInputs && (
              <button type="submit" className="btn btn-outline-orange btn-sm" disabled={loading}>
                {loading ? "Adding..." : "Add Course"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseCard;
