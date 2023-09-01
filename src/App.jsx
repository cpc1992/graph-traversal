import "./App.css";
import { useState, useEffect } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";

function createGraph(numNodes, existingGraph) {
  // if (existingGraph == false) {
  // create empty graph template
  let newGraph = { nodes: [], edges: [], adjmap: {} };
  // loop to numNodes, create node objects, create random connections
  for (let i = 0; i < numNodes; i++) {
    // create and append node object
    newGraph.nodes.push({ id: i });
    if (numNodes > 1) {
      // create and push random connection - every node will have 1 random connection
      let randomTarget = Math.floor(Math.random() * numNodes);
      while (randomTarget == i) {
        randomTarget = Math.floor(Math.random() * numNodes);
      }
      newGraph.edges.push({ source: i, target: randomTarget });
    }
  }
  return newGraph;
  // }
}

function App() {
  const [numNodes, setNumNodes] = useState(2);
  const [graph, setGraph] = useState(false);
  const [connectAll, setConnectAll] = useState(false);
  const [algorithm, setAlgorithm] = useState("bfs");

  useEffect(() => {
    // call create graph function to create a graph structure set it to the state
    setGraph((existingGraph) => createGraph(numNodes, existingGraph));
  }, [numNodes]);

  return (
    <>
      <h1>Graph Traversal Visualizer</h1>
      <div className="App-content">
        <GraphWrapper graph={graph} />
        <ControlPanel
          numNodes={numNodes}
          setNumNodes={setNumNodes}
          connectAll={connectAll}
          setConnectAll={setConnectAll}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
        />
      </div>
    </>
  );
}

export default App;
