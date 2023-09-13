import "./App.css";
import { useState, useEffect } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";
import { createGraph, createGrid } from "./functions/graphFunctions.js";

function App() {
  const [numNodes, setNumNodes] = useState(
    parseInt(window.localStorage.getItem("localNumNodes")) || 500
  );
  const [gridDiameter, setGridDiameter] = useState(
    parseInt(window.localStorage.getItem("localGridDiameter")) || 10
  );
  const [connectAll, setConnectAll] = useState(
    window.localStorage.getItem("localConnectAll") === "true" ? true : false
  );
  const [generatorTab, setGeneratorTab] = useState(
    window.localStorage.getItem("localGeneratorTab") || "graph"
  );
  const [algorithm, setAlgorithm] = useState(
    window.localStorage.getItem("localAlgorithm") || "dfs"
  );
  const [graph, setGraph] = useState(false);
  const [startClicked, setStartClicked] = useState(false);
  const [endClicked, setEndClicked] = useState(false);
  const [visualize, setVisualize] = useState(false);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // call create graph or grid function to create a graph structure & set it to the state
    if (generatorTab == "graph") {
      setGraph((prev) => createGraph(numNodes, connectAll));
    } else if (generatorTab == "grid") {
      setGraph((prev) => createGrid(gridDiameter));
    }
  }, []);

  return (
    <>
      <h1 className="App-title">Graph Traversal Visualizer</h1>
      <div className="App-content">
        <GraphWrapper
          graph={graph}
          startClicked={startClicked}
          setStartClicked={setStartClicked}
          endClicked={endClicked}
          setEndClicked={setEndClicked}
          algorithm={algorithm}
          visualize={visualize}
          setStats={setStats}
        />
        <ControlPanel
          numNodes={numNodes}
          connectAll={connectAll}
          setConnectAll={setConnectAll}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          startClicked={startClicked}
          setStartClicked={setStartClicked}
          endClicked={endClicked}
          setEndClicked={setEndClicked}
          setVisualize={setVisualize}
          generatorTab={generatorTab}
          setGeneratorTab={setGeneratorTab}
          gridDiameter={gridDiameter}
          stats={stats}
        />
      </div>
    </>
  );
}

export default App;
