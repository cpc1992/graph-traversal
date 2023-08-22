import * as d3 from 'd3';

const url = 'https://udemy-react-d3.firebaseio.com/tallest_men.json'
const width = 800
const height = 500

class D3Chart{
    constructor(element){
        const svg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('style', 'background-color: grey')
        
            d3.json(url).then(data => {
                
                const x = d3.scaleBand()
                            .domain(data.map(p => p.name))
                            .range([0,width])
                            .padding(0.4)

                const y = d3.scaleLinear()
                            .domain([0,d3.max(data, point => point.height)])
                            .range([0,height])

                let selection = svg.selectAll('rect')
                   .data(data)
                
                   selection.enter()
                    .append('rect')
                    .attr('x', point => x(point.name))
                    .attr('y', point => height - y(parseFloat(point.height)))
                    .attr('fill', (point, index) => {
                        if (parseFloat(point.height) > 260){
                            return 'green'
                        }else{
                            return 'red'
                        }
                    })
                    .attr('width', x.bandwidth())
                    .attr('height', point => y(point.height))

                   selection.enter()
                    .append('text')
                    .attr('x', point => x(point.name))
                    .attr('y', '99%')
                    .text((point, index) => point.height)             
            })


    }

}

export default D3Chart;