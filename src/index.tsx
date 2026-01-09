import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocialMedia } from "./screens/SocialMedia";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <SocialMedia />
  </StrictMode>,
);
