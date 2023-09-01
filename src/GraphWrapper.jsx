import { useState, useRef, useEffect } from "react";
import D3Graph from "./D3Graph.js";

function GraphWrapper({ graph }) {
  const graphDiv = useRef(null);
  const didMount = useRef(false);

  const [graphInstance, setGraphInstance] = useState(null);

  // ON FIRST RENDER CREATE THE CHART OBJECT
  useEffect(() => {
    setGraphInstance(new D3Graph(graphDiv.current));
  }, []);

  useEffect(() => {
    if (graph != false) {
      graphInstance.update(graph);
    }
  }, [graphInstance]);

  function rotate() {
    graphInstance.killSim();
    graphDiv.current.innerHTML = "";

    setGraphInstance(new D3Graph(graphDiv.current));
  }
  // ON EVERY CHANGE OF PROPS (except the first render) CALL UPDATE ON THE D3 OBJECT
  // useEffect(() => {
  //   if (didMount.current == false) {
  //     didMount.current = true;
  //   } else {
  //     graph.update(data);
  //   }
  // }, [data]);

  return (
    <>
      <button
        onClick={() => {
          rotate();
        }}
      >
        Swap
      </button>
      <div className="GraphWrapper-main" ref={graphDiv}></div>
    </>
  );
}

export default GraphWrapper;
