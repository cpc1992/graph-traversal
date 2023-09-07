import "./App.css";
import { useState, useEffect } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";
import { createGraph } from "./functions/graphFunctions.js";

function App() {
  // window.location.reload();

  const [graph, setGraph] = useState(false);
  const [numNodes, setNumNodes] = useState(
    window.localStorage.getItem("localNumNodes") || 150
  );

  const [connectAll, setConnectAll] = useState(
    window.localStorage.getItem("localConnectAll") === "true" ? true : false
  );

  const [startClicked, setStartClicked] = useState(false);
  const [endClicked, setEndClicked] = useState(false);
  const [clearClicked, setClearClicked] = useState(false);

  const [visualize, setVisualize] = useState(false);

  const [algorithm, setAlgorithm] = useState("dfs");

  useEffect(() => {
    // call create graph function to create a graph structure set it to the state
    setGraph((existingGraph) => createGraph(numNodes, connectAll));
  }, [numNodes]);

  return (
    <>
      <h1>Graph Traversal Visualizer</h1>
      <div className="App-content">
        <GraphWrapper
          graph={graph}
          startClicked={startClicked}
          setStartClicked={setStartClicked}
          endClicked={endClicked}
          setEndClicked={setEndClicked}
          clearClicked={clearClicked}
          algorithm={algorithm}
          visualize={visualize}
        />
        <ControlPanel
          numNodes={numNodes}
          setNumNodes={setNumNodes}
          connectAll={connectAll}
          setConnectAll={setConnectAll}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          startClicked={startClicked}
          setStartClicked={setStartClicked}
          endClicked={endClicked}
          setEndClicked={setEndClicked}
          setClearClicked={setClearClicked}
          setVisualize={setVisualize}
        />
      </div>
    </>
  );
}

export default App;
