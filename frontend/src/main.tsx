import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CourseProvider } from "./context/CourseContext"; // Import CourseProvider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CourseProvider>
      <App />
    </CourseProvider>
  </StrictMode>
);
