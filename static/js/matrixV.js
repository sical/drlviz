let ve_h;
let ve_rows = [];
let ve_w = 25;


function ve_init_rows(svg, data, height) {

    let g = svg.append('g').attr('class', 'hiddensgrp');

    ve_h = Math.min(((height) / data.length), 60);

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('order', (d, i) => i)
        .attr('x', '45')
        .attr('y', (d, i) => {
            return (i * ve_h) + 10
        }).attr('nb', (d, i) => {
        return i
    }).attr('width', ve_w)
        .attr('height', ve_h)
        .attr('fill', (d) => {
            return col(d)
        });

    svg.append('line')
        .attr('x1', 45 + ve_w)
        .attr('x2', 45 + ve_w)
        .attr('y1', 10)
        .attr('y2', (ve_h * data.length) + 10);

    svg.append('line')
        .attr('x1', 45)
        .attr('x2', 45)
        .attr('y1', 10)
        .attr('y2', (ve_h * data.length) + 10);

    svg.append('line')
        .attr('x1', 45 + ve_w)
        .attr('x2', 45)
        .attr('y1', 10)
        .attr('y2', 10);

    svg.append('line')
        .attr('x1', 45 + ve_w)
        .attr('x2', 45)
        .attr('y1', (ve_h * data.length) + 10)
        .attr('y2', (ve_h * data.length+1) + 10);

    ve_rows = svg.selectAll('rect');
    ve_ticks(data.length, svg)

}


function ve_ticks(nb, svg) {
    $('.vetick').remove();

    for (let i = 0; i < nb / 50; i++) {
        svg.append('rect')
            .attr('x', (32) + 'px')
            .attr('y', ((ve_h * (50 * i) + 10)) + 'px')
            .attr('width', '12px')
            .attr('height', 2 + 'px')
            .style('fill', 'rgb(120, 120, 120)')
            .attr('class', 'vetick');

        svg.append('text')
            .attr('x', (0) + 'px')
            .attr('y', (ve_h * (50 * i) + 16) + 'px')
            .style('color', 'rgb(120, 120, 120)')
            .attr('class', 'vetick')
            .style('font-size', '12pt')
            .text(50 * i)
    }

    for (let i = 0; i < nb / 10; i++) {
        if ((10 * i % 50) !== 0)
            svg.append('rect')
                .attr('x', (38) + 'px')
                .attr('y', ((ve_h * (10 * i)) + 10) + 'px')
                .attr('width', '6px')
                .attr('height', (1) + 'px')
                .style('fill', 'rgb(160, 160, 160)')
                .attr('class', 'vetick')
    }

    svg.append('text')
        .text('Elements')
        .attr('font-family', 'Helvetica')
        .attr('font-size', '18px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'start')
        .attr('transform', 'translate( ' + 78 + ' ,' + ((ve_h * (nb / 2)) - 50) + ')rotate(90)')
        .attr('class', 'labl')
        .attr('nb', 6)
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
        .duration(2575)
        .attr('y', (d, i) => {

            return (ve_h * order.indexOf(i)) + 10;
        })

}

