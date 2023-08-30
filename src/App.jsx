import "./App.css";
import { useState, useEffect } from "react";
import GraphWrapper from "./GraphWrapper.jsx";
import ControlPanel from "./ControlPanel.jsx";

function createGraph(numNodes, existingGraph) {
  if (existingGraph == false) {
    // create empty graph template
    let newGraph = { nodes: [], edges: [], adjmap: {} };

    // loop to numNodes, create node objects, create random connections
    for (let i = 0; i < numNodes; i++) {
      // create and append node object
      newGraph.nodes.push({ id: i });

      // create and push random connection - every node will have 1 random connection
      let randomTarget = Math.floor(Math.random() * numNodes);
      while (randomTarget == i) {
        randomTarget = Math.floor(Math.random() * numNodes);
      }
      newGraph.edges.push({ source: i, target: randomTarget });
    }
    return newGraph;
  }

  /* use this code to create and adjacency list to find componenents


  // create undirected adjacency map - need to loop over edges and do this step to below

    if (!(edgeObj.source in randomDataset.adjmap)) {
      randomDataset.adjmap[edgeObj.source] = [];
    }
    randomDataset.adjmap[edgeObj.source].push(edgeObj.target);

    if (!(edgeObj.target in randomDataset.adjmap)) {
      randomDataset.adjmap[edgeObj.target] = [];
    }
    randomDataset.adjmap[edgeObj.target].push(edgeObj.source);

    // to here 
  
  if (connectComponents == true) {
    let DFSRecurse = (adjlist, parent, visited, subResult) => {
      let children = adjlist[parent];
      for (let child of children) {
        if (!visited.has(child)) {
          visited.add(child);

          subResult.push(child);
          DFSRecurse(adjlist, child, visited, subResult);
        }
      }
    };

    let DFSDriver = (adjlist) => {
      let visited = new Set();
      let finalResult = [];
      for (let [parent, child] of Object.entries(adjlist)) {
        let parentNumber = parseInt(parent);
        if (!visited.has(parentNumber)) {
          visited.add(parentNumber);
          let subResult = [parentNumber];
          DFSRecurse(adjlist, parentNumber, visited, subResult);
          finalResult.push(subResult);
        }
      }

      return finalResult;
    };

    let res = DFSDriver(randomDataset.adjmap);

    for (let i = 0; i < res.length - 1; i++) {
      // get this and next component
      let component = res[i];
      let nextComponent = res[i + 1];
      // create an edge between a random node in this and next component
      let newConnection = {
        source: Math.floor(Math.random() * component.length),
        target: Math.floor(Math.random() * nextComponent.length),
      };
      randomDataset.edges.push(newConnection);
    }
  
  }
  */
}

function App() {
  const [numNodes, setNumNodes] = useState(200);
  const [graph, setGraph] = useState(false);
  const [connectAll, setConnectAll] = useState(false);
  const [algorithm, setAlgorithm] = useState("bfs");

  useEffect(() => {
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
