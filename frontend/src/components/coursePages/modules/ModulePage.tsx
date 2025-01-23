import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useModuleContext } from "../../../context/ModuleContext";
import { useFlashcardContext } from "../../../context/FlashcardContext";
import "../../../styles/Course&LessonPage.css";
import DropdownMenu from "../../DropdownMenu";
import BaseWrapper from "../../base/BaseWrapper";

const ModulePage: React.FC = () => {
  const { modules, loading, error, canAddModule, isStaff, fetchModulesById } =
    useModuleContext();
  const { moduleId } = useParams<{ moduleId: string }>();
  const {
    flashcards,
    fetchFlashcards,
    loading: flashcardLoading,
  } = useFlashcardContext();

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards(Number(moduleId));
      fetchModulesById(Number(moduleId));
    }
  }, [moduleId, fetchFlashcards, fetchModulesById]);

  const module = useMemo(() => {
    return modules?.find((m) => m.id === parseInt(moduleId!, 10));
  }, [modules, moduleId]);
  const navigate = useNavigate();

  if (!module) {
    return <div>Lesson not found</div>;
  }

  const options = [
    ...(isStaff && canAddModule
      ? [
          {
            label: "Add Flashcards",
            action: () => navigate(`/addFlashcard/${module.id}`),
          },
          {
            label: "Add Quizzes",
            action: () => {},
          },
          {
            label: "Add External Links",
            action: () => {},
          },
          {
            label: "Add Activities",
            action: () => {},
          },
        ]
      : []),
    {
      label: "Add Comment",
      action: () => {},
    },
  ];

  if (loading) {
    return <div>Loading Lesson...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const lessonPdfUrl =
    module.lesson_pdf instanceof File
      ? URL.createObjectURL(module.lesson_pdf)
      : typeof module.lesson_pdf === "string"
      ? module.lesson_pdf
      : null;

  return (
    <>
      <div className="row">
        <div className="container-cstm card-style mt-4" key={module.id}>
          <div className="info-box d-flex align-items-center p-4 mb-4 shadow-sm rounded">
            <div className="cstm-header">
              <img
                src={String(module.module_image)}
                className="card-cstm-img-top"
                alt={module.module_title}
              />
            </div>
            <div className="details ms-4">
              <h1 className="title">{module.module_title}</h1>
              <p className="text-muted ">{module.topic}</p>
              {isStaff && canAddModule && (
                <p className="text-muted ">
                  {" "}
                  <strong>Created by: </strong>{" "}
                  {`${module.module_creator.first_name} ${module.module_creator.last_name}`}
                </p>
              )}
            </div>
            <div className="ms-auto">
              <DropdownMenu
                buttonContent={<i className="fas fa-pen"></i>}
                options={options}
              />
            </div>
          </div>
          {lessonPdfUrl && (
            <div>
              <div className="material-box p-4 shadow-sm rounded ">
                <strong>Lesson PDF: </strong>
                <a
                  href={lessonPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access and download your lesson
                </a>
              </div>
            </div>
          )}
          {flashcardLoading ? (
            <div className="flashcard-alert">
              Loading lesson's flashcards...
            </div>
          ) : flashcards && flashcards.length > 0 ? (
            <div
              onClick={() => {
                navigate(`/flashcardPage/${module.id}`);
              }}
            >
              <div className="material-box p-4 shadow-sm rounded">
                <strong>Lesson Flashcards: </strong> Access your Flashcards
              </div>
            </div>
          ) : (
            <div className="flashcard-alert">No flashcards available.</div>
          )}
        </div>
      </div>
    </>
  );
};


const ModulePageWrapper: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <BaseWrapper
      options={[
        { link: "/home", label: "Home" },
        { link: `/coursePage/${courseId}`, label: "Back to Course" },
      ]}
    >
      <ModulePage />
    </BaseWrapper>
  );
};

export default ModulePageWrapper;
