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
  return (
    <div className="ControlPanel-main">
      <div className="ControlPanel-generator">
        <h2>Graph Generator</h2>
        <label htmlFor="nodeslider">Number of Nodes: {numNodes}</label>
        <input
          id="nodeslider"
          type="range"
          min="1"
          max="400"
          value={numNodes}
          onChange={(e) => {
            setNumNodes(e.target.value);
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
          Connect all nodes
        </label>
        <button>Redraw</button>
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
