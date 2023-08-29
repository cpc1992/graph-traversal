import * as d3 from 'd3';



const width = 1000
const height = 1000

class D3Graph{
    constructor(element){

        const vis = this

        let connectComponents = true


        // graph generator
        let numNodes = 400
        let maxConnections = 2
        
        let randomDataset = {nodes: [], edges: [], adjmap: {}}
        for (let i = 0; i < numNodes; i++){
            let nodeObj = {id: i}
            randomDataset.nodes.push(nodeObj)
            let connections = Math.floor(Math.random()*maxConnections) 
            connections = maxConnections -1
            for (let j = 0; j < connections; j++){
                let randomTarget = Math.floor(Math.random() * numNodes)
                while (randomTarget == j){
                    randomTarget = Math.floor(Math.random() * numNodes)
                }
                let edgeObj = {source: i, target: randomTarget}
                randomDataset.edges.push(edgeObj)
                
                // create undirected adjacency map
                if(!(edgeObj.source in randomDataset.adjmap)){
                    randomDataset.adjmap[edgeObj.source] = []
                }
                randomDataset.adjmap[edgeObj.source].push(edgeObj.target)

                if(!(edgeObj.target in randomDataset.adjmap)){
                    randomDataset.adjmap[edgeObj.target] = []
                }
                randomDataset.adjmap[edgeObj.target].push(edgeObj.source)
            }


        }

        if (connectComponents == true){

            let DFSRecurse = (adjlist, parent, visited, subResult) => {
    
                let children = adjlist[parent]
                for(let child of children){
    
                    if(!visited.has(child)){
    
                        visited.add(child)
    
                        subResult.push(child)
                        DFSRecurse(adjlist, child, visited, subResult)
                    }
                }
    
            }
    
            let DFSDriver = (adjlist) => {
    
                let visited = new Set()
                let finalResult = []
                for (let [parent, child] of Object.entries(adjlist)){
                    let parentNumber = parseInt(parent)
                    if(!visited.has(parentNumber)){
                        
                        visited.add(parentNumber)
                        let subResult = [parentNumber]
                        DFSRecurse(adjlist, parentNumber, visited, subResult)
                        finalResult.push(subResult)
                    }
                }
                
                return finalResult
    
            }   
    
            let res = DFSDriver(randomDataset.adjmap)
    
            for(let i = 0; i < res.length - 1; i++){
                // get this and next component
                let component = res[i]
                let nextComponent = res[i+1]
                // create an edge between a random node in this and next component
                let newConnection = {source: Math.floor(Math.random()*component.length), target: Math.floor(Math.random()*nextComponent.length)}
                randomDataset.edges.push(newConnection)
            }
        }



        let num_rows = 17
        let num_cols = 17

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

        //colors: 
   
        //blue: #5fb8c2
        let color
        color = '#FF5E5B'        // coral
        color = '#8367C7'        // purple
        color = '#5fb8c2'        // teal
        color = '#E49273'        // rose gold

        
        // let iterations = 20
        // let strength = -100
        // let displayDataset = gridDataset


        let iterations = 30
        let strength = -50
        let displayDataset = randomDataset

        let nodes = displayDataset.nodes.map(p => ({...p}))
        let edges = displayDataset.edges.map(p => ({...p}))
        
        let zoom = 1.1
        let svg = d3.select(element)
            .append('svg')
            .attr("viewBox", [-width/2, -height/2, width, height])
            // .attr("viewBox", [0,0, width*zoom, height*zoom])
            .attr('style', 'overflow: visible')
            .append('g')

        
        let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(node => node.id).distance(30).iterations(iterations)) // creates a link between nodes. id() tells us how to edges connect to each other... via node.id. if not used, will default to index in array
        .force("charge", d3.forceManyBody().strength(strength))
        .force("x", d3.forceX())
        .force("y", d3.forceY());
            
        let link = svg.append('g')
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .selectAll('line')
            .data(edges)
            .join('line')


        
        link.append('title')
            .text((d, i) => `Salutations, I'm edge ${i}`)    

        let node = svg.append('g')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .selectAll('circle')
            .data(nodes) 
            .join(                                           // join merges the update and enter selections
                enter => enter.append("circle"),       
                update => update,
                exit => exit.remove()
            )          
            .attr('r', 4)
            .attr('fill', color)
        
        // needs to be separate because this will return the title element. if we attach it to node, then everything below will append to the title element.
        node.append('title')
            .text((p,i) => `Hii I'm node ${i}`)
        
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        node.on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('100')
                 .attr('r', () => {
                 return 10})})
            .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('100')
                 .attr('r', 4)})


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
            d3.select(this) 
                .attr("r", 10);
        }

        // Update the subject (dragged node) position during drag.
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
            d3.select(this) 
                .attr("r", 10);
        }

        // Restore the target alpha so the simulation cools after dragging ends.
        // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
            d3.select(this) 
                .transition()
                 .duration('1000')
            .attr("r", 4)
            
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