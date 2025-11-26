
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";              /* Tailwind 컴파일된 스타일 + 커스텀 변수 */

  createRoot(document.getElementById("root")!).render(<App />);
  