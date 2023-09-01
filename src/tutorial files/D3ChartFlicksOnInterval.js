import * as d3 from 'd3';

const url_men = 'https://udemy-react-d3.firebaseio.com/tallest_men.json'
const url_women = 'https://udemy-react-d3.firebaseio.com/tallest_women.json'
const margin = {top: 50, bottom: 50, right: 50, left: 50}
const width = 800 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

class D3Chart{
    constructor(element){
        const vis = this
        vis.svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.left})`)


        vis.title = vis.svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .text("Worlds Tallest men/women")

        vis.svg.append('text')
            .attr('x', -height/2)
            .attr('y', -35)
            .text("Height in cm")
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')

        vis.leftAxisGroup = vis.svg.append('g')

        vis.bottomAxisGroup = vis.svg.append('g')
        .attr('transform', `translate(0, ${height})`)


        /* this is calling a real api to get the data */
        Promise.allSettled([
            d3.json(url_men),
            d3.json(url_women)
        ]).then(dataset => {
            console.log(dataset)
            let [men, women] = dataset
            console.log(typeof men)
            men.value.push({name: 'Clifford', height: 167})
            women.value.push({name: 'Liese', height: 167})

            vis.data = men.value
            vis.update()

            let toggle = false

            d3.interval(()=>{
                vis.data = toggle ? men.value : women.value
                vis.update()
                toggle = !toggle
            },6000)
        })


            /* this is to simulate the data */
        //     let men = {value: [{name: 'a', height: 50},
        //     {name: 'b', height: 60},
        //     {name: 'c', height: 70},
        //     {name: 'd', height: 80},
        //     {name: 'e', height: 90}]}

        //     let women = {value: [{name: 'm', height: 90},
        //     {name: 'n', height: 150},
        //     {name: 'l', height: 20},
        //     {name: 'b', height: 10},
        //     {name: 'q', height: 50},
        // {name: 'z', height: 100}]}

        //     vis.data = men.value
        //     vis.update()

        //     let toggle = false

        //     d3.interval(()=>{
        //         vis.data = toggle ? men.value : women.value
        //         vis.update()
        //         toggle = !toggle
        //     },5000)


    }

    update(){
        let vis = this
        
        // create scales based on the data max height and the number of data points
        let x = d3.scaleBand()
            .domain(vis.data.map(p => p.name))
            .range([0,width])
            .padding(0.4)

        let y = d3.scaleLinear()
            .domain([d3.min(vis.data, p => p.height) - 100,d3.max(vis.data, p => p.height)])
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


        
        // select all rectangles in the SVG and join the data
        let selection = vis.svg.selectAll('rect')
            .data(vis.data, p => p.name)
        
        // remove all old data points
        selection.exit()
        .transition()
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
            .duration(500)
            .attr('y', p => y(p.height) - 1)
            .attr('height', p => height - y(p.height))
            
                 

    }

}

export default D3Chart;