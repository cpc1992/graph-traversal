import { useState } from "react";
import "./ControlPanel.css";

function ControlPanel({
  numNodes,
  setNumNodes,
  connectAll,
  setConnectAll,
  algorithm,
  setAlgorithm,
  startClicked,
  setStartClicked,
  endClicked,
  setEndClicked,
  clearClicked,
  setClearClicked,
  setVisualize,
}) {
  const [sliderVal, setSliderVal] = useState(numNodes);
  const onAlgoChange = (e) => {
    setAlgorithm(e.target.value);
  };

  return (
    <div className="ControlPanel-main">
      {/* SECTION 1 */}
      <div className="ControlPanel-generator">
        <h2>Graph Generator</h2>
        <label htmlFor="nodeslider">Number of Nodes: {sliderVal}</label>
        <input
          id="nodeslider"
          type="range"
          min="1"
          max="500"
          value={sliderVal}
          onChange={(e) => {
            setSliderVal(e.target.value);
          }}
          onMouseUp={(e) => {
            window.localStorage.setItem("localNumNodes", sliderVal);
            window.location.reload();
          }}
        />
        <label htmlFor="connectallnodes">
          <input
            id="connectallnodes"
            type="checkbox"
            checked={connectAll}
            onChange={() => {
              window.localStorage.setItem("localConnectAll", !connectAll);
              setConnectAll(!connectAll);
            }}
          />
          Connect All Nodes
        </label>
        <a
          className="ControlPanel-button"
          onClick={() => {
            window.location.reload();
          }}
        >
          Redraw
        </a>
      </div>
      {/* SECTION 2 */}
      <div className="ControlPanel-startEndSelector">
        <h2>Select start & end</h2>

        <a
          className={
            "ControlPanel-button " +
            (startClicked ? "ControlPanel-button-pressed" : "")
          }
          onClick={() => {
            if (endClicked) {
              setEndClicked(false);
            }
            setStartClicked(!startClicked);
          }}
        >
          Start
        </a>
        <a
          className={
            "ControlPanel-button " +
            (endClicked ? "ControlPanel-button-pressed" : "")
          }
          onClick={() => {
            if (startClicked) {
              setStartClicked(false);
            }
            setEndClicked(!endClicked);
          }}
        >
          End
        </a>
        <a
          className="ControlPanel-button "
          onClick={() => setClearClicked((prev) => !prev)}
        >
          Clear
        </a>
      </div>
      {/* SECTION 3 */}
      <div className="ControlPanel-algorithm">
        <h2>Traversal Visualizer</h2>
        <legend>Select Algorithm:</legend>
        <div className="ControlPanel-algochoice">
          <label htmlFor="bfs-radio">
            <input
              id="bfs-radio"
              type="radio"
              value="bfs"
              name="algoRadioGroup"
              checked={algorithm === "bfs"}
              onChange={onAlgoChange}
            />
            Breadth First Search
          </label>

          <label htmlFor="dfs-radio">
            <input
              id="dfs-radio"
              type="radio"
              value="dfs"
              name="algoRadioGroup"
              checked={algorithm === "dfs"}
              onChange={onAlgoChange}
            />
            Depth First Search
          </label>
        </div>
        <a
          className="ControlPanel-button"
          onClick={() => {
            setVisualize((prev) => !prev);
          }}
        >
          Visualize
        </a>
      </div>
    </div>
  );
}

export default ControlPanel;
