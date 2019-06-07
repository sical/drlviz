let ve_h;
let ve_rows = [];
let ve_w = 25;


function ve_init_rows(svg, data, height) {

    let g = svg.append('g').attr('class', 'hiddensgrp');

    ve_h = Math.min((height / data.length), 60);

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('order', (d, i) => i)
        .attr('x', '20')
        .attr('y', (d, i) => {
            return (i * ve_h)
        }).attr('nb', (d, i) => {
        return i
    })
        .attr('width', ve_w)
        .attr('height', ve_h)
        .attr('fill', (d) => {
            return col(d)
        });

    ve_rows = svg.selectAll('rect')
}


function ve_update(svg, data) {

    ve_rows
        .attr('fill', (d, i) => {
            return col(data[i])
        })
}


function ve_update_reorder(svg, data, order) {

    ve_rows
        .data(data)
        .attr('order', (d, i) => order.indexOf(i))
        .attr('fill', (d, i) => {
            return col(d)
        })
        .transition()
        .duration(3575)
        .attr('y', (d, i) => {

            return (ve_h * order.indexOf(i));
        })

}

