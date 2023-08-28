import { useState, useRef, useEffect, memo } from "react";
import D3Chart from "./D3Chart.js";

function ChartWrapper({ data }) {
  const wrapper = useRef(null);
  const didMount = useRef(false);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    console.log("chartwrapper react component rerendered");
  });
  // ON FIRST RENDER CREATE THE CHART OBJECT
  useEffect(() => {
    console.log("set up chart");
    setChart(new D3Chart(wrapper.current));
  }, []);

  // ON EVERY CHANGE OF PROPS (except the first render) CALL UPDATE ON THE D3 OBJECT
  useEffect(() => {
    if (didMount.current == false) {
      didMount.current = true;
    } else {
      console.log(`displaying ${data} data`);
      chart.update(data);
    }
  }, [data]);

  return <div ref={wrapper}></div>;
}

export default ChartWrapper;
