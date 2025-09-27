import { createRoot } from "react-dom/client";
import Component from "./src-app/Component";
function App() {
  return <Component />;
}
console.log("doot doot from js");

createRoot(document.getElementById("root")!).render(<App />);
