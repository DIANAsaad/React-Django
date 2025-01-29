import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useModuleContext } from "../../../context/ModuleContext";
import { useFlashcardContext } from "../../../context/FlashcardContext";
import { useExternalLinkContext } from "../../../context/ExternalLinkContext";
import "../../../styles/Course&LessonPage.css";
import DropdownMenu from "../../DropdownMenu";
import BaseWrapper from "../../base/BaseWrapper";


const ModulePage: React.FC = () => {
  const { modules, loading, error, isInstructor, isStaff, fetchModulesById } =
    useModuleContext();
  const { moduleId, courseId } = useParams<{
    moduleId: string;
    courseId: string;
  }>();

  const {
    flashcards,
    fetchFlashcards,
    loading: flashcardLoading,
    deleteLessonFlashcards,
  } = useFlashcardContext();

  const {
    links,
    fetchLinks,
    loading: linkLoading,
    deleteLink,
  } = useExternalLinkContext();

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards(Number(moduleId));
      fetchLinks(Number(moduleId));
      fetchModulesById(Number(moduleId));
    }
  }, [moduleId, fetchFlashcards, fetchModulesById, fetchLinks]);

  const module = useMemo(() => {
    return modules?.find((m) => m.id === parseInt(moduleId!, 10));
  }, [modules, moduleId]);
  const navigate = useNavigate();

  if (!module) {
    return <div>Lesson not found</div>;
  }

  const options = [
    ...(isStaff || isInstructor
      ? [
          {
            label: "Add Session Recording",
            action: () => navigate(`/${courseId}/addFlashcard/${module.id}`),
          },
          {
            label: "Add Flashcards",
            action: () => navigate(`/${courseId}/addFlashcard/${module.id}`),
          },
          {
            label: "Add Quizzes",
            action: () => {},
          },
          {
            label: "Add External Links",
            action: () => navigate(`/${courseId}/addExternalLink/${module.id}`),
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
              {(isStaff || isInstructor) && (
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
              <div className="material-box p-4 shadow-sm rounded  align-items-center justify-content-between ">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="material-box-details">
                    <a
                      href={lessonPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <strong>Lesson PDF: </strong>
                      Access and download your lesson
                    </a>
                  </div>
                  {(isStaff || isInstructor) && (
                    <DropdownMenu
                      buttonContent={"..."}
                      options={[
                        {
                          label: "Delete",
                          action: () => {},
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {flashcardLoading ? (
            <div className="flashcard-alert">
              Loading lesson's flashcards...
            </div>
          ) : flashcards && flashcards.length > 0 ? (
            <div>
              <div className="material-box p-4 shadow-sm rounded align-items-center">
                <div className="d-flex align-items-center justify-content-between">
                  <div
                    className="material-box-details"
                    onClick={() => {
                      navigate(`/${courseId}/flashcardPage/${module.id}`);
                    }}
                  >
                    <strong>Lesson Flashcards: </strong>
                    Access your Flashcards
                  </div>
                  {(isStaff || isInstructor) && (
                    <DropdownMenu
                      buttonContent={"..."}
                      options={[
                        {
                          label: "Delete",
                          action: () => {
                            deleteLessonFlashcards(Number(moduleId));
                          },
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flashcard-alert">No flashcards available.</div>
          )}
          {linkLoading ? (
            <div className="flashcard-alert">
              Loading lesson's External Links...
            </div>
          ) : links && links.length > 0 ? (
            links.map((link) => (
              <div key={link.id}>
                <div className="material-box p-4 shadow-sm rounded align-items-center">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="material-box-details">
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <strong>Helpful External Link: </strong>
                        {link.description}
                      </a>
                    </div>
                    {(isStaff || isInstructor) && (
                      <DropdownMenu
                        buttonContent={"..."}
                        options={[
                          {
                            label: "Delete",
                            action: () => {
                              deleteLink(link.id);
                            },
                          },
                          {
                            label: "Edit",
                            action: () => {
                              navigate(
                                `/${courseId}/${moduleId}/editExternalLink/${link.id}`
                              );
                            },
                          },
                        ]}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flashcard-alert">No external links available.</div>
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
