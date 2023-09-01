import * as d3 from 'd3';

const url_men = 'https://udemy-react-d3.firebaseio.com/tallest_men.json'
const url_women = 'https://udemy-react-d3.firebaseio.com/tallest_women.json'
const margin = { top: 50, bottom: 50, right: 50, left: 50 }
const width = 800 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

class D3Chart {
    constructor(element) {
        const vis = this
        vis.svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.left})`)


        vis.title = vis.svg
            .append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')





        vis.svg.append('text')
            .attr('x', -height / 2)
            .attr('y', -35)
            .text("Height in cm")
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')

        vis.leftAxisGroup = vis.svg.append('g')

        vis.bottomAxisGroup = vis.svg.append('g')
            .attr('transform', `translate(0, ${height})`)


        /* this is calling a real api to get the data */
        // Promise.allSettled([
        //     d3.json(url_men),
        //     d3.json(url_women)
        // ]).then(dataset => {
        //     let [men, women] = dataset

        //     men.value.push({name: 'Clifford', height: 167})
        //     women.value.push({name: 'Liese', height: 167})

        //     vis.men_data = men.value
        //     vis.women_data = women.value
        //     vis.update('men')

        // })

        vis.men_data = [{ name: 'a', height: 50 },
        { name: 'b', height: 60 },
        { name: 'c', height: 70 },
        { name: 'd', height: 80 },
        { name: 'e', height: 90 }]

        vis.women_data = [{ name: 'm', height: 90 },
        { name: 'n', height: 150 },
        { name: 'l', height: 20 },
        { name: 'b', height: 10 },
        { name: 'q', height: 50 },
        { name: 'z', height: 100 }]

        vis.update('men')

    }

    update(data) {
        let vis = this
        if (data == 'men') {
            vis.data = vis.men_data
        } else {
            vis.data = vis.women_data
        }


        // create scales based on the data max height and the number of data points
        let x = d3.scaleBand()
            .domain(vis.data.map(p => p.name))
            .range([0, width])
            .padding(0.4)

        let y = d3.scaleLinear()
            .domain([d3.min(vis.data, p => p.height) - 100, d3.max(vis.data, p => p.height)])
            .range([height, 0])

        // create the left and bottom axis from the scales and append to the svg with call()
        let leftAxis = d3.axisLeft(y)

        vis.leftAxisGroup
            .transition()
            .duration(500)
            .call(leftAxis)

        let bottomAxis = d3.axisBottom(x)

        vis.bottomAxisGroup
            .transition()
            .duration(500)
            .call(bottomAxis)

        vis.title
            .transition()
            .duration(5000)
            .style("font-size", '40px')
            .transition()
            .duration(250)
            .style("font-size", '18px')
            .text(data == 'men' ? 'Worlds Tallest Men' : 'Worlds Tallest Women')

        // .transition()
        // .duration(250)
        // .style("font-size","16px");

        // select all rectangles in the SVG and join the data
        let selection = vis.svg.selectAll('rect')
            .data(vis.data, p => p.name)

        // remove all old data points
        selection.exit()
            .transition()
            .delay((d, i) => i * 100)
            .duration(500)
            .attr('height', 0)
            .attr('y', height)
            .remove()

        // update()
        selection.attr('fill', 'blue')
            .transition()
            .duration(500)
            .attr('x', p => x(p.name))
            .attr('height', p => height - y(p.height))
            .attr('y', p => y(p.height) - 1)

        // append new rectangles for every new data point in enter()    
        selection.enter()
            .append('rect')
            .attr('x', p => x(p.name))
            .attr('y', height)
            .attr('fill', p => {
                if (parseFloat(p.height) > 260) {
                    return 'green'
                } else {
                    return 'red'
                }
            })
            .attr('width', x.bandwidth())
            .attr('height', p => 0)
            .transition()
            .delay((d, i) => i * 100)
            .duration(500)
            .attr('y', p => y(p.height) - 1)
            .attr('height', p => height - y(p.height))



    }

}

export default D3Chart;



// This code is used to dynamically add and remove nodes. i scrapped it tho

  // } else {
  //   //clone existing graph into new graph - because we dont want to mutate the existing state graph
  //   for (let i = 0; i < existingGraph.nodes.length; i++) {
  //     let node = existingGraph.nodes[i];
  //     newGraph.nodes.push({ id: node.id });
  //   }

  //   for (let i = 0; i < existingGraph.edges.length; i++) {
  //     let edge = existingGraph.edges[i];
  //     newGraph.edges.push({ source: edge.source, target: edge.target });
  //   }

  //   let numNodesInGraph = newGraph.nodes.length;
  //   let difference = numNodes - numNodesInGraph;

  //   let newNodeId = 0;
  //   let removeSet = new Set();

  //   if (difference > 0) {
  //     for (let i = 0; i < difference; i++) {
  //       newNodeId = numNodesInGraph + i;
  //       // add nodes and links
  //       newGraph.nodes.push({ id: newNodeId });

  //       let randomTarget = Math.floor(Math.random() * numNodes);
  //       while (randomTarget == i) {
  //         randomTarget = Math.floor(Math.random() * numNodes);
  //       }
  //       newGraph.edges.push({ source: newNodeId, target: randomTarget });
  //     }
  //   } else if (difference < 0) {
  //     // gather a set of all burned node IDs
  //     for (let i = 0; i > difference; i--) {
  //       removeSet.add(newGraph.nodes.pop().id);
  //     }
  //     // filter all edges who have a source OR target in the set of burned nodes
  //     newGraph.edges = newGraph.edges.filter((edge) => {
  //       if (removeSet.has(edge.source) || removeSet.has(edge.target)) {
  //         return false;
  //       }
  //       return true;
  //     });
  //   }

  //   return newGraph;
  // }