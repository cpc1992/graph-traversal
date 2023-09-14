/* a Graph structure looks like this: 

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

// create a NxN grid graph
export function createGrid(gridDiameter) {
    let num_rows = gridDiameter
    let num_cols = gridDiameter
    let gridDataset = { nodes: [], edges: [], adjmap: {}, edgemap: {}, type: 'grid' };

    let count = 0
    // iterate through rows and columns
    for (let r = 0; r < num_rows; r++) {
        for (let c = 0; c < num_cols; c++) {

            // create a push a new node
            let newNode = { id: count, level: 0, start: false, end: false, path: [], componentColor: -1, nonSpanning: false, parent: -1, type: 'node' };
            gridDataset.nodes.push(newNode)

            let downEdge
            let rightEdge

            //handle right edge
            if (c < num_cols - 1) {
                let edgeSource = count
                let edgeTarget = count + 1
                // add a new edge going right from our node
                rightEdge = { source: edgeSource, target: edgeTarget, id: `${edgeSource}-${edgeTarget}`, level: -1, path: [], componentColor: -1, nonSpanning: false, type: 'edge' };

                if (!(rightEdge.source in gridDataset.adjmap)) {
                    gridDataset.adjmap[rightEdge.source] = [];
                }
                gridDataset.adjmap[rightEdge.source].push(rightEdge.target);

                if (!(rightEdge.target in gridDataset.adjmap)) {
                    gridDataset.adjmap[rightEdge.target] = [];
                }
                gridDataset.adjmap[rightEdge.target].push(rightEdge.source);

                if (!(rightEdge.source in gridDataset.edgemap)) {
                    gridDataset.edgemap[rightEdge.source] = [];
                }
                gridDataset.edgemap[rightEdge.source].push(rightEdge);

                if (!(rightEdge.target in gridDataset.edgemap)) {
                    gridDataset.edgemap[rightEdge.target] = [];
                }
                gridDataset.edgemap[rightEdge.target].push(rightEdge);

                gridDataset.edges.push(rightEdge)
            }

            // handle down edge
            if (r < num_rows - 1) {
                let edgeSource = count
                let edgeTarget = count + num_cols
                // add a new edge going down from our node
                downEdge = { source: edgeSource, target: edgeTarget, id: `${edgeSource}-${edgeTarget}`, level: -1, path: [], componentColor: -1, nonSpanning: false, type: 'edge' };

                if (!(downEdge.source in gridDataset.adjmap)) {
                    gridDataset.adjmap[downEdge.source] = [];
                }
                gridDataset.adjmap[downEdge.source].push(downEdge.target);

                if (!(downEdge.target in gridDataset.adjmap)) {
                    gridDataset.adjmap[downEdge.target] = [];
                }
                gridDataset.adjmap[downEdge.target].push(downEdge.source);

                if (!(downEdge.source in gridDataset.edgemap)) {
                    gridDataset.edgemap[downEdge.source] = [];
                }
                gridDataset.edgemap[downEdge.source].push(downEdge);

                if (!(downEdge.target in gridDataset.edgemap)) {
                    gridDataset.edgemap[downEdge.target] = [];
                }
                gridDataset.edgemap[downEdge.target].push(downEdge);

                gridDataset.edges.push(downEdge)
            }
            count++
        }
    }

    // initialize the levels and return it
    if (gridDiameter > 1) {
        initializeGraph(gridDataset)
    }
    return gridDataset
}

// create a random graph given a number of nodes
export function createGraph(numNodes, connectAll) {

    // create empty graph template
    let newGraph = { nodes: [], edges: [], adjmap: {}, edgemap: {}, type: 'graph' };

    // loop to numNodes, create node objects, create random connections
    for (let i = 0; i < numNodes; i++) {
        // create and push new node
        let newNode = { id: i, level: -1, start: false, end: false, path: [], componentColor: -1, nonSpanning: false, parent: -1, type: 'node' };
        newGraph.nodes.push(newNode)

        if (numNodes > 1) {

            // generate random connections for the edge - dont let a edge point to itself
            let randomTarget = Math.floor(Math.random() * numNodes);
            while (randomTarget == i) {
                randomTarget = Math.floor(Math.random() * numNodes);
            }
            // do not allow two edged to have the same source and target. example: edge1 - a points to b ... edge2 - b points to a
            // this messes up the search and cycle algorithms
            if (thisEdgeExists(newGraph.edgemap, i, randomTarget) == false) {

                // create new edge and push it
                let edgeObj = { source: i, target: randomTarget, id: `${i}-${randomTarget}`, level: -1, path: [], componentColor: -1, nonSpanning: false, type: 'edge' };
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
    }

    // if the user specified to connect all nodes, do so
    if (numNodes > 1) {
        if (connectAll) {
            connectComponents(newGraph);
        }
        // initialize the graph
        initializeGraph(newGraph)
    }

    return newGraph;
}

// Runs through the newly created graph and gives every node and edge a level property.
// the level property dictates the order in which animations occur on it.
// we cannot use the universal BFS function because the graph at this point is not initialize by D3 and has a different structure.
export function initializeGraph(newGraph) {

    let visited = new Set();
    let innerQueue = []

    for (let root of newGraph.nodes) {
        if (!visited.has(root.id)) {

            let queue = [];
            let count = 0;
            queue.push(root);
            visited.add(root.id)
            root.level = count
            count++
            while (queue.length > 0) {
                //double while loop to get ALL nodes on the same level to synchronize count
                while (queue.length > 0) {
                    let parentNode = queue.shift();

                    let connectedEdges = newGraph.edgemap[parentNode.id.toString()]
                    for (let edge of connectedEdges) {

                        // get child node   
                        let childNode = newGraph.nodes[edge.source]
                        if (newGraph.nodes[edge.source].id == parentNode.id) {
                            childNode = newGraph.nodes[edge.target]
                        }
                        // set level on edge
                        if (!visited.has(edge.id)) {
                            //set level for edges
                            visited.add(edge.id)
                            edge.level = count
                        }
                        // set level for nodes. push onto queue
                        if (!visited.has(childNode.id)) {
                            childNode.level = count + 1

                            visited.add(childNode.id)
                            innerQueue.push(childNode)
                        }
                    }
                }
                queue.push(...innerQueue)
                innerQueue = []
                count += 2
            }
        }
    }
}

// given a unconnected graph structure, connect all components
// call recursive DFS on all nodes to collect all subgraphs then connects a random node in each one to each other.
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

    // call DFS on all nodes - returns an array of all subgraphs
    let allComponents = DFSDriver(graphStructure.adjmap);

    // connect all subgraphs randomly
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
                id: `${randomSourceNum}-${randomTargetNum}`
            };
            // update graphstructure
            graphStructure.edges.push(newEdge);
            graphStructure.adjmap[newEdge.source].push(newEdge.target);
            graphStructure.adjmap[newEdge.target].push(newEdge.source);
            graphStructure.edgemap[newEdge.source].push(newEdge);
            graphStructure.edgemap[newEdge.target].push(newEdge);
        }
    }
}

// takes in an edgemap and a source and target integer
// checks if the complement edge exists already 
export function thisEdgeExists(edgemap, source, target) {
    if (Object.hasOwn(edgemap, source.toString())) {
        let edgesArray = edgemap[source]
        for (let edge of edgesArray) {
            if (edge.source == target) {
                return true
            }
        }
    }
    return false

}

// reset all attributes of the nodes and edges to specification
// if no options are specified, reset everything
export function resetGraph(graphStructure, resetOptions) {
    if (resetOptions == null) {
        resetOptions = {
            resetLevel: true,
            resetPath: true,
            resetIsCycleEdge: true,
            resetComponentColor: true,
            resetParent: true
        }
    }
    for (let edge of graphStructure.edges) {
        if (resetOptions.resetLevel) edge.level = -1
        if (resetOptions.resetPath) edge.path = []
        if (resetOptions.resetComponentColor) edge.componentColor = -1
        if (resetOptions.resetIsCycleEdge) edge.isCycleEdge = false
    }
    for (let node of graphStructure.nodes) {
        if (resetOptions.resetLevel) node.level = -1
        if (resetOptions.resetPath) node.path = []
        if (resetOptions.resetComponentColor) node.componentColor = -1
        if (resetOptions.resetIsCycleEdge) node.isCycleEdge = false
        if (resetOptions.resetParent) node.parent = -1
    }
}

// handle BFS visualization algorithm
export function visualizeBFS(graphStructure, start, end) {
    let options = {
        setLevels: true,
        setPaths: true,
        findCycleEdges: false,
        start: start,
        end: end,
        count: 0,
        visited: new Set(),
        resetOptions: 'all'
    }

    let returned = breadthFirstSearch(graphStructure, options)
    let result = { endFound: returned.endFound, nodesVisited: returned.nodesVisited }
    return result
}

// handle DFS visualization algorithm
export function visualizeDFS(graphStructure, start, end) {

    resetGraph(graphStructure)

    let count = 0
    let visitedNodes = new Set()
    let visitedEdges = new Set()
    let stack = []
    let endFound = false

    // push root onto stack
    let root = graphStructure.nodes[start]
    root.path.push(root)
    stack.push([root, -1])

    while (stack.length > 0) {

        // pop the last node and edge from the stack
        let [parentNode, parentEdge] = stack.pop()

        // EDGE - for the edge, if we havent visited it, add it to visited and add level 
        if (parentEdge != -1) {
            if (!visitedEdges.has(parentEdge.id)) {
                parentEdge.level = count
                count += 1
                visitedEdges.add(parentEdge.id)
            }
        }

        //NODE
        if (parentNode != -1) {
            // if we havent visited the node, add it to visited and add level 
            if (!visitedNodes.has(parentNode.id)) {
                parentNode.level = count
                count += 1
                visitedNodes.add(parentNode.id)
                // if we've reached our target, return 
                if (parentNode.end == true) {
                    endFound = true
                    break
                }
            }

            // get all edges connected to the parent and iterate through them
            let childrenEdges = graphStructure.edgemap[parentNode.id.toString()]

            for (let edge of childrenEdges) {

                // get the child node 
                let childNode = edge.source
                if (childNode.id == parentNode.id) childNode = edge.target

                // if we find a edge or node that we havent visited, push them onto the stack.
                let nextOnStack = [-1, -1]
                if (!visitedNodes.has(childNode.id)) {
                    nextOnStack[0] = childNode
                    if (!visitedEdges.has(edge.id)) {
                        childNode.path = [...parentNode.path, edge, childNode]
                    }
                    nextOnStack[1] = edge
                }
                if (nextOnStack[0] != -1 || nextOnStack[1] != -1) {
                    stack.push(nextOnStack)
                }
            }
        }
    }

    let result = { endFound: endFound, nodesVisited: visitedNodes.size }
    return result
}

// handle identifying subgraphs/components algorithm
export function visualizeIDC(graphStructure, start) {

    resetGraph(graphStructure)

    let visitedNodes = new Set()
    let visitedEdges = new Set()

    // same dfs function but without the path processing and uses universal visited lists
    function subDFS(nodeNum, visitedNodes, visitedEdges, componentNumber) {

        let count = 0
        let stack = []

        // push root onto stack
        let root = graphStructure.nodes[nodeNum]
        stack.push([root, -1])

        while (stack.length > 0) {

            // pop the last node and edge from the stack
            let [parentNode, parentEdge] = stack.pop()

            // handle Edge - for the edge, if we havent visited it, add it to visited and add level 
            if (parentEdge != -1) {
                if (!visitedEdges.has(parentEdge.id)) {
                    parentEdge.level = count
                    parentEdge.componentColor = componentNumber
                    count += 1
                    visitedEdges.add(parentEdge.id)
                }
            }

            // handle Nodes
            if (parentNode != -1) {
                // if we havent visited the node, add it to visited and add level 
                if (!visitedNodes.has(parentNode.id)) {
                    parentNode.level = count
                    parentNode.componentColor = componentNumber
                    count += 1
                    visitedNodes.add(parentNode.id)
                }

                // get all edges connected to the parent and iterate through them
                let childrenEdges = graphStructure.edgemap[parentNode.id.toString()]

                for (let edge of childrenEdges) {

                    // get the child node 
                    let childNode = edge.source
                    if (childNode.id == parentNode.id) childNode = edge.target

                    // if we find a edge or node that we havent visited, push them onto the stack.
                    let nextOnStack = [-1, -1]
                    if (!visitedNodes.has(childNode.id)) {
                        if (!visitedEdges.has(edge.id)) {
                            nextOnStack[0] = childNode
                        }
                        nextOnStack[1] = edge
                    }
                    if (nextOnStack[0] != -1 || nextOnStack[1] != -1) {
                        stack.push(nextOnStack)
                    }
                }
            }
        }
    }

    // call DFS for every node and collect component information
    let componentNumber = 0
    for (let node of graphStructure.nodes) {
        if (!visitedNodes.has(node.id)) {
            subDFS(node.id, visitedNodes, visitedEdges, componentNumber)
            componentNumber += 1
        }
    }

    let result = { numSubGraphs: componentNumber, nodesVisited: graphStructure.nodes.length }
    return result
}

// Detect all cycles in an undirected unweighted graph
// 1) run BFS on every subgraph and keep track of edges that connect to a node we've seen before
// 2) remove those edges to create a spanning tree
// 3) find the shortest path thru the spanning tree to connect the two nodes of every removed edge
// 4) convert all edges in the above paths into a bit map. This bitmap represents the cycle base
// 5) if two paths in cycle base have edges in common, then XOR the bit maps to produce a new cycle 
// 6) concatenate all newly created cycles with the cycle base to produce a full list of complex cycles
// why is this so complex!!
export function visualizeDAC(graphStructure) {

    let visited = new Set()
    let res
    let removedEdges = []
    // BFS through all nodes and keep track of edges that produce cycles
    for (let root of graphStructure.nodes) {
        if (!visited.has(root.id)) {
            let options = {
                setLevels: true,
                setPaths: false,
                findCycleEdges: true,
                start: root.id,
                end: -1,
                count: 0,
                visited: visited,
                resetOptions: {
                    resetLevel: false,
                    resetPath: true,
                    resetComponentColor: true,
                    resetIsCycleEdge: false,
                    resetParent: false
                }
            }
            res = breadthFirstSearch(graphStructure, options)
            // compile all extra edges
            removedEdges.push(...res.cycleEdges)
        }
    }

    // remove those edges to create a spanning tree
    let spanningTree = cloneThisGraph(graphStructure, removedEdges)

    let edgeToSlotMap = {}  // map edges to array slots
    let slotToEdgeMap = []  // map array slots to edges
    let cycleBitGrid = []   // grid of arrays of bits 
    let cycleBase = []      // array of arrays of actual paths 
    let edgeCount = 0
    let overlappingCycles = false

    // iterate through all removed edges and find the shortest path between the two nodes
    for (let edge of removedEdges) {

        let source = edge.source
        let target = edge.target

        let options = {
            setLevels: false,
            setPaths: true,
            findCycleEdges: false,
            start: source.id,
            end: target.id,
            count: 0,
            visited: new Set(),
            resetOptions: {
                resetLevel: false,
                resetPath: true,
                resetComponentColor: true,
                resetIsCycleEdge: false,
                resetParent: false
            }
        }
        res = breadthFirstSearch(spanningTree, options)

        // save each path
        target.path.push(edge, source)
        // append 0s to the previous rows in the bit map if a new path doesn't include the same edges
        let edgesInThisCycle = []
        for (let i = 0; i < edgeCount; i++) {
            edgesInThisCycle.push(0)
        }
        // create the bitmap of all edges
        for (let edge of target.path) {
            if (edge.type == 'edge') {
                // if this edge hasn't appeared before
                if (!Object.hasOwn(edgeToSlotMap, edge.index.toString())) {
                    slotToEdgeMap.push(edge)
                    // add to index map
                    edgeToSlotMap[edge.index.toString()] = edgeCount
                    edgeCount++
                    // push a new 1 onto this edges cycle index array 
                    edgesInThisCycle.push(1)
                } else { // if it has appeared before, indicate so - there are some overlapping cycles 
                    overlappingCycles = true
                    // get the array index of this edge, and update this cycle's index for that edge to 1
                    edgesInThisCycle[edgeToSlotMap[edge.index.toString()]] = 1
                }
            }
        }
        cycleBitGrid.push(edgesInThisCycle)
        cycleBase.push(target.path)
    }

    // if we found 2 cycles that overlap, we need to find all complex cycles
    // also if you run this part with the grid graph, it will crash because there are polynomial number of complex cycles in a grid
    if (graphStructure.type == 'graph' && overlappingCycles == true) {

        // complete the bit map by filling 0s for the previous rows
        for (let cycle of cycleBitGrid) {
            let currLength = cycle.length
            let targetLength = edgeCount
            for (let i = 0; i < targetLength - currLength; i++) {
                cycle.push(0)
            }
        }

        // logical AND all the cycles in the cycle grid with each other, if overlap is found, save the xor array of the two arrays
        let complexCycles = []

        for (let i = 0; i < cycleBitGrid.length; i++) {
            let row1 = cycleBitGrid[i]
            for (let j = i + 1; j < cycleBitGrid.length; j++) {
                let row2 = cycleBitGrid[j]
                let andCheck = false
                let xorArray = []

                // i am doing the XOR even before we found an overlapping edge. 
                // if we do find an overlapping edge, we will save this array
                // if not then we do nothing with it.
                for (let k = 0; k < row1.length; k++) {
                    let row1slot = row1[k]
                    let row2slot = row2[k]

                    // create XOR array
                    if (row1slot ^ row2slot == 1) {
                        xorArray.push(slotToEdgeMap[k])
                    }

                    // indicate if we found an overlap 
                    if (row1slot & row2slot == 1) {
                        andCheck = true
                    }

                }
                // if we found some overlap, save this new cycle array
                if (andCheck == true) {
                    complexCycles.push(xorArray)
                }
            }
        }

        // We've found all complex cycles, but they might not be in order. 
        // start with the first node and first edge, 
        // search through the rest of the array for the next node/edge and swap it into the slot that it belongs.
        let allNewCycles = []
        for (let xorArray of complexCycles) {
            let newCycle = []
            let next
            // iterate through the xorArray and put edges and nodes in order
            for (let i = 0; i < xorArray.length; i++) {
                if (i == 0) {
                    // immediately put the first node and first edge in the array
                    newCycle.push(xorArray[i].source, xorArray[i])
                    next = xorArray[i].target
                } else {
                    newCycle.push(next)
                    // find the next node or the next edge in the array and swap it into place. 
                    for (let j = i; j < xorArray.length; j++) {
                        if ((next.id == xorArray[j].source.id) || (next.id == xorArray[j].target.id)) {
                            let temp = xorArray[i]
                            xorArray[i] = xorArray[j]
                            xorArray[j] = temp

                            // save a next pointer so we know where to pick up on the next loop
                            if (next.id == xorArray[i].source.id) {
                                next = xorArray[i].target
                            } else {
                                next = xorArray[i].source
                            }
                            break
                        }
                    }
                    newCycle.push(xorArray[i])
                }
            }
            // at the very end next will be the final node that we need to put into the array. All complex cycles are now in correct order.
            newCycle.push(next)
            allNewCycles.push(newCycle)
        }
        // concatenate cycle base and the complex cycles to get ALL cycles in the graph
        cycleBase.push(...allNewCycles)
    }

    let result = { cycles: cycleBase, numCycles: cycleBase.length, nodesVisited: graphStructure.nodes.length }
    return result
}


// shallow copies graphStructure, all pointers to nodes and edges should persist. remove existence of excluded edge if specified
// adjmap is not copied as we only use that on startup. eventially i will rework the code so we dont use it at all
export function cloneThisGraph(graphStructure, excludeEdges) {
    let cloneGraph = { nodes: [], edges: [], edgemap: {} }

    //copy nodes
    for (let node of graphStructure.nodes) {
        cloneGraph.nodes.push(node)
    }

    // copy edges 
    for (let edge of graphStructure.edges) {
        if (!excludeEdges.includes(edge)) {
            cloneGraph.edges.push(edge)
        }
    }

    // copy edgemap
    for (let [node, edgeList] of Object.entries(graphStructure.edgemap)) {
        let cloneEdgeList = []
        for (let edge of edgeList) {
            if (!excludeEdges.includes(edge)) {
                cloneEdgeList.push(edge)
            }
        }
        cloneGraph.edgemap[node] = cloneEdgeList
    }

    return cloneGraph
}


/*    Resuable BFS function. 
-- takes in an option parameter and returns a result object

options: {
    setLevels: true | false
    setPaths: true | false 
    findCycleEdges: true | false 
    start: int
    end: int
    count: int
    visited: set()

    resetOptions: 'all' | 'none' | 
    {   resetLevel:           true | false 
        resetPath:            true | false 
        resetComponentColor:  true | false 
        resetIsCycleEdge:     true | false 
        resetParent:          true | false  
    }
}

returns: {
    endFound: boolean, 
    nodesVisited: int, 
    edgesVisited: int, 
    cycleEdges: array of edges 
}
*/
export function breadthFirstSearch(graphStructure, options) {

    // create defaults for the options if not specified
    let setLevels = options.setLevels || false
    let setPaths = options.setPaths || false
    let findCycleEdges = options.findCycleEdges || false
    let count = options.count || 0
    let visited = options.visited || new Set()
    let resetOptions = options.resetOptions || 'none'
    let start = (options.start == undefined ? 0 : options.start)
    let end = (options.end == undefined ? -1 : options.end)

    let result = { endFound: false, nodesVisited: 0, edgesVisited: 0, cycleEdges: [] }

    // reset some or all the graph attributes
    if (resetOptions == 'all') {
        resetGraph(graphStructure)
    } else if (resetOptions != 'none') {
        resetGraph(graphStructure, resetOptions)
    }

    // call BFS 
    // get root and set level 
    let root = graphStructure.nodes[start]

    // keep track of level if needed
    if (setLevels == true) {
        root.level = count
        count += 1
    }

    // create and initialize the queue
    let queue = []
    queue.push(root)
    visited.add(root.id)
    result.nodesVisited++
    if (setPaths == true) {
        root.path = [root]
    }

    // begin loop
    while (queue.length > 0) {

        //get parent
        let parentNode = queue.shift()

        // get edges 
        let connectedEdges = graphStructure.edgemap[parentNode.id.toString()]

        for (let edge of connectedEdges) {

            // the child node is the one on the other side of the edge from the parent.
            let childNode = edge.source
            if (edge.source.id == parentNode.id) {
                childNode = edge.target
            }

            // handle edge
            if (!visited.has(edge.id)) {
                // visit edge
                visited.add(edge.id)
                result.edgesVisited++

                //set level for edges
                if (setLevels == true) {
                    edge.level = count
                }
            }

            // handle node
            if (!visited.has(childNode.id)) {
                // visit node
                visited.add(childNode.id)
                result.nodesVisited++
                queue.push(childNode)

                // set level for node
                if (setLevels == true) {
                    childNode.level = count + 1
                }
                // set parent pointer
                if (findCycleEdges == true) {
                    childNode.parent = parentNode.id
                }
                // set path for the node
                if (setPaths == true) {
                    childNode.path = [...parentNode.path, edge, childNode]
                }
                // if we found our target - return
                if (childNode.id == end) {
                    result.endFound = true
                    break
                }

            } else if (findCycleEdges == true) {
                // for the cycles algorithm, we need to identify edges that connect to a node we've visited before
                if (parentNode.parent != childNode.id) {
                    // set isCycleEdge for the nodes and edge that this is true for.
                    parentNode.isCycleEdge = true
                    edge.isCycleEdge = true
                    childNode.isCycleEdge = true
                    // collect them to be returned
                    if (!result.cycleEdges.includes(edge)) {
                        result.cycleEdges.push(edge)
                    }
                }
            }
        }
        // increment count
        if (setLevels == true) {
            count += 2
        }
        if (result.endFound == true) break
    }

    return result
}




