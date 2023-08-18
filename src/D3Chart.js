import * as d3 from 'd3';

class D3Chart{
    constructor(element){
        const svg = d3.select(element)
                        .append('svg')
                          .attr('width', 500)
                          .attr('height', 500);
                        
         svg.append('circle')
              .attr('r', 40)
              .attr('cy', 100)
              .attr('cx', 100)
              .attr('fill', 'red');


    }

}

export default D3Chart;