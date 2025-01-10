import React from "react";
import { useParams } from "react-router-dom";
import { useModuleContext } from "../../../context/ModuleContext";


const ModulePage: React.FC = () => {
  const { modules, loading, error } = useModuleContext();
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = modules?.find((c) => c.id === parseInt(moduleId!, 10));
  


  if (loading) {
    return <div>Loading Lesson...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!module) {
    return <div>Lesson not found</div>;
  }
  const lessonPdfUrl = module.lesson_pdf ? URL.createObjectURL(module.lesson_pdf) : null;
  return (
    <>
      <div className="row">
        <div className="container-cstm card-style mt-4" key={module.id}>
          <div className="info-box d-flex align-items-center p-4 mb-4 shadow-sm rounded">
            <div className="stm-header">
              <img
                src={String(module.module_image)}
                className="card-cstm-img-top"
                alt={module.module_title}
              />
            </div>
            <div className="details ms-4">
              <h1 className="title">{module.module_title}</h1>
              <p className="text-muted ">{module.topic}</p>
              <p className="text-muted ">{`${module.module_creator.first_name} ${module.module_creator.last_name}`}</p>
            </div>
          </div>
          {lessonPdfUrl && (
            <div>
              <div className="material-box p-4 shadow-sm rounded">
                <strong>Lesson:</strong>
                <a
                  href={lessonPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View your Lesson Here!
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModulePage;
