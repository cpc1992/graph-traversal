import * as d3 from "d3";

const width = 900;
const height = 900;

class D3Graph {
  constructor(element) {
    const vis = this;

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

    vis.color = "#8367C7";        // purple
    vis.color2 = "#FF5E5B";       // coral
    vis.color3 = '#5fb8c2'        // teal
    vis.color4 = '#E49273'        // rose gold

    vis.nodeNormalSize = 4;
    vis.nodeBlowupSize = 10;

    vis.linkGroup = vis.svg.append("g")
      .attr('id', 'link-group')
      .attr("stroke", vis.color)
      .attr("stroke-width", 1)

    vis.nodeGroup = vis.svg.append("g")
      .attr('id', 'node-group')
      .attr("stroke", "white")
      .attr("stroke-width", 1)

  }

  update(graphStructure) {
    let vis = this;

    //extract nodes and edges from the graph structure
    let structureNodes = graphStructure.nodes.map((p) => ({ ...p }));
    let structureEdges = graphStructure.edges.map((p) => ({ ...p }));

    // create simulation - pass in nodes and edges, set parameters for the link forces and node forces
    let simulation = d3
      .forceSimulation(structureNodes)
      .force(
        "link",
        d3
          .forceLink(structureEdges)
          .id((structureNode) => structureNode.id)
          .distance(30)
          .iterations(vis.iterations)
      ) // creates a link between nodes. id() tells us how to edges connect to each other... via node.id. if not used, will default to index in array
      .force("charge", d3.forceManyBody().strength(vis.strength))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // data join the links
    let graphLinks = vis.linkGroup
      .selectAll("line")
      .data(structureEdges)
      .join(
        (enter) => enter.append("line"),
        (update) => update.attr("stroke", vis.color2),
        (exit) => exit.remove());

    console.log(graphLinks)

    // data join the nodes
    let graphNodes = vis.nodeGroup
      .selectAll("circle")
      .data(structureNodes)
      .join(
        (enter) => enter.append("circle").attr("fill", vis.color).attr("r", vis.nodeNormalSize),
        (update) => update.attr('fill', vis.color3),
        (exit) => exit.remove()
      )



    // set drag on all nodes
    // graphNodes.call(
    //   d3
    //     .drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended)
    // );

    // set mouse over animations on all nodes
    graphNodes
      .on("mouseover", function (d, i) {
        d3.select(this)
          .transition()
          .duration("100")
          .attr("r", () => {
            return vis.nodeBlowupSize;
          });
      })
      .on("mouseout", function (d, i) {
        d3.select(this).transition().duration("100").attr("r", 4);
      });

    // set on tick function for all links and nodes
    simulation.on("tick", () => {
      graphLinks
        .attr("x1", (graphLink) => graphLink.source.x)
        .attr("y1", (graphLink) => graphLink.source.y)
        .attr("x2", (graphLink) => graphLink.target.x)
        .attr("y2", (graphLink) => graphLink.target.y);

      graphNodes
        .attr("cx", (graphNode) => graphNode.x)
        .attr("cy", (graphNode) => graphNode.y);
    });

    simulation.restart()

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      d3.select(this).attr("r", vis.nodeBlowupSize);
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      d3.select(this).attr("r", vis.nodeBlowupSize);
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      d3.select(this)
        .transition()
        .duration("1000")
        .attr("r", vis.nodeNormalSize);
    }
  }
}

export default D3Graph;
