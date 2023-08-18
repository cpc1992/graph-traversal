import { useState, useRef, useEffect } from "react";
import D3Chart from "./D3Chart.js";

function ChartWrapper() {
  const chart = useRef(null);
  const counter = useRef(0);

  useEffect(() => {
    new D3Chart(chart.current);
  }, []);

  return (
    <>
      <h1>ChartWrapper</h1>
      <div ref={chart}></div>
    </>
  );
}

export default ChartWrapper;
