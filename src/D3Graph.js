import * as d3 from "d3";

class D3Graph {
  constructor(element, graphStructure, setClicked, setStats) {
    const vis = this;

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

    vis.setClicked = setClicked
    vis.setStats = setStats

    let horizontalMultiplier = .1

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



    d3.select(element).select("svg").remove();

    vis.svg = d3
      .select(element)
      .append("svg")
      .attr("viewBox", [-vis.width / 2, -vis.height / 2, vis.width, vis.height])
      .attr("style", "overflow: visible")

    // speficications for grid graph - try making links smaller
    // vis.iterations = 20
    // vis.strength = -100

    // // specifications for random graph
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

    vis.mainColor = vis.colorArray[Math.floor(Math.random() * vis.colorArray.length)]
    vis.secondaryColor = vis.colorArray[Math.floor(Math.random() * vis.colorArray.length)]
    vis.rotateColors()

    vis.nodeNormalSize = 4;
    vis.nodeBlowupSize = 10;

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
      .force("y", d3.forceY().strength(horizontalMultiplier));



    vis.update(graphStructure)



  }

  update(graphStructure) {
    let vis = this;

    //extract nodes and edges from the graph structure
    // let structureNodes = graphStructure.nodes.map((p) => ({ ...p }));
    // let structureEdges = graphStructure.edges.map((p) => ({ ...p }));
    let structureNodes = graphStructure.nodes
    let structureEdges = graphStructure.edges

    // set simulation parameters for the link forces and node forces
    vis.simulation.nodes(structureNodes)
    vis.simulation.force('link').links(structureEdges)

    let lag = 20
    let dur = 500

    let graphLinks = vis.linkGroup
      .selectAll("line")
      .data(structureEdges).join(
        (enter) => {
          let result = enter.append('line')

          result.transition()
            .delay((d, i) => d.level * lag)
            .duration(dur)
            .attr("stroke", vis.mainColor)
            .attr("stroke-width", 1)
            .attr('id', (d, i) => `edge-${d.source.id}-${d.target.id}`)

          result.append("title").text((d, i) => `Salutations, I'm edge ${d.source.id}-${d.target.id}`)

          return result

        },
        (update) => update,
        (exit) => exit.remove(),
      );


    // data join the nodes
    let graphNodes = vis.nodeGroup
      .selectAll("circle")
      .data(structureNodes)
      .join(
        (enter) => {
          let result = enter.append("circle")

          result.transition()
            .delay((d, i) => d.level * lag)
            .duration(dur)
            .attr("fill", vis.mainColor)
            .attr("r", vis.nodeNormalSize)
            .attr('id', (d, i) => `node-${d.id}`)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr('style', 'cursor: pointer')

          result.append("title").text((d, i) => `Hii, I'm node ${i}`)

          return result
        },
        (update) => update.attr('fill', vis.mainColor),
        (exit) => exit.remove()
      )



    // set drag on all nodes
    graphNodes.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // set mouse over animations on all nodes
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
      .on("click", function (d, i) {
        // i cant get the function in graphwrapper.js to run every time the setClicked function is run. 
        // so im getting the setClicked state item to a tuple including the current DATE. 
        // this is so that the useEffect function will run every time
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

  setStart(nodeNum) {
    let vis = this

    if (nodeNum == vis.end) {
      vis.end = -1
    }


    if (vis.start !== -1) { // start is already selected

      // turn current one off
      vis.nodeGroup
        .select(`#node-${vis.start}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.start = false })

      if (nodeNum == vis.start) { // if we are clicking the same one
        // turn it off, and reset vis.start to -1

        vis.start = -1
      } else { // if we are clicking a different one
        // set the new one
        vis.nodeGroup
          .select(`#node-${nodeNum}`)
          .attr('fill', vis.startColor)
          .attr("stroke", vis.startColor)
          .attr('r', vis.nodeBlowupSize)
          .each((d) => { d.start = true })

        vis.start = nodeNum
      }
    } else { // no start is clicked yet
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
  setEnd(nodeNum) {

    let vis = this
    if (nodeNum == vis.start) {
      vis.start = -1
    }

    if (vis.end !== -1) { // start is already selected
      // turn current one off
      vis.nodeGroup
        .select(`#node-${vis.end}`)
        .attr('fill', vis.mainColor)
        .attr("stroke", "white")
        .transition()
        .duration(vis.shrinkDuration)
        .attr('r', vis.nodeNormalSize)
        .each((d) => { d.end = false })

      if (nodeNum == vis.end) { // if we are clicking the same one
        // turn it off, and reset vis.start to -1
        vis.end = -1
      } else { // if we are clicking a different one
        // set the new one
        vis.nodeGroup
          .select(`#node-${nodeNum}`)
          .attr('fill', vis.endColor)
          .attr('stroke', vis.endColor)
          .attr('r', vis.nodeBlowupSize)
          .each((d) => { d.end = true })

        vis.end = nodeNum
      }
    } else { // no start is clicked yet
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

  // multipath is for DAC algorithm to show multiple cycle paths
  visualize(algorithm, resultObj) {

    let vis = this
    let duration = 175
    let lag = 10


    //clear the old info 
    if (algorithm == 'idc') {

      //for identifying components, dissappear the nodes and links. interrupt transitons
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
    // get the number of nodes that are being animated - used for coloring different components
    let numVisitedNodes = vis.nodeGroup
      .selectAll('circle')
      .filter((d) => d.level != -1)
      .size()

    // animate links for visualization 
    vis.linkGroup
      .selectAll('line')
      .filter((d) => d.level != -1)
      .transition() // transition to active yellow
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('stroke', 'yellow')
      .attr("stroke-width", 2)
      .transition()
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



    // anime nodes for visualization
    vis.nodeGroup
      .selectAll('circle')
      .filter((d) => d.level != -1)
      .transition() // transition to active yellow
      .delay((d) => lag * d.level)
      .duration(duration)
      .attr('fill', 'yellow')
      .attr('r', vis.nodeBlowupSize)
      .transition() // transiton back to secondary color
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
        count += 1
        // After the last transition call this code
        if (count == numVisitedNodes) {
          let statArray = []

          vis.applyMouseOptions()

          if (algorithm == 'dfs') {
            statArray.push(`Algorithm: Depth First Search`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            if (resultObj.endFound == true) {
              statArray.push(`End node was found`)
              statArray.push(`First path from Start to End: ${(data.path.length + 1) / 2} nodes`)
            } else {
              statArray.push(`End node was not found.`)
            }
            vis.setStats(statArray)

            if (data.end == true) {
              vis.animateBestPath(data.path)
            }

          } else if (algorithm == 'bfs') {
            statArray.push(`Algorithm: Breadth First Search`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            if (resultObj.endFound == true) {
              statArray.push(`End node was found`)
              statArray.push(`Shortest path from Start to End: ${(data.path.length + 1) / 2} nodes`)
            } else {
              statArray.push(`End node was not found.`)
            }
            vis.setStats(statArray)

            if (data.end == true) {
              vis.animateBestPath(data.path)
            }

          } else if (algorithm == 'idc') {
            statArray.push(`Algorithm: Identify Subgraphs`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            statArray.push(`Number of Subgraphs: ${resultObj.numSubGraphs}`)
            vis.setStats(statArray)
          } else if (algorithm == 'dac') {
            for (let path of resultObj.cycles) {
              vis.animateBestPath(path)
            }
            statArray.push(`Algorithm: Detect All Cycles`)
            statArray.push(`Nodes visited: ${resultObj.nodesVisited}`)
            statArray.push(`Cycles detected: ${resultObj.numCycles}`)
            vis.setStats(statArray)

          }
        }
      })


    // rotate the colors
    vis.rotateColors()

  }

  animateBestPath(pathArray) {
    let vis = this
    let lag = 10
    let duration = 100
    vis.linkGroup
      .selectAll('line')
      .each((d, i) => d.level = -1)

    vis.nodeGroup
      .selectAll('circle')
      .each((d, i) => d.level = -1)

    for (let i = 0; i < pathArray.length; i++) {
      pathArray[i].level = i
    }

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
    // .attr("stroke-width", 1)

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
      // .attr('fill', (d) => d.start ? vis.startColor : d.end ? vis.endColor : vis.secondary)
      .attr('r', (d) => d.end ? vis.nodeBlowupSize : d.start ? vis.nodeBlowupSize : vis.nodeNormalSize);




  }
  removeMouseOptions() {
    let vis = this
    vis.nodeGroup
      .selectAll('circle')
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null)
  }

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
        // i cant get the function in graphwrapper.js to run every time the setClicked function is run. 
        // so im getting the setClicked state item to a tuple including the current DATE. 
        // this is so that the useEffect function will run every time
        d3.select(this).attr("r", () => vis.nodeBlowupSize).each((node) => {
          vis.setClicked([node.id, Date.now()])
        })
      })
  }


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

    let randIndex = Math.floor(Math.random() * options.length)
    vis.secondaryColor = vis.colorArray[options[randIndex]]

  }
}

export default D3Graph;
