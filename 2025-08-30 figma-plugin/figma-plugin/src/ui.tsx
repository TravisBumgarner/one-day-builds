import { createRoot } from "react-dom/client";

function App() {
  return <p>Hi.!!</p>;
}
console.log("doot doot from js");

createRoot(document.getElementById("root")!).render(<App />);
