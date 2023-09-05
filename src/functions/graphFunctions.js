


// Given a number and connectAll boolean, generate a random graph. applied level property to each node to produce wave effect


/* 

nodes = array of node objects:
[
    {node.id = 0, level = 0}, 
    {node.id = 1, level = 1}, 
    {node.id = 2, level = 1}
]

edges = array of edge objects: 
[
    {source: 0, target: 1, level = 0}, 
    {source: 1, target: 2, level = 1}, 
    {source: 2, target: 4, level = 2}
]

adjmap = hashmap of node.id to array of connected nodes: 
used to nodes nodes quickly
{
    '0': [2,4,5],
    '1': [3,0,6,8],
    '2': [7]
}

edgemap = hashmap of nodes to array of edge objects: 
-- use to find edges quickly
{
    '0': [{source: 0, target: 1, level = 0}, {source: 9, target: 0, level = 0}],
    '1': [{source: 1, target: 5, level = 0}],
    '2': [{source: 2, target: 3, level = 0},{source: 6, target: 2, level = 0}]
}

*/
export function createGraph(numNodes, connectAll) {
    // create empty graph template
    let newGraph = { nodes: [], edges: [], adjmap: {}, edgemap: {} };
    let edgeObj = { source: 0, target: 0 };

    // loop to numNodes, create node objects, create random connections
    for (let i = 0; i < numNodes; i++) {
        // create and append node object
        newGraph.nodes.push({ id: i, level: 0 });
        if (numNodes > 1) {
            // create and push random connection - every node will have 1 random connection
            let randomTarget = Math.floor(Math.random() * numNodes);
            while (randomTarget == i) {
                randomTarget = Math.floor(Math.random() * numNodes);
            }
            edgeObj = {};
            edgeObj.source = i;
            edgeObj.target = randomTarget;
            edgeObj.id = `${edgeObj.source}-${edgeObj.target}`

            // Add edge
            newGraph.edges.push(edgeObj);

            // create undirected adjacency map
            if (!(edgeObj.source in newGraph.adjmap)) {
                newGraph.adjmap[edgeObj.source] = [];
            }
            newGraph.adjmap[edgeObj.source].push(edgeObj.target);

            if (!(edgeObj.target in newGraph.adjmap)) {
                newGraph.adjmap[edgeObj.target] = [];
            }
            newGraph.adjmap[edgeObj.target].push(edgeObj.source);

            if (!(edgeObj.source in newGraph.edgemap)) {
                newGraph.edgemap[edgeObj.source] = [];
            }
            newGraph.edgemap[edgeObj.source].push(edgeObj);

            if (!(edgeObj.target in newGraph.edgemap)) {
                newGraph.edgemap[edgeObj.target] = [];
            }
            newGraph.edgemap[edgeObj.target].push(edgeObj);
        }
    }

    if (numNodes > 1) {
        if (connectAll) {
            connectComponents(newGraph);
        }

        // run bfs from a node and keep track of visited. at every level, attach count to level property.
        let queue = [];
        let innerQueue = [];
        let visited = new Set();
        let parent = 0;
        let childrenNodes = [];
        let childrenEdges = [];
        let count = 0;

        for (let node of newGraph.nodes) {
            if (!visited.has(node.id)) {
                count = 0;
                queue.push(node.id);

                while (queue.length > 0) {
                    // pop everyone from queue and put their children on the inner queue
                    while (queue.length > 0) {
                        parent = queue.shift();
                        newGraph.nodes[parent].level = count;
                        visited.add(parent);
                        childrenNodes = newGraph.adjmap[parent.toString()];
                        childrenEdges = newGraph.edgemap[parent.toString()];

                        // add level to edge
                        for (let childEdge of childrenEdges) {
                            if (!Object.hasOwn(childEdge, "level")) {
                                childEdge.level = count + 1;
                            }
                        }

                        // push children onto inner queue
                        for (let childNode of childrenNodes) {
                            if (!visited.has(childNode)) {
                                innerQueue.push(childNode);
                            }
                        }
                    }
                    count += 2;

                    queue.push(...innerQueue);
                    innerQueue = [];
                }
            }
        }
    }
    console.log(newGraph)
    return newGraph;
}

//given a unconnected graph structure, connect all components
export function connectComponents(graphStructure) {
    // collects all components of the graph and returns them in an array
    let DFSDriver = (adjlist) => {
        let visited = new Set();
        let components = [];
        for (let [parent, child] of Object.entries(adjlist)) {
            let parentNumber = parseInt(parent);
            if (!visited.has(parentNumber)) {
                visited.add(parentNumber);
                let subResult = [parentNumber];
                DFSRecurse(adjlist, parentNumber, visited, subResult);
                components.push(subResult);
            }
        }

        return components;
    };

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

    let allComponents = DFSDriver(graphStructure.adjmap);

    if (allComponents.length > 1) {
        for (let i = 0; i < allComponents.length - 1; i++) {
            // get this and next component
            let currComponent = allComponents[i];
            let nextComponent = allComponents[i + 1];

            let randomSourceNum =
                currComponent[Math.floor(Math.random() * currComponent.length)];
            let randomTargetNum =
                nextComponent[Math.floor(Math.random() * nextComponent.length)];
            // create an edge between a random node in this and next component
            let newEdge = {
                source: randomSourceNum,
                target: randomTargetNum,
            };
            graphStructure.edges.push(newEdge);

            graphStructure.adjmap[newEdge.source].push(newEdge.target);
            graphStructure.adjmap[newEdge.target].push(newEdge.source);
            graphStructure.edgemap[newEdge.source].push(newEdge);
            graphStructure.edgemap[newEdge.target].push(newEdge);
        }
    }
}

//input a graph structure, edit the levels of the nodes and edges
export function visualizeBFS(graphStructure, start, end) {
    let visitedNodes = new Set()
    let visitedEdges = new Set()

    // graphStructure.edges.map((m) => {
    //     console.log(m)
    // })

    let bestPath = []
    let count = 0
    let queue = []

    graphStructure.nodes[start].level = count

    count += 1

    queue.push(graphStructure.nodes[start])
    visitedNodes.add(start)


    while (queue.length > 0) {
        //pop off farthest left node from queue
        let node = queue.shift()

        //get connected edges of that node
        let connectedEdges = graphStructure.edgemap[node.id.toString()]

        for (let edge of connectedEdges) {
            console.log('he8')

            if (!visitedEdges.has(edge.id)) {
                console.log(edge)
                edge.level = count
                count += 1
                visitedEdges.add(edge.id)
            }

            if (!visitedEdges.has(edge.source.id)) {
                edge.source.level = count
                count += 1
                visitedEdges.add(edge.source.id)
                queue.push(edge.source)
            }
            if (!visitedEdges.has(edge.source.id)) {
                edge.target.level = count
                count += 1
                visitedEdges.add(edge.target.id)
                queue.push(edge.target)
            }





        }





    }

    // console.log('=')
    // graphStructure.edges.map((m) => {
    //     console.log(m)
    // })
    // graphStructure.nodes.map((m) => {
    //     console.log(m)
    // })
    // console.log(graphStructure)
}
