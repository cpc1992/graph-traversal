import * as d3 from 'd3';


const margin = {top: 50, bottom: 50, right: 50, left: 50}
const width = 1000 - margin.left - margin.right
const height = 900 - margin.top - margin.bottom

class D3Graph{
    constructor(element){
        const vis = this

        // graph generator
        let numNodes = 350
        let maxConnections = 1
        
        let randomDataset = {nodes: [], edges: []}
        for (let i = 0; i < numNodes; i++){
            let nodeObj = {id: i}
            randomDataset.nodes.push(nodeObj)

            let connections = maxConnections
            for (let j = 0; j < connections; j++){
                let randomTarget = Math.floor(Math.random() * numNodes)
                while (randomTarget == j){
                    randomTarget = Math.floor(Math.random() * numNodes)
                }
                let edgeObj = {source: i, target: randomTarget}
                randomDataset.edges.push(edgeObj)
            }


        }
        


        let num_rows = 15
        let num_cols = 15

        // let grid = new Array(num_rows)
        // for (let i = 0; i < num_rows; i++){
        //     grid[i] = new Array(num_cols)
        // }

        let gridDataset = {nodes: [], edges: []}

        
        for(let r = 0; r < num_rows; r++){
            for(let c = 0; c < num_cols; c++){
                gridDataset.nodes.push({id: `${r}-${c}`})
                // up 
                if (r > 0){
                    gridDataset.edges.push({source: `${r}-${c}`, target: `${r-1}-${c}`})
                }
                // down
                if (r < num_rows - 1){
                    gridDataset.edges.push({source: `${r}-${c}`, target: `${r+1}-${c}`})
                }

                // left
                if (c > 0){
                    gridDataset.edges.push({source: `${r}-${c}`, target: `${r}-${c-1}`})
                }

                //right
                if (c < num_cols - 1){
                    gridDataset.edges.push({source: `${r}-${c}`, target: `${r}-${c+1}`})
                }
            }
            
        }



        let displayDataset = gridDataset
        // displayDataset = randomDataset
       
        
        let nodes = displayDataset.nodes.map(p => ({...p}))
        let edges = displayDataset.edges.map(p => ({...p}))
        
        let zoom = 1.2
        let svg = d3.select(element)
            .append('svg')
            // .attr('width', width + margin.right + margin.left)
            // .attr('height', height + margin.top + margin.bottom)
            .attr("viewBox", [-(width - margin.right - margin.left)*zoom / 2, -(height-margin.top-margin.bottom)*zoom / 2, width*zoom, height*zoom])

            .attr('style', 'background-color: grey')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.left})`)

        
        let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(node => node.id).distance(30).iterations(17)) // creates a link between nodes. id() tells us how to edges connect to each other... via node.id. if not used, will default to index in array
        .force("charge", d3.forceManyBody().strength(-60))
        .force("x", d3.forceX())
        .force("y", d3.forceY());
            
        let link = svg.append('g')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .selectAll('line')
            .data(edges)
            .join('line')
        
        link.append('title')
            .text((d, i) => `Salutations, I'm edge ${i}`)        
        let node = svg.append('g')
            .attr('stroke', 'teal')
            .attr('stroke-width', 1)
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', 7)
            .attr('fill', 'black')
        
        node.append('title')
            .text((p,i) => `Hii I'm node ${i} (:`)
        
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // Reheat the simulation when drag starts, and fix the subject position.
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
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
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

    }

    update(){
        let vis = this
        
        
        // select all rectangles in the SVG and join the data
        let selection = vis.svg.selectAll('rect')
            .data(vis.data, p => p.name)
        
        // remove all old data points
        selection.exit()
        .transition()
        .delay((d, i) => i*100)
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
                if (parseFloat(p.height) > 260){
                    return 'green'
                }else{
                    return 'red'
                }
            })
            .attr('width', x.bandwidth())
            .attr('height', p => 0)
            .transition()
            .delay((d, i) => i*100)
            .duration(500)
            .attr('y', p => y(p.height) - 1)
            .attr('height', p => height - y(p.height))
            
                 

    }

}

export default D3Graph;