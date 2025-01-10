import React, { useState } from "react";

const AddModuleBox: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div className="modules-box-staff p-4 shadow-sm rounded mb-4 text-center">
      <button onClick={toggleFormVisibility} className="btn btn-outline-orange btn-lg">
        <i className="fas fa-plus"></i> Add Lesson
      </button>
      {isFormVisible && (
        <form>
          {/* Your form fields go here */}
          <div className="form-group">
            <label htmlFor="moduleTitle">Lesson Title</label>
            <input type="text" className="form-control" id="moduleTitle" />
          </div>
          <div className="form-group">
            <label htmlFor="moduleTopic">Lesson Topic</label>
            <input type="text" className="form-control" id="moduleTopic" />
          </div>
          <div className="form-group">
            <label htmlFor="moduleImage">Lesson Image</label>
            <input type="file" className="form-control" id="moduleImage" />
          </div>
          <div className="form-group">
            <label htmlFor="moduleImage">Lesson PDF</label>
            <input type="file" className="form-control" id="LessonPDF" />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default AddModuleBox;
