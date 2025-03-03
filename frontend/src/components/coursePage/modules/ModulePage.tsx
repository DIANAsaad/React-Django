import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Module, useModuleContext } from "../../../context/ModuleContext";
import { useFlashcardContext } from "../../../context/FlashcardContext";
import { useExternalLinkContext } from "../../../context/ExternalLinkContext";
import { useEditButtonContext } from "../../../context/EditButtonContext";
import { useQuizContext } from "../../../context/QuizContext";
import "../../../styles/Course&LessonPage.css";
import DropdownMenu from "../../DropdownMenu";
import BaseWrapper from "../../base/BaseWrapper";



const ModulePage: React.FC = () => {
  const { error, fetchModulesById } = useModuleContext();
  const { moduleId, courseId } = useParams<{
    moduleId: string;
    courseId: string;
  }>();

  const { editButton } = useEditButtonContext();


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

  const {
    quizzes,
    fetchQuizzes,
    loading: quizLoading,
    deleteQuiz,
  } = useQuizContext();

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards(Number(moduleId));
      fetchLinks(Number(moduleId));
      fetchQuizzes(Number(moduleId));
      fetchModulesById(Number(moduleId));

      const getModule = async () => {
        try {
          const fetchedModule = await fetchModulesById(Number(moduleId));
          setModule(fetchedModule);
        } finally {
          setLoading(false);
        }
      };
      getModule();
    }
  }, [moduleId, fetchFlashcards, fetchModulesById, fetchLinks]);

  if (loading) {
    return <div> Loading Lesson...</div>;
  }

  if (!module) {
    return <div>Lesson not found</div>;
  }

  const options = [
    ...(editButton
      ? [
          {
            label: "Add Session Recording",
            action: () =>
              navigate(`/course/${courseId}/module/${module.id}/add-flashcard`),
          },
          {
            label: "Add Flashcards",
            action: () =>
              navigate(`/course/${courseId}/module/${module.id}/add-flashcard`),
          },
          {
            label: "Add Quiz",
            action: () =>
              navigate(`/course/${courseId}/module/${module.id}/add-quiz`),
          },
          {
            label: "Add External Links",
            action: () =>
              navigate(
                `/course/${courseId}/module/${module.id}/add-external-link`
              ),
          },
          {
            label: "Add Activities",
            action: () => {},
          },
        ]
      : []),
    {
      label: "Add Discussion",
      action: () =>  navigate(
        `/course/${courseId}/module/${module.id}/add-comment`
      ),
    },
  ];

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
              {editButton && (
                <p className="text-muted ">
                  <strong>Created by: </strong>
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
              <div className="material-box shadow-sm rounded  align-items-center justify-content-between ">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="material-box-details d-flex align-items-center">
                    <div className="img-div">
                      <img src="/lesson_pdf.png" className="attr-img" />
                    </div>
                    <a
                      href={lessonPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <strong>Lesson PDF: </strong> Access and download your
                      lesson
                    </a>
                  </div>

                  {editButton && (
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
            <div className="not-found-alert">
              Loading lesson's flashcards...
            </div>
          ) : flashcards && flashcards.length > 0 ? (
            <div>
              <div className="material-box  shadow-sm rounded align-items-center">
                <div className="d-flex align-items-center justify-content-between">
                  <div
                    className="material-box-details d-flex align-items-center"
                    onClick={() => {
                      navigate(
                        `/course/${courseId}/module/${module.id}/flashcards`
                      );
                    }}
                  >
                    <div className="img-div">
                      <img src="/flashcards.png" className="attr-img" />
                    </div>
                    <p>
                      <strong>Lesson Flashcards: </strong>
                      Access your Flashcards
                    </p>
                  </div>
                  {editButton && (
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
            <div className="not-found-alert">No flashcards available.</div>
          )}
          {linkLoading ? (
            <div className="not-found-alert">
              Loading lesson's External Links...
            </div>
          ) : links && links.length > 0 ? (
            links.map((link) => (
              <div key={link.id}>
                <div className="material-box shadow-sm rounded align-items-center">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="material-box-details d-flex align-items-center">
                      <div className="img-div">
                        <img src="/external_link.png" className="attr-img" />
                      </div>
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <strong>External Link: </strong>
                        {link.description}
                      </a>
                    </div>
                    {editButton && (
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
                                `/course/${courseId}/module/${moduleId}/external-link/${link.id}/edit`
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
            <div className="not-found-alert">No external links available.</div>
          )}

          {quizLoading ? (
            <div className="not-found-alert">Loading lesson's Quizzes...</div>
          ) : quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz.id}>
                <div className="material-box shadow-sm rounded align-items-center">
                  <div className="d-flex align-items-center justify-content-between">
                    <div
                      className="material-box-details d-flex align-items-center"
                      onClick={() =>
                        navigate(
                          `/course/${courseId}/module/${moduleId}/quiz/${quiz.id}`
                        )
                      }
                    >
                      <div className="img-div">
                        <img src="/quizzes.png" className="attr-img" />
                      </div>
                      <p>
                        <strong>Lesson Quiz: </strong> {quiz.quiz_description}
                      </p>
                    </div>
                    {editButton && (
                      <DropdownMenu
                        buttonContent={"..."}
                        options={[
                          {
                            label: "Delete",
                            action: () => {
                              deleteQuiz(quiz.id);
                            },
                          },
                          {
                            label: "Edit",
                            action: () => {
                              {
                              }
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
            <div className="not-found-alert">No quizzes available.</div>
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
        { link: "/courses", label: "Home" },
        { link: `/course/${courseId}`, label: "Back to Course" },
      ]}
    >
      <ModulePage />
    </BaseWrapper>
  );
};

export default ModulePageWrapper;
