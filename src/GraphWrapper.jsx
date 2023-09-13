import { useState, useRef, useEffect } from "react";
import D3Graph from "./D3Graph.js";
import {
  visualizeBFS,
  visualizeDFS,
  visualizeIDC,
  visualizeDAC,
} from "./functions/graphFunctions.js";

function GraphWrapper({
  graph,
  startClicked,
  setStartClicked,
  endClicked,
  setEndClicked,
  algorithm,
  visualize,
  setStats,
}) {
  const graphDiv = useRef(null);
  const didMount = useRef(false);

  const [graphInstance, setGraphInstance] = useState(false);
  const [clicked, setClicked] = useState(false);

  // when the user clicks the visualize button, trigger this function.
  // visualize is a boolean that gets toggled on and off
  useEffect(() => {
    if (didMount.current == true) {
      // For BFS and DFS select a random start position
      if (algorithm == "dfs" || algorithm == "bfs") {
        if (graphInstance.start == -1) {
          graphInstance.setStart(
            Math.floor(Math.random() * graph.nodes.length)
          );
        }
      }
      // Handle BFS visualization
      if (algorithm == "bfs") {
        let result = visualizeBFS(
          graph,
          graphInstance.start,
          graphInstance.end
        );
        graphInstance.visualize("bfs", result);
      } else if (algorithm == "dfs") {
        // Handle DFS visualization
        let result = visualizeDFS(
          graph,
          graphInstance.start,
          graphInstance.end
        );
        graphInstance.visualize("dfs", result);
      } else if (algorithm == "idc") {
        // Handle components visualization
        graphInstance.clearStartEnd();
        let result = visualizeIDC(graph);
        graphInstance.visualize("idc", result);
      } else if (algorithm == "dac") {
        // Handle cycles visualization
        graphInstance.clearStartEnd();
        let result = visualizeDAC(graph);
        graphInstance.visualize("dac", result);
      }
    }
  }, [visualize]);

  // On first render create a brand new graph component
  // pass the setClicked and setStats function so D3 can talk back to react
  useEffect(() => {
    // check for mounting because we need graph to load in before we call D3Graph
    if (didMount.current == false) {
      didMount.current = true;
    } else {
      setGraphInstance(
        new D3Graph(graphDiv.current, graph, setClicked, setStats)
      );
    }
  }, [graph]);

  //When the user clicks on a node, clicked will be updated with the node.id in clicked[0].
  //Change the color of that node in the graph instance
  useEffect(() => {
    if (clicked != false) {
      // handle setting of start and end nodes
      if (startClicked == true) {
        graphInstance.setStart(clicked[0]);
      } else if (endClicked == true) {
        graphInstance.setEnd(clicked[0]);
      }

      // handle setting the start and end buttons
      if (startClicked) {
        if (graphInstance.start != -1) {
          if (graphInstance.end == -1) {
            // if we just set a start and need to set an end -> go to end
            setStartClicked(false);
            setEndClicked(true);
          } else {
            // if we just set a start, but end is set -> turn all off
            setStartClicked(false);
          }
        }
      } else {
        if (graphInstance.end != -1) {
          // if we just set an end
          if (graphInstance.start == -1) {
            // and need to set a start
            setEndClicked(false);
            setStartClicked(true);
          } else {
            // if we just turned off an end
            setEndClicked(false);
          }
        }
      }
    }
  }, [clicked]);

  return (
    <>
      <div className="GraphWrapper-main content" ref={graphDiv}></div>
    </>
  );
}

export default GraphWrapper;
