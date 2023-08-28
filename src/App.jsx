import { useState } from "react";
import GraphWrapper from "./GraphWrapper.jsx";

function App() {
  const [data, setData] = useState(0);

  return (
    <>
      <h1>Hello World</h1>

      <GraphWrapper />
    </>
  );
}

export default App;
