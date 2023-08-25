import * as d3 from 'd3';

const url = 'https://udemy-react-d3.firebaseio.com/tallest_men.json'
const margin = {top: 30, bottom: 30, right: 30, left: 30}
const width = 800 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

class D3Chart{
    constructor(element){
        const svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .attr('style', 'background-color: grey')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.left})`)
        
            d3.json(url).then(data => {
                
                const x = d3.scaleBand()
                            .domain(data.map(p => p.name))
                            .range([0,width])
                            .padding(0.4)

                const y = d3.scaleLinear()
                            .domain([250,d3.max(data, point => point.height)])
                            .range([height, 0])

                const leftAxis = d3.axisLeft(y)
                svg.append('g').call(leftAxis)
                               
                const bottomAxis = d3.axisBottom(x)
                svg.append('g')
                   .attr('transform', `translate(0, ${height})`)
                   .call(bottomAxis)
                               
                
                let selection = svg.selectAll('rect')
                   .data(data)
                
                   selection.enter()
                   .append('rect')
                   .attr('x', point => x(point.name))
                   .attr('y', point => y(point.height))
                   .attr('fill', (point, index) => {
                       if (parseFloat(point.height) > 260){
                           return 'green'
                        }else{
                            return 'red'
                        }
                    })
                    .attr('width', x.bandwidth())
                    .attr('height', point => height - y(point.height))
                    
                    selection.enter()
                     .append('text')
                     .attr('x', point => x(point.name)+25)
                     .attr('y', point => y(point.height) +20)
                     .text((point, index) => point.height)             
                })


    }

}

export default D3Chart;