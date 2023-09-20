# Graph Traversal Visualizer

This project visualizes different graph algorithms in a fun, dynamic interface. 

## Description

### About the Graphs:

Random: This will generate a random, undirected, unweighted, cyclic graph with a custom number of nodes. The way this is done is it creates N number of nodes then for every node it will create one edge connecting it to a random node [0 to N-1]. It is guaranteed that the random node selected will not be itself. You can also select that all nodes will be connected, meaning then entire graph will consist of one single component.

Grid: This will generate a graph in the shape of a grid with a custom grid diameter. Every node in a row is connect to its neighbors vertically and horizontally. The grid graph always produces a single component graph.

### About the Algorithms:

Depth First Search: An algorithm for traversing a graph that uses a stack to keep track of the next nodes to visit. It begins with a root node and explores as far as possible along one branch before backtracking and exploring another branch. DFS can indicate if there exists a path from start to end, it cannot guarantee the shortest path between start and end.

Breadth First Search: An algorithm for traversing a graph that uses a queue to keep track of the next nodes to visit. It begins with a root node and explores all nodes at the current depth level before moving to the next level of nodes. BFS guarantees the shortest path between start and end. 

Component(subgraph) indentification: There are many ways to identify components. The one implemented in this project starts with a root node and uses DFS to identify all nodes directly & indirectly connected to it. When all nodes in that component have been visited, it iterate to the next unvisited node and starts over using that as the root node. 

Cycle Detection: Detecting all cycles in an undirected graph is complicated. We first use BFS to convert the graph into a spanning tree. A spanning tree is a subgraph of the graph which has the same number nodes but has as few edges a possible so that the number of components remains the same. Then it iterates through each removed edge and finds the shortest path between the nodes connected to the removed edge. This resulting set of subgraphs is called the Cycle Basis. After finding the Cycle Basis, a bit map is created where each bit represents an edge in every cycle in the cycle basis. Any cycles in the cycle basis that have common edges will then have their edges XORed and the resulting cycle is appended to the cycle basis. The resulting set of cycles includes all simple and complex cycles that exist in the graph. 

You can read more about this at these links: 
http://dspace.mit.edu/bitstream/handle/1721.1/68106/FTL_R_1982_07.pdf
https://en.wikipedia.org/wiki/Cycle_basis 

## Usage Notes:
* Visualizing DFS or BFS will begin at the start node if specified and search for the end node if specified. If no start node is specified, it will choose one at random. If no end node is specified, it will search the entire component.
* If a traversal path is found, it will animate the path from the start node to the end node.
* When visualizing Cycle Detection, it will first identify all edges that were removed to form the spanning tree. Then it will animate all cycles found.

## Technologies

Frontend written in React.
The data visualization is done with D3js.

## Authors

Clifford Chan (cpc1992)

