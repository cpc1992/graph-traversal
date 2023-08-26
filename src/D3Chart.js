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


        vis.svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .text("World's tallest man")
            .attr('text-anchor', 'middle')

        vis.svg.append('text')
            .attr('x', -height/2)
            .attr('y', -35)
            .text("Height in cm")
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')

        vis.leftAxisGroup = vis.svg.append('g')

        vis.bottomAxisGroup = vis.svg.append('g')


        // Promise.allSettled([
        //     d3.json(url_men),
        //     d3.json(url_women)
        // ]).then(dataset => {
        //     console.log(dataset)
        //     let [men, women] = dataset

        //     vis.data = men.value
        //     vis.update()

        //     let toggle = false

        //     d3.interval(()=>{
        //         vis.data = toggle ? men.value : women.value
        //         vis.update()
        //         toggle = !toggle
        //     },1000)
        // })


            /* this is to simulate the data */
            let men = {value: [{name: 'a', height: 50},
            {name: 'b', height: 60},
            {name: 'c', height: 70},
            {name: 'd', height: 80},
            {name: 'e', height: 90}]}

            let women = {value: [{name: 'm', height: 90},
            {name: 'n', height: 150},
            {name: 'o', height: 70},
            {name: 'b', height:140},
            {name: 'q', height: 50}]}

            vis.data = men.value
            vis.update()

            let toggle = false

            d3.interval(()=>{
                vis.data = toggle ? men.value : women.value
                vis.update()
                toggle = !toggle
            },5000)


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
            .call(leftAxis)
                            
        let bottomAxis = d3.axisBottom(x)

        vis.bottomAxisGroup
            .attr('transform', `translate(0, ${height})`)
            .call(bottomAxis)
        
        // select all rectangles in the SVG and join the data
        let selection = vis.svg.selectAll('rect')
            .data(vis.data, p => p.name)

        console.log(selection)
        // remove all old data points
        selection.exit().remove()

        selection.attr('fill', 'blue')

        // append new rectangles for every new data point in enter()    
        selection.enter()
            .append('rect')
            .attr('x', p => x(p.name))
            .attr('y', p => y(p.height))
            .attr('fill', p => {
                if (parseFloat(p.height) > 260){
                    return 'green'
                    }else{
                        return 'red'
                    }
                })
            .attr('width', x.bandwidth())
            .attr('height', p => height - y(p.height))
                 

    }

}

export default D3Chart;