import { useState, useRef, useEffect } from "react";
import D3Graph from "./D3Graph.js";

function GraphWrapper({ graph }) {
  const wrapper = useRef(null);
  const didMount = useRef(false);

  const [graphInstance, setGraphInstance] = useState(null);

  // ON FIRST RENDER CREATE THE CHART OBJECT
  useEffect(() => {
    console.log("graphwrapper first render");

    setGraphInstance(new D3Graph(wrapper.current));
  }, []);

  useEffect(() => {
    console.log(graph);
    if (graph != false) {
      console.log("graphwrapper rendered");
      graphInstance.update(graph);
    }
  });

  // ON EVERY CHANGE OF PROPS (except the first render) CALL UPDATE ON THE D3 OBJECT
  // useEffect(() => {
  //   if (didMount.current == false) {
  //     didMount.current = true;
  //   } else {
  //     graph.update(data);
  //   }
  // }, [data]);

  return <div className="GraphWrapper-main" ref={wrapper}></div>;
}

export default GraphWrapper;
