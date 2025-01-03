import React, { useState } from "react";
import { useCourseContext } from "../../context/CourseContext";

const AddCourseCard: React.FC = () => {
  const { addCourse } = useCourseContext();
  const [showForm, setShowForm] = useState(false);
  const [course_title, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course_image, setCourseImage] = useState<File | null>(null);
  const [study_guide, setStudyGuide] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      await addCourse(course_title, description, course_image, study_guide);
      setCourseTitle("");
      setDescription("");
      setCourseImage(null);
      setStudyGuide("");
      setShowForm(false);
  };

  return (
    <div className="col-12 mb-4">
      <div className="card shadow-sm add-course-card" onClick={() => setShowForm(true)}>
        {!showForm && (
          <div className="card-body d-flex justify-content-center align-items-center">
            <h5 className="card-title">Add New Course</h5>
          </div>
        )}
        {showForm && (
          <div className="add-course-form">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={course_title}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Course Title"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course Description"
                required
              />
              <input
                type="file"
                onChange={(e) => setCourseImage(e.target.files ? e.target.files[0] : null)}
              />
              <input
                type="text"
                value={study_guide}
                onChange={(e) => setStudyGuide(e.target.value)}
                placeholder="Study Guide"
              />
              <button type="submit">Add Course</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourseCard;