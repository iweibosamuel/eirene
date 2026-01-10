import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocialMedia } from "./screens/SocialMedia";
import "react-image-crop/dist/ReactCrop.css";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <SocialMedia />
  </StrictMode>,
);
