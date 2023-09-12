import "./App.css";
import { useState, useEffect } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";
import { createGraph, createGrid } from "./functions/graphFunctions.js";

function App() {
  const [graph, setGraph] = useState(false);
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
  const [startClicked, setStartClicked] = useState(false);
  const [endClicked, setEndClicked] = useState(false);
  const [clearClicked, setClearClicked] = useState(false);

  const [visualize, setVisualize] = useState(false);

  const [algorithm, setAlgorithm] = useState(
    window.localStorage.getItem("localAlgorithm") || "dfs"
  );
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // call create graph function to create a graph structure set it to the state
    if (generatorTab == "graph") {
      setGraph((existingGraph) => createGraph(numNodes, connectAll));
    } else if (generatorTab == "grid") {
      setGraph((existingGraph) => createGrid(gridDiameter));
    }
  }, [generatorTab]);

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
          clearClicked={clearClicked}
          algorithm={algorithm}
          visualize={visualize}
          setStats={setStats}
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
          generatorTab={generatorTab}
          setGeneratorTab={setGeneratorTab}
          gridDiameter={gridDiameter}
          setGridDiameter={setGridDiameter}
          stats={stats}
        />
      </div>
    </>
  );
}

export default App;
