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
  generatorTab,
  setGeneratorTab,
  gridDiameter,
  setGridDiameter,
  stats,
}) {
  const [sliderVal, setSliderVal] = useState(numNodes);
  const [gridSliderVal, setGridSliderVal] = useState(gridDiameter);
  const onAlgoChange = (e) => {
    window.localStorage.setItem("localAlgorithm", e.target.value);
    setAlgorithm(e.target.value);
  };
  const handleTabs = (choice) => {
    window.localStorage.setItem("localGeneratorTab", choice);
    setGeneratorTab(choice);
    window.location.reload();
    console.log(choice);
  };

  return (
    <div className="ControlPanel-main content">
      {/* SECTION 1 */}

      <div className="ControlPanel-generator">
        <h2 className="ControlPanel-steptitle">1) Generate a Graph</h2>
        <div className="ControlPanel-tabs">
          <div
            className={
              "ControlPanel-button ControlPanel-tab " +
              (generatorTab == "graph" ? "ControlPanel-button-pressed" : "")
            }
            onClick={() => handleTabs("graph")}
          >
            {" "}
            Random
          </div>
          <div
            className={
              "ControlPanel-button ControlPanel-tab " +
              (generatorTab == "grid" ? "ControlPanel-button-pressed" : "")
            }
            onClick={() => handleTabs("grid")}
          >
            {" "}
            Grid
          </div>
        </div>
        {generatorTab == "graph" ? (
          <>
            <label htmlFor="nodeslider" className="ControlPanel-smalltext">
              Number of Nodes: {sliderVal}
            </label>
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
                window.location.reload();
              }}
            />
            <label
              htmlFor="connectallnodes"
              className={
                connectAll == true
                  ? "ControlPanel-text-chosen"
                  : "ControlPanel-smalltext"
              }
            >
              <input
                id="connectallnodes"
                type="checkbox"
                checked={connectAll}
                className="ControlPanel-input"
                onChange={() => {
                  window.localStorage.setItem("localConnectAll", !connectAll);
                  setConnectAll(!connectAll);
                }}
              />
              Connect All Nodes
            </label>
          </>
        ) : (
          <>
            <label htmlFor="gridslider" className="ControlPanel-smalltext">
              Grid Diameter: {gridSliderVal}
            </label>
            <input
              id="gridslider"
              type="range"
              min="1"
              max="25"
              value={gridSliderVal}
              onChange={(e) => {
                setGridSliderVal(e.target.value);
              }}
              onMouseUp={(e) => {
                window.localStorage.setItem("localGridDiameter", gridSliderVal);
                window.location.reload();
              }}
            />
          </>
        )}
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
        <h2 className="ControlPanel-steptitle">
          2) Select Start/End & Algorithm
        </h2>
        <div className="ControlPanel-tabs">
          <a
            className={
              "ControlPanel-button ControlPanel-tab " +
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
              "ControlPanel-button ControlPanel-tab " +
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
        </div>
        <div className="ControlPanel-algochoice">
          <label
            className={
              algorithm == "dfs"
                ? "ControlPanel-text-chosen"
                : "ControlPanel-smalltext"
            }
            htmlFor="dfs-radio"
          >
            <input
              id="dfs-radio"
              type="radio"
              value="dfs"
              name="algoRadioGroup"
              checked={algorithm === "dfs"}
              onChange={onAlgoChange}
              className="ControlPanel-input"
            />
            Depth First Search
          </label>

          <label
            className={
              algorithm == "bfs"
                ? "ControlPanel-text-chosen"
                : "ControlPanel-smalltext"
            }
            htmlFor="bfs-radio"
          >
            <input
              id="bfs-radio"
              type="radio"
              value="bfs"
              name="algoRadioGroup"
              checked={algorithm === "bfs"}
              onChange={onAlgoChange}
              className="ControlPanel-input"
            />
            Breadth First Search
          </label>

          <label
            className={
              algorithm == "idc"
                ? "ControlPanel-text-chosen"
                : "ControlPanel-smalltext"
            }
            htmlFor="idc-radio"
          >
            <input
              id="idc-radio"
              type="radio"
              value="idc"
              name="algoRadioGroup"
              checked={algorithm === "idc"}
              onChange={onAlgoChange}
              className="ControlPanel-input"
            />
            Identify Subgraphs
          </label>

          <label
            className={
              algorithm == "dac"
                ? "ControlPanel-text-chosen"
                : "ControlPanel-smalltext"
            }
            htmlFor="dac-radio"
          >
            <input
              id="dac-radio"
              type="radio"
              value="dac"
              name="algoRadioGroup"
              checked={algorithm === "dac"}
              onChange={onAlgoChange}
              className="ControlPanel-input"
            />
            Detect All Cycles
          </label>
        </div>
      </div>
      {/* SECTION 3 */}
      <div className="ControlPanel-algorithm">
        <h2 className="ControlPanel-steptitle">3) Visualize</h2>

        <a
          className="ControlPanel-button"
          onClick={() => {
            setVisualize((prev) => !prev);
          }}
        >
          Visualize
        </a>
        <div className="ControlPanel-stats">
          {stats.length > 0 ? (
            <>
              <div className="ControlPanel-smalltext ControlPanel-center">
                Results:
              </div>

              {stats.map((stat, idx) => (
                <div className="ControlPanel-smalltext" key={idx}>
                  {stat}
                </div>
              ))}
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
