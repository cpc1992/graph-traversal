import { useState, useRef, useEffect } from "react";
import D3Chart from "./D3Chart.js";

function ChartWrapper() {
  const wrapper = useRef(null);

  useEffect(() => {
    let d3chart = new D3Chart(wrapper.current);
  }, []);

  return <div ref={wrapper}></div>;
}

export default ChartWrapper;
