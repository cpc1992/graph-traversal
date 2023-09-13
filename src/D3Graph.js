import * as d3 from "d3";

class D3Graph {
  constructor(element, graphStructure, setClicked, setStats) {
    const vis = this;
    // set properties
    vis.height = 1000
    vis.width = 1000

    vis.start = -1
    vis.end = -1

    vis.startColor = '#32CD32'
    vis.endColor = '#FF0000'

    vis.numNodes = graphStructure.nodes.length
    vis.numEdges = graphStructure.edges.length

    vis.BlowupDuration = 100
    vis.shrinkDuration = 1000
    vis.nodeBlowupSize = 10;
    vis.nodeNormalSize = 4;

    vis.setClicked = setClicked
    vis.setStats = setStats

    vis.iterations = 30;
    vis.strength = -50;

    vis.colorArray = [
      "#FF5E5B",     // coral red
      '#5fb8c2',     // teal
      '#E49273',     // rose gold
      "#8367C7",     // purple
      '#7C9299',    // grey 
      '#0075ff',     // steel blue
      '#40F99B',     // lime green
      '#F61067'      // hot pink
    ]

    // choose random starting colors
    vis.mainColor = vis.colorArray[Math.floor(Math.random() * vis.colorArray.length)]
    vis.secondaryColor = vis.colorArray[Math.floor(Math.random() * vis.colorArray.length)]
    vis.rotateColors()

    // zoom out as needed when there are more nodes 
    if (vis.numNodes < 100) {
      vis.height = 500
    } else if (vis.numNodes < 200) {
      vis.height = 600
    } else if (vis.numNodes < 300) {
      vis.height = 700
    } else if (vis.numNodes < 400) {
      vis.height = 800
    } else if (vis.numNodes < 500) {
      vis.height = 900
    } else if (vis.numNodes < 600) {
      vis.height = 1000
    } else if (vis.numNodes < 700) {
      vis.height = 1100
    } else if (vis.numNodes < 800) {
      vis.height = 1200
    } else if (vis.numNodes < 900) {
      vis.height = 1250
    } else {
      vis.height = 1400
    }
    vis.width = vis.height * 1.25

    // remove any existing SVG on the screen
    d3.select(element).select("svg").remove();

    // create new SVG
    vis.svg = d3
      .select(element)
      .append("svg")
      .attr("viewBox", [-vis.width / 2, -vis.height / 2, vis.width, vis.height])
      .attr("style", "overflow: visible")

    // create groups for links and nodes
    vis.linkGroup = vis.svg.append("g")
      .attr('id', 'link-group')
    vis.nodeGroup = vis.svg.append("g")
      .attr('id', 'node-group')

    // create simulation - pass in nodes and edges, set parameters for the link forces and node forces
    vis.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((structureNode) => structureNode.id)
          .distance(30)
          .iterations(vis.iterations)
      ) // creates a link between nodes. id() tells us how the edges connect to each other... via node.id. if not used, will default to index in array
      .force("charge", d3.forceManyBody().strength(vis.strength))
      .force("x", d3.forceX())
      .force("y", d3.forceY().strength(.1));

    // call update to append the actual graph
    vis.update(graphStructure)
  }

  update(graphStructure) {
    let vis = this;

    // graph the nodes and edges
    let structureNodes = graphStructure.nodes
    let structureEdges = graphStructure.edges

    // append the nodes and edges to the force simulation
    vis.simulation.nodes(structureNodes)
    vis.simulation.force('link').links(structureEdges)

    let lag = 20
    let dur = 500

    // join the links to the screen and transition in
    let graphLinks = vis.linkGroup
      .selectAll("line")
      .data(structureEdges).join(
        (enter) => {
          let result = enter.append('line')
            .attr('id', (d, i) => `edge-${d.source.id}-${d.target.id}`)
          // transition in the links
          result.transition()
            .delay((d, i) => d.level * lag)
            .duration(dur)
            .attr("stroke", vis.mainColor)
            .attr("stroke-width", 1)

          // append title in a separate step
          result.append("title").text((d, i) => `Salutations, I'm edge ${d.source.id}-${d.target.id}`)
          return result
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    // join the nodes to the screen and transition in
    let graphNodes = vis.nodeGroup
      .selectAll("circle")
      .data(structureNodes)
      .join(
        (enter) => {
          let result = enter.append("circle")
            .attr('id', (d, i) => `node-${d.id}`)
          // transition in the nodes
          result.transition()
            .delay((d, i) => d.level * lag)
            .duration(dur)
            .attr("fill", vis.mainColor)
            .attr("r", vis.nodeNormalSize)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr('style', 'cursor: pointer')
          // append title in a separate step
          result.append("title").text((d, i) => `Hii, I'm node ${i}`)
          return result
        },
        (update) => update.attr('fill', vis.mainColor),
        (exit) => exit.remove()
      )

    // set drag on all nodes
    // drag functions are at the bottom 
    graphNodes.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // set mouse over animations on all nodes. 
    // Blow up the node on hover and shrink on mouse out.
    graphNodes
      .on("mouseover", function (d, i) {
        d3.select(this)
          .transition()
          .duration(vis.BlowupDuration)
          .attr("r", () => vis.nodeBlowupSize)
      })
      .on("mouseout", function (d, i) {

        d3.select(this)
          .transition()
          .duration(vis.shrinkDuration)
          .attr("r", (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize);
      })
      .on("click", function (d, i) { // set onclick for each node
        // When you click on the SAME node twice, the node id is the same and does not cause the useEffect in graphwrapper.jsx to run.
        // so im setting the setClicked state item to a tuple including the current DATE: [node.id, Date()]
        // now, every click will alter the 'clicked' state item and call the useEffect function
        d3.select(this).attr("r", () => vis.nodeBlowupSize).each((node) => {
          vis.setClicked([node.id, Date.now()])
        })
      })

    // set on tick function for all links and nodes
    vis.simulation.on("tick", () => {
      graphLinks
        .attr("x1", (graphLink) => graphLink.source.x)
        .attr("y1", (graphLink) => graphLink.source.y)
        .attr("x2", (graphLink) => graphLink.target.x)
        .attr("y2", (graphLink) => graphLink.target.y);
      graphNodes
        .attr("cx", (graphNode) => graphNode.x)
        .attr("cy", (graphNode) => graphNode.y);
    });

    // heat up the graph for 5 seconds on load. This helps untangle the graph. + it looks cool!
    vis.simulation.alphaTarget(1)
    setTimeout(() => { vis.simulation.alphaTarget(0) }, 5000)

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) vis.simulation.alphaTarget(1).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) vis.simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }

  // sets the start node color to green and keeps it blown up on the screen
  setStart(nodeNum) {
    let vis = this
    // if the user chose the end node, turn convert it to the start node
    if (nodeNum == vis.end) {
      vis.end = -1
    }

    // if a start is already selected
    if (vis.start !== -1) {
      // turn current one off
      vis.nodeGroup
        .select(`#node-${vis.start}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.start = false })

      // if we are clicking the same one
      if (nodeNum == vis.start) {
        // turn it off, and reset vis.start to -1

        vis.start = -1
      } else {
        // if we are clicking a different one
        // set the new one
        vis.nodeGroup
          .select(`#node-${nodeNum}`)
          .attr('fill', vis.startColor)
          .attr("stroke", vis.startColor)
          .attr('r', vis.nodeBlowupSize)
          .each((d) => { d.start = true })
        vis.start = nodeNum
      }
    } else {
      // no start is clicked yet
      // set the one were clicking to green and set vis.start
      vis.nodeGroup
        .select(`#node-${nodeNum}`)
        .attr('fill', vis.startColor)
        .attr("stroke", vis.startColor)
        .attr('r', vis.nodeBlowupSize)
        .each((d) => { d.start = true })
      vis.start = nodeNum
    }
  }

  // set the end node color to red and keep it blown up on the screen
  setEnd(nodeNum) {
    let vis = this
    // if the one they selected is a start node, turn it off.
    if (nodeNum == vis.start) {
      vis.start = -1
    }

    // start is already selected
    if (vis.end !== -1) {
      // turn current one off
      vis.nodeGroup
        .select(`#node-${vis.end}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.end = false })

      // if we are clicking the same one
      if (nodeNum == vis.end) {
        // turn it off, and reset vis.start to -1
        vis.end = -1
      } else {
        // if we are clicking a different one
        // set the new one
        vis.nodeGroup
          .select(`#node-${nodeNum}`)
          .attr('fill', vis.endColor)
          .attr('stroke', vis.endColor)
          .attr('r', vis.nodeBlowupSize)
          .each((d) => { d.end = true })
        vis.end = nodeNum
      }
    } else {
      // no start is clicked yet
      // set the one were clicking to red and set vis.end
      vis.nodeGroup
        .select(`#node-${nodeNum}`)
        .attr('fill', vis.endColor)
        .attr('stroke', vis.endColor)
        .attr('r', vis.nodeBlowupSize)
        .each((d) => { d.end = true })
      vis.end = nodeNum
    }
  }

  // clear both start and end. this is used when an algorithm that does not use a start or end is called.
  clearStartEnd() {
    let vis = this
    if (vis.start != -1) {
      vis.nodeGroup
        .select(`#node-${vis.start}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.start = false })

    }

    if (vis.end != -1) {
      vis.nodeGroup
        .select(`#node-${vis.end}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.end = false })
    }

    vis.start = -1
    vis.end = -1
  }

  // visualize function for all algorithms
  visualize(algorithm, resultObj) {

    let vis = this
    let duration = 175
    let lag = 10

    //clear whatever is happening on the screen right now
    if (algorithm == 'idc') {

      //for identifying components, interrupt transitons and make all the nodes and links dissappear... spooky!
      vis.linkGroup
        .selectAll('line')
        .interrupt()
        .transition()
        .duration(2000)
        .attr('stroke', '#011632')
        .attr("stroke-width", 1)

      vis.nodeGroup
        .selectAll('circle')
        .interrupt()
        .transition()
        .duration(2000)
        .attr('fill', '#011632')
        .attr('r', (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize)
        .attr("stroke", '#011632');

    } else {
      //if we are switching to a search algorithm, just fade everything into the secondary color
      vis.linkGroup
        .selectAll('line')
        .transition()
        .duration(2000)
        .attr('stroke', vis.mainColor)
        .attr("stroke-width", 1)

      vis.nodeGroup
        .selectAll('circle')
        .transition()
        .duration(2000)
        .attr('fill', (d) => d.start ? vis.startColor : d.end ? vis.endColor : vis.mainColor)
        .attr('r', (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize)
        .attr("stroke", 'white')
        .attr("stroke-width", 1);
    }

    // heat up the graph for 1 second when you run an algorithm. just for fun!
    vis.simulation.alphaTarget(1)
    setTimeout(() => { vis.simulation.alphaTarget(0) }, 500)

    // turn off mouse options on all circles
    vis.nodeGroup
      .selectAll('circle')
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null)

    // choose a random color and set a count variable - used for coloring different components
    let colorRandomizer = Math.floor(Math.random() * 25)
    let count = 0

    // Keep track of the number of nodes that we are animating
    let numVisitedNodes = vis.nodeGroup
      .selectAll('circle')
      .filter((d) => d.level != -1)
      .size()

    // animate links according to the link.level property
    vis.linkGroup
      .selectAll('line')
      .filter((d) => d.level != -1)
      .transition() // transition to active yellow
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('stroke', 'yellow')
      .attr("stroke-width", 2)
      .transition() // transition back
      .delay(200)
      .duration(duration)
      .attr('stroke', (d) => {
        if (algorithm == 'idc') {
          return vis.colorArray[(colorRandomizer + d.componentColor) % vis.colorArray.length]
        } else if (algorithm == 'dac' && d.isCycleEdge == true) {
          return 'yellow'
        } else {
          return vis.secondaryColor
        }
      })
      .attr("stroke-width", 1)



    // anime nodes accoridng to node.level property
    vis.nodeGroup
      .selectAll('circle')
      .filter((d) => d.level != -1)
      .transition() // transition to active yellow
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('fill', 'yellow')
      .attr('r', vis.nodeBlowupSize)
      .transition() // transiton back 
      .delay(200)
      .duration(duration)
      .attr('fill', (d) => {
        if (d.start == true) {
          return vis.startColor
        } else if (d.end == true) {
          return vis.endColor
        } else if (algorithm == 'idc') {
          vis.secondaryColor = vis.colorArray[colorRandomizer % vis.colorArray.length]
          return vis.colorArray[(colorRandomizer + d.componentColor) % vis.colorArray.length]
        } else if (algorithm == 'dac' && d.isCycleEdge == true) {
          return 'yellow'
        }
        else {
          return vis.secondaryColor
        }
      })
      .attr('r', (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize)
      .attr("stroke", 'white')
      .attr("stroke-width", 1)
      .on('end', (data, i) => {
        // This function will be run at the end of every node's transition. 
        // keep count of how many we have animated
        count += 1
        // count == numVisitedNodes then we have FINISHED ALL ANIMATIONS
        if (count == numVisitedNodes) {
          let statArray = []
          // reapply mouse options
          vis.applyMouseOptions()
          // call secondary animations for each algorithm and set the statistics for every run
          if (algorithm == 'dfs') {
            statArray.push(`Algorithm: Depth First Search`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            if (resultObj.endFound == true) {
              statArray.push(`End node was found!`)
              statArray.push(`First path from Start to End: ${(data.path.length + 1) / 2} nodes`)
            } else {
              statArray.push(`End node was not found.`)
            }
            vis.setStats(statArray)
            // animate the path found from DFS 
            if (data.end == true) {
              vis.animateBestPath(data.path)
            }
          } else if (algorithm == 'bfs') {
            statArray.push(`Algorithm: Breadth First Search`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            if (resultObj.endFound == true) {
              statArray.push(`End node was found!`)
              statArray.push(`Shortest path from Start to End: ${(data.path.length + 1) / 2} nodes`)
            } else {
              statArray.push(`End node was not found.`)
            }
            vis.setStats(statArray)
            // animate the shortest path found from BFS
            if (data.end == true) {
              vis.animateBestPath(data.path)
            }
          } else if (algorithm == 'idc') {
            statArray.push(`Algorithm: Identify Subgraphs`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            statArray.push(`Number of Subgraphs: ${resultObj.numSubGraphs}`)
            vis.setStats(statArray)
          } else if (algorithm == 'dac') {
            statArray.push(`Algorithm: Detect All Cycles`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            statArray.push(`Cycles detected: ${resultObj.numCycles}`)
            vis.setStats(statArray)
            // for detecting cycles, there will be multiple cycles to animate
            for (let path of resultObj.cycles) {
              vis.animateBestPath(path)
            }
          }
        }
      })

    // rotate the colors
    vis.rotateColors()

  }

  // after the main visualization is done for every algorithm, we might want to do a final animation
  // this is to show the best path or display all found cycles.
  // this function expects an array of nodes/edges. it will set the level on each one to +1, then color them based on the level.
  animateBestPath(pathArray) {
    let vis = this
    let lag = 10
    let duration = 100

    // remove all current levels 
    vis.linkGroup
      .selectAll('line')
      .each((d, i) => d.level = -1)
    vis.nodeGroup
      .selectAll('circle')
      .each((d, i) => d.level = -1)

    // set the level property for only the path that was passed in
    for (let i = 0; i < pathArray.length; i++) {
      pathArray[i].level = i
    }

    // call the animation 
    vis.linkGroup
      .selectAll('line')
      .filter((d) => d.level != -1)
      .transition()
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('stroke', 'yellow')
      .attr("stroke-width", 2)
      .transition()
      .delay(200)
      .duration(duration)

    vis.nodeGroup
      .selectAll('circle')
      .filter((d) => d.level != -1)
      .transition()
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('fill', (d) => d.start ? vis.startColor : d.end ? vis.endColor : 'yellow')
      .attr('r', vis.nodeBlowupSize)
      .transition()
      .delay(200)
      .duration(duration)
      .attr('r', (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize);
  }

  // remove mouse options while animation is happening. 
  // mouse animations will cancel the currently occuring animations
  removeMouseOptions() {
    let vis = this
    vis.nodeGroup
      .selectAll('circle')
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null)
  }

  // reapply the mouse options after animation is complete
  applyMouseOptions() {
    let vis = this
    vis.nodeGroup
      .selectAll('circle')
      .on("mouseover", function (d, i) {
        d3.select(this)
          .transition()
          .duration(vis.BlowupDuration)
          .attr("r", () => vis.nodeBlowupSize)
          .attr('style', 'cursor: pointer')
      })
      .on("mouseout", function (d, i) {
        d3.select(this)
          .transition()
          .duration(vis.shrinkDuration)
          .attr("r", (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize);

      })
      .on("click", function (d, i) {
        d3.select(this).attr("r", () => vis.nodeBlowupSize).each((node) => {
          vis.setClicked([node.id, Date.now()])
        })
      })
  }

  // keeps a map of which colors "play" nice with each other. 
  // only colors that have strong contrast will transition into each other.
  rotateColors() {

    // 0  "#FF5E5B",     // coral red 
    // 1  '#5fb8c2',     // teal
    // 2  '#E49273',     // rose gold
    // 3  "#8367C7",     // purple
    // 4  '#F9F5FF',     // grey 
    // 5  '#6369D1',     // opal blue
    // 6  '#40F99B',     // lime green
    // 7  '#F61067'      // hot pink

    let vis = this
    let options

    // rotate secondary color into the main color
    vis.mainColor = vis.secondaryColor
    switch (vis.mainColor) {
      case vis.colorArray[0]: // coral 
        options = [1, 3, 4, 5, 6]
        break
      case vis.colorArray[1]: // teal 
        options = [0, 2, 3, 7]
        break
      case vis.colorArray[2]: // rose gold 
        options = [1, 3, 5, 6]
        break
      case vis.colorArray[3]: // purple
        options = [0, 1, 2, 6, 7]
        break
      case vis.colorArray[4]: // grey
        options = [0, 5, 6, 7]
        break
      case vis.colorArray[5]: // steel blue
        options = [0, 2, 4, 6, 7]
        break
      case vis.colorArray[6]: // lime green
        options = [0, 2, 3, 4, 5, 7]
        break
      case vis.colorArray[7]: // hot pink 
        options = [1, 3, 4, 5, 6]
        break
    }

    // choose a safe new secondary based on the new main color
    let randIndex = Math.floor(Math.random() * options.length)
    vis.secondaryColor = vis.colorArray[options[randIndex]]
  }
}

export default D3Graph;
