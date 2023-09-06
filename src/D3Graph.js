import * as d3 from "d3";

let width = 1500;
let height = 1500;
// const width = 900;
// const height = 900;

class D3Graph {
  constructor(element, graphStructure, setClicked) {
    const vis = this;

    vis.start = -1
    vis.end = -1

    vis.startColor = '#32CD32'
    vis.endColor = '#FF0000'

    vis.numNodes = graphStructure.nodes.length
    vis.numEdges = graphStructure.edges.length

    vis.BlowupDuration = 100
    vis.shrinkDuration = 1000



    vis.setClicked = setClicked

    let horizontalMultiplier = .1

    if (vis.numNodes < 100) {
      height = 500
    } else if (vis.numNodes < 200) {
      height = 600
    } else if (vis.numNodes < 300) {
      height = 700
    } else if (vis.numNodes < 400) {
      height = 800
    } else if (vis.numNodes < 500) {
      height = 900
    } else if (vis.numNodes < 600) {
      height = 1000
    } else if (vis.numNodes < 700) {
      height = 1100
    } else if (vis.numNodes < 800) {
      height = 1200
    } else if (vis.numNodes < 900) {
      height = 1250
    } else {
      height = 1400
    }
    width = height * 1.25



    d3.select(element).select("svg").remove();

    vis.svg = d3
      .select(element)
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      // .attr("viewBox", [0,0, width*zoom, height*zoom])
      .attr("style", "overflow: visible")

    // speficications for grid graph - try making links smaller
    // let iterations = 20
    // let strength = -100

    // specifications for random graph
    vis.iterations = 30;
    vis.strength = -50;



    vis.color1 = "#FF5E5B";       // coral red
    vis.color2 = '#5fb8c2'        // teal
    vis.color3 = "#8367C7";        // purple
    vis.color4 = '#E49273'        // rose gold

    vis.main = vis.color3
    vis.secondary = vis.color2
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
            .attr("stroke", vis.main)
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
            .attr("fill", vis.main)
            .attr("r", vis.nodeNormalSize)
            .attr('id', (d, i) => `node-${d.id}`)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr('style', 'cursor: pointer')

          result.append("title").text((d, i) => `Hii, I'm node ${i}`)

          return result
        },
        (update) => update.attr('fill', vis.main),
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

        d3.select(this).transition().duration(vis.shrinkDuration).attr("r", vis.nodeNormalSize);
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
        .attr('fill', vis.main)
        .attr("stroke", "white")
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
          .each((d) => { d.start = true })

        vis.start = nodeNum
      }
    } else { // no start is clicked yet
      // set the one were clicking to green and set vis.start
      vis.nodeGroup
        .select(`#node-${nodeNum}`)
        .attr('fill', vis.startColor)
        .attr("stroke", vis.startColor)
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
        .attr('fill', vis.main)
        .attr("stroke", "white")
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
          .each((d) => { d.end = true })

        vis.end = nodeNum
      }
    } else { // no start is clicked yet
      // set the one were clicking to green and set vis.start
      vis.nodeGroup
        .select(`#node-${nodeNum}`)
        .attr('fill', vis.endColor)
        .attr('stroke', vis.endColor)
        .each((d) => { d.end = true })
      vis.end = nodeNum

    }

  }

  clearStartEnd() {
    let vis = this
    if (vis.start != -1) {
      vis.nodeGroup
        .select(`#node-${vis.start}`)
        .attr('fill', vis.main)
        .attr("stroke", "white")
    }

    if (vis.end != -1) {

      vis.nodeGroup
        .select(`#node-${vis.end}`)
        .attr('fill', vis.main)
        .attr("stroke", "white")
    }

    vis.start = -1
    vis.end = -1

  }

  visualize() {
    let vis = this

    vis.nodeGroup
      .selectAll('circle')
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null)

    let duration = 175
    let lag = 10


    vis.linkGroup
      .selectAll('line')
      .transition()
      .delay((d, i) => lag * d.level)
      .duration(duration)
      .attr('stroke', 'yellow')
      .attr("stroke-width", 2)
      .transition()
      .delay(200)
      .duration(duration)
      .attr('stroke', vis.secondary)
      .attr("stroke-width", 1)

    vis.nodeGroup
      .selectAll('circle')
      .transition()
      .delay((d, i) => lag * d.level)
      .duration(duration)
      .attr('fill', 'yellow')
      .attr('r', vis.nodeBlowupSize)
      .transition()
      .delay(200)
      .duration(duration)
      .attr('fill', (d, i) => d.start ? vis.startColor : d.end ? vis.endColor : vis.secondary)
      .attr('r', vis.nodeNormalSize)



    setTimeout(() => {
      console.log('done boii')
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
          d3.select(this).transition().duration(vis.shrinkDuration).attr("r", vis.nodeNormalSize);
        })
        .on("click", function (d, i) {
          // i cant get the function in graphwrapper.js to run every time the setClicked function is run. 
          // so im getting the setClicked state item to a tuple including the current DATE. 
          // this is so that the useEffect function will run every time
          d3.select(this).attr("r", () => vis.nodeBlowupSize).each((node) => {
            vis.setClicked([node.id, Date.now()])
          })
        })

      vis.rotateColors()


    }, lag * (vis.numNodes + vis.numEdges))


  }

  rotateColors() {
    let vis = this
    let options
    vis.main = vis.secondary
    switch (vis.main) {
      case vis.color1: // coral - teal, purple
        options = [vis.color2, vis.color3]
        break
      case vis.color2: // teal - anything 
        options = [vis.color1, vis.color3, vis.color4]
        break
      case vis.color3: // purple - anything 
        options = [vis.color1, vis.color2, vis.color4]
        break
      case vis.color4: // rose gold - teal, purple 
        options = [vis.color2, vis.color3]
        break
    }

    let randIndex = Math.floor(Math.random() * options.length)
    vis.secondary = options[randIndex]

  }
}

export default D3Graph;
