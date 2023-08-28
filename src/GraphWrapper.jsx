import { useState, useRef, useEffect } from "react";
import D3Graph from "./D3Graph.js";

function GraphWrapper() {
  const wrapper = useRef(null);
  const didMount = useRef(false);
  const [graph, setGraph] = useState(null);

  // ON FIRST RENDER CREATE THE CHART OBJECT
  useEffect(() => {
    setGraph(new D3Graph(wrapper.current));
  }, []);

  // ON EVERY CHANGE OF PROPS (except the first render) CALL UPDATE ON THE D3 OBJECT
  // useEffect(() => {
  //   if (didMount.current == false) {
  //     didMount.current = true;
  //   } else {
  //     graph.update(data);
  //   }
  // }, [data]);

  return <div ref={wrapper}></div>;
}

export default GraphWrapper;
