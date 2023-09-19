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
      <div className="App-nav">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://clifford-chan.vercel.app/"
        >
          <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 372 372"
            className="App-logo"
          >
            <g>
              <path
                d="M186,0C83.439,0,0,83.439,0,186s83.439,186,186,186s186-83.439,186-186S288.561,0,186,0z M350.163,210.679h-85.292
		C270.751,201.699,280.85,196,292.1,196h59.59C351.394,200.953,350.886,205.85,350.163,210.679z M186,20
		c88.174,0,160.501,69.106,165.69,156H292.1c-24.333,0-45.337,16.514-51.079,40.16l-17.96,73.964l-37.159-153.032
		c-6.827-28.117-31.803-47.754-60.737-47.754H51.127C81.283,47.381,130.502,20,186,20z M38.797,109.338h86.368
		c17.638,0,33.106,10.736,39.466,26.733H27.677C30.613,126.782,34.349,117.846,38.797,109.338z M21.837,210.685
		c-0.723-4.83-1.231-9.729-1.527-14.685h63.068c11.249,0,21.348,5.699,27.228,14.679H21.952
		C21.913,210.679,21.876,210.684,21.837,210.685z M26.114,230.679H117.4l28.252,116.353
		C87.928,332.563,42.095,287.794,26.114,230.679z M167.149,350.923c-0.035-0.19-0.062-0.38-0.108-0.57L134.456,216.16
		C128.714,192.514,107.71,176,83.377,176H20.31c0.404-6.758,1.207-13.41,2.399-19.929h147.22l42.841,176.434l-4.334,17.848
		c-0.01,0.043-0.015,0.086-0.024,0.128C201.08,351.476,193.601,352,186,352C179.626,352,173.338,351.626,167.149,350.923z
		 M230.062,346.053l28.015-115.374h87.809C330.249,286.563,286.033,330.626,230.062,346.053z"
              />
            </g>
          </svg>
        </a>
        <h1 className="App-title">Graph Traversal Visualizer</h1>
        <div></div>
      </div>
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
