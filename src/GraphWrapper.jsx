import { useState, useRef, useEffect } from "react";
import D3Graph from "./D3Graph.js";
import {
  visualizeBFS,
  visualizeDFS,
  visualizeIDC,
} from "./functions/graphFunctions.js";

function GraphWrapper({
  graph,
  startClicked,
  setStartClicked,
  endClicked,
  setEndClicked,
  clearClicked,
  algorithm,
  visualize,
}) {
  const graphDiv = useRef(null);
  const didMount = useRef(false);

  const [graphInstance, setGraphInstance] = useState(false);
  const [clicked, setClicked] = useState(false);

  // when the user clicks the visualize button, trigger this function. visualize is a boolean that gets toggled on and off
  useEffect(() => {
    if (didMount.current == true) {
      // find random start
      if (graphInstance.start == -1) {
        graphInstance.setStart(Math.floor(Math.random() * graph.nodes.length));
      }
      //find random end
      if (graphInstance.end == -1) {
        let randomTarget = Math.floor(Math.random() * graph.nodes.length);
        while (randomTarget == graphInstance.start) {
          randomTarget = Math.floor(Math.random() * graph.nodes.length);
        }
        graphInstance.setEnd(randomTarget);
      }
      console.log("visualizing");
      if (algorithm == "bfs") {
        visualizeBFS(graph, graphInstance.start, graphInstance.end);
        graphInstance.visualize("bfs");
      } else if (algorithm == "dfs") {
        visualizeDFS(graph, graphInstance.start, graphInstance.end);
        graphInstance.visualize("dfs");
      } else if (algorithm == "idc") {
        graphInstance.clearStartEnd();
        visualizeIDC(graph, graphInstance.start);
        graphInstance.visualize("idc");
      }
    }
  }, [visualize]);

  // ON FIRST RENDER CREATE THE CHART OBJECT
  useEffect(() => {
    if (didMount.current == false) {
      didMount.current = true;
    } else {
      setGraphInstance(new D3Graph(graphDiv.current, graph, setClicked));
    }
  }, [graph]);

  //When the user clicks on a node, clicked will be updated with the node.id in clicked[0].
  //Change the color of that node in the graph instance
  useEffect(() => {
    if (clicked != false) {
      if (startClicked == true) {
        graphInstance.setStart(clicked[0]);
      } else if (endClicked == true) {
        graphInstance.setEnd(clicked[0]);
      }

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

  useEffect(() => {
    if (graphInstance != false) {
      setEndClicked(false);
      setStartClicked(false);
      graphInstance.clearStartEnd();
    }
  }, [clearClicked]);

  return (
    <>
      <div className="GraphWrapper-main" ref={graphDiv}></div>
    </>
  );
}

export default GraphWrapper;
