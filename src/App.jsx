import "./App.css";
import { useState } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";

function App() {
  const [data, setData] = useState(0);

  return (
    <>
      <h1>Graph Traversal Visualizer</h1>
      <div className="App-content">
        <GraphWrapper />
        <ControlPanel />
      </div>
    </>
  );
}

export default App;
