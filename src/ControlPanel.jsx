import { useState } from "react";
import "./ControlPanel.css";

function ControlPanel({
  numNodes,
  setNumNodes,
  connectAll,
  setConnectAll,
  algorithm,
  setAlgorithm,
}) {
  const [sliderVal, setSliderVal] = useState(numNodes);

  return (
    <div className="ControlPanel-main">
      <div className="ControlPanel-generator">
        <h2>Graph Generator</h2>
        <label htmlFor="nodeslider">Number of Nodes: {sliderVal}</label>
        <input
          id="nodeslider"
          type="range"
          min="1"
          max="1000"
          value={sliderVal}
          onChange={(e) => {
            setSliderVal(e.target.value);
          }}
          onMouseUp={(e) => {
            window.localStorage.setItem("localNumNodes", sliderVal);
            setNumNodes(sliderVal);
            window.location.reload();
          }}
        />
        <label htmlFor="connectallnodes">
          <input
            id="connectallnodes"
            type="checkbox"
            value={connectAll}
            onChange={() => {
              setConnectAll((prev) => !prev);
            }}
          />
          Guaratee that all nodes are connected
        </label>
        <button
          onClick={() => {
            window.location.reload();
          }}
        >
          Redraw
        </button>
      </div>
      <div className="ControlPanel-algorithm">
        <h2>Traversal Visualizer</h2>
        <legend>Select Algorithm:</legend>
        <div className="ControlPanel-algochoice">
          <label htmlFor="bfs-radio">
            <input
              type="radio"
              id="bfs-radio"
              name="algoRadioGroup"
              value={algorithm == "bfs"}
            />
            Breadth First Search
          </label>

          <label htmlFor="dfs-radio">
            <input
              type="radio"
              id="dfs-radio"
              name="algoRadioGroup"
              value={algorithm == "dfs"}
            />
            Depth First Search
          </label>
        </div>
        <button>Visualize</button>
      </div>
    </div>
  );
}

export default ControlPanel;
