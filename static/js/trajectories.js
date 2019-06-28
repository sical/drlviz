let traj_x;
let traj_y;

let ts_y;
let ts_x;


let objids = [];
var opt = {};
opt.epsilon = 5;
opt.perplexity = 20;
opt.dim = 2;

let line = d3.line()
    .x(function (d) {
        return traj_x(d[0]);
    })
    .y(function (d) {
        return traj_y(d[1]);
    });

let myWorker = new Worker("static/js/worker.js");


function changeHighlight() {

    $('.currentepisode').attr('class', 'line');

    $('#' + episode).attr('class', 'line currentepisode')

}

function draw_traj(data, svg, width, height) {

    let mapx = (scenario === 'health_gathering_supreme' ? [0, 2000] : [200, 1200]);
    let mapy = (scenario === 'health_gathering_supreme' ? [0, 2000] : [-600, 100]);

    // Health gatherin supreme
    // traj_x = d3.scaleLinear().domain([0, 2000]).range([0, width]);
    // traj_y = d3.scaleLinear().domain([0, 2000]).range([height, 0]);

    traj_x = d3.scaleLinear().range([0, width]);
    traj_y = d3.scaleLinear().range([height, 0]);


    traj_x.domain(mapx);
    traj_y.domain(mapy);


    let g = svg.append("g");
    let mkeys = Object.keys(data);
    for (let i = 0; i < mkeys.length; i++) {

        g.append("path")
            .data([data[mkeys[i]].positions])
            .attr("class", () => {
                return (episode === mkeys[i] ? "line currentepisode" : "line")
            })
            .attr("d", line)
            .attr('stroke', 'steelblue')
            .style("fill", "none")
            .attr('id', function () {
                return mkeys[i];
            })
    }
}

function update_traj(data, svg, id) {

    svg.select('g').append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line)
        .attr('stroke', 'steelblue')
        .style("fill", "none")
        .attr('id', function () {
            return id;
        })


}

function draw_agent(svg, pos) {

    $('.agent').remove();

    svg.append("rect")
        .attr("class", "agent")
        .attr('x', traj_x(pos[0]) - 6)
        .attr('y', traj_y(pos[1]) - 6)
        .attr('fill', 'red')
        .attr('stroke-style', 'black')
        .attr("width", 12)
        .attr("height", 12)
}


function draw_agent_or(svg, pos, or) {

    d3.selectAll('.agent').remove();

    svg.append("text")
        .attr('class', 'agent')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'text-before-edge')
        .attr('transform', 'translate(' + (traj_x(pos[0]) - 20) + ',' + (traj_y(pos[1]) - 18) + ') rotate(' + (360 - or) + ' ' + (20) + ' ' + (18) + ')')
        // .style('transform', 'rotate(' + (or - 90) + 'deg)')
        .attr("font-family", "Verdana")
        .attr("font-size", 30)
        .html("&#11165;")
}

function draw_agent_path(svg, pos, or) {

    d3.selectAll('.agent').remove();

    svg.append('path')
        .attr('d', "M 15.8,8.3 0.8,15.8 5,8.3 0.8,0.8 Z")
        .attr('class', 'agent')
        .attr('transform', 'translate(' + (traj_x(pos[0]) - 7.5) + ',' + (traj_y(pos[1]) - 7.5) + ') rotate(' + (360 - or) + ' ' + (7.5) + ' ' + (7.5) + ')')
    // .style('transform', 'translate(' + (traj_x(pos[0]) - 7.5) + 'px ,' + (traj_y(pos[1]) - 7.5) + 'px) rotate(' + or + 'deg)')
}

function updatehps(svg, data, step) {

    d3.selectAll('.hp').remove();

    if (data[step].length > 0) {

        for (let i = 0; i < data[step].length; i++) {

            svg.append("circle")
                .attr("class", "hp")
                .attr('cx', traj_x(data[step][i].object_position_x) - 2.5)
                .attr('cy', traj_y(data[step][i].object_position_y) - 2.5)
                .attr('fill', (data[step][i].object_name === 'Poison' ? 'red' : (!objids.includes(data[step][i].object_id) ? 'orange' : 'green')))
                .attr("r", 5)
                .style('opacity', '0.8');

            if (!objids.includes(data[step][i].object_id)) {
                objids.push(data[step][i].object_id)
            }
        }
    }
}

function draw_elem_traj(svg, data, id) {


    $('.hdots').remove();
    let tkeys = Object.keys(data);

    for (let i = 0; i < tkeys.length; i++) {
        if (tkeys[i]) {

            for (let j = 0; j < data[tkeys[i]].hiddens.length; j++) {

                dotintraj(svg, data[tkeys[i]].positions[j][0], data[tkeys[i]].positions[j][1], data[tkeys[i]].hiddens[j][id], tkeys[i], j, col(data[tkeys[i]].hiddens[j][id]))

            }
        }
    }
}


function draw_rule_traj(svg, data, rule, id) {


    let activ = get_activ(id);

    $('.hdots').remove();
    let tkeys = Object.keys(data);

    for (let j = 0; j < activ.length; j++) {
        for (let i = 0; i < activ[j][1] - activ[j][0]; i++) {


            // console.log(activ[j][0] + i);
            dotintraj(svg, data[episode].positions[activ[j][0] + i][0], data[episode].positions[activ[j][0] + i][1], '', episode, activ[j][0] + i, rule.color)
        }

    }


}


function find_cur_dot(svg, step) {

    if (last_circle !== undefined) {
        last_circle.attr("r", 3).attr('fill', 'steelblue')
    }

    let cirs = svg.selectAll('.perst').filter((d) => d.id === step);


    cirs.attr('fill', 'red').attr('r', 4.5);

    last_circle = cirs


}

function dotintraj(svg, x, y, val, epis, step, color) {

    svg.append("circle")
        .attr("class", "hdots")
        .attr('cx', traj_x(x) - 1.75)
        .attr('cy', traj_y(y) - 1.75)
        .attr('fill', color)
        .attr('stroke-style', 'black')
        .attr("r", 3.5)
        .attr('episode', epis)
        .attr('step', step)
}


async function selTsne(data, ts_type) {

    switch (ts_type) {
        case '1':
            makeState(d3.select('#tsne'), data);
            break;
        case '2':
            makeElem(d3.select('#tsne'), data);
            break;
        case '3':
            makeAbs(d3.select('#tsne'), data);
            break;
        default:
    }
}


function makeState(svg, data) {

   myWorker.terminate();
    myWorker = new Worker("static/js/worker.js");

    let svbbox = svg.node().getBoundingClientRect();
    ts_y = d3.scaleLinear().rangeRound([svbbox.height - 10, 0]);
    ts_x = d3.scaleLinear().rangeRound([0, svbbox.width - 10]);

    svg.selectAll('g').transition().delay(300).remove();
    let g1 = svg.append('g');


    initdrawCircles(g1, data.length, 'steelblue', svg);//, 'click', switchst);

    myWorker.onmessage = function (e) {
        drawCircles(g1, e.data);
        Y = e.data;

    };

    myWorker.postMessage([data, opt]);

}


function makeElem(svg, data) {

    let perElem = data[0].map(function (col, i) {
        return data.map(function (row) {
            return row[i];
        });
    });

    svg.selectAll('g').transition().delay(300).remove();
    let g2 = svg.append('g');
    ts_x.domain([-1, 1]);
    ts_y.domain([-1, 1]);
    const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
    g2.selectAll(".bg").data(perElem).enter().append('circle')
        .attr("class", "bg")
        .attr('cx', (d) => {
            return ts_x(0)
        })
        .attr('cy', (d) => {
            return ts_y(0)
        })
        .attr('fill', function (d, i) {
            return col(average(perElem[i]))
        })
        .attr("r", '3')
        .attr('num', (d, i) => {
            return i
        }).style('cursor', 'pointer').style('opacity', '0.8');

    initdrawCircles(g2, perElem.length, 'steelblue', svg);// 'click', ts_add);

    myWorker.onmessage = function (e) {
        drawCircles(g2, e.data);
        g2.selectAll(".bg").data(e.data)
            .transition()
            .delay(170)
            .attr('cx', (d) => {
                return '0'
            })
            .attr('cy', (d) => {
                return '0'
            })
            .attr('transform', (d) => {
                return 'translate(' + ts_x(d[0]) + ',' + ts_y(d[1]) + ')'
            })

    };

    myWorker.postMessage([perElem, opt]);

}


function makeAbs(svg, data) {

    let perElem = data[0].map(function (col, i) {
        return data.map(function (row) {
            return Math.abs(row[i]);
        });
    });

    let perElem2 = data[0].map(function (col, i) {
        return data.map(function (row) {
            return row[i];
        });
    });

    svg.selectAll('g').transition().delay(300).remove();
    let g2 = svg.append('g');

    const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
    initdrawCircles(g2, perElem.length, 'steelblue', svg);// 'click', ts_add);
    g2.selectAll(".bg").data(perElem).enter().append('circle')
        .attr("class", "bg")
        .attr('cx', (d) => {
            return ts_x(0)
        })
        .attr('cy', (d) => {
            return ts_y(0)
        })
        .attr('fill', function (d, i) {
            return col(average(perElem2[i]))
        })
        .attr("r", '3')
        .attr('num', (d, i) => {
            return i
        }).style('cursor', 'pointer').style('opacity', '0.8');


    myWorker.onmessage = function (e) {
        drawCircles(g2, e.data);
        g2.selectAll(".bg").data(e.data)
            .transition()
            .delay(170)
            .attr('cx', (d) => {
                return '0'
            })
            .attr('cy', (d) => {
                return '0'
            })
            .attr('transform', (d) => {
                return 'translate(' + ts_x(d[0]) + ',' + ts_y(d[1]) + ')'
            })

    };

    myWorker.postMessage([perElem, opt]);
}


function initdrawCircles(grp, dataln, color, event, call, svg) {
    ts_x.domain([-1, 1]);
    ts_y.domain([-1, 1]);


    grp.selectAll(".perst").data(new Array(dataln)).enter().append('circle')
        .attr("class", "perst")
        .attr('cx', () => {
            return ts_x(0)
        })
        .attr('cy', () => {
            return ts_y(0)
        })
        .attr('fill', color)
        .attr('stroke-style', 'black')
        .attr("r", 3)
        .attr('num', (d, i) => {
            return i
        })
    /*        .on(event, call)
            .on('mouseenter', ts_enter)
            .on('mouseout', ts_out);*/


    lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(100)
        .items(d3.selectAll('.perst'))
        .targetArea(svg_tsne)
        .on("start", lasso_start)
        .on("draw", lasso_draw)
        .on("end", lasso_end);

    svg_tsne.call(lasso);

}

function drawCircles(grp, data) {
    updateDomain(data);

    let tr = [];
    for (let i = 0; i < data.length; i++) {
        tr.push({pos: data[i], id: i})
    }

    grp.selectAll(".perst").data(tr)
        .transition()
        .delay(170)
        .attr('cx', () => {
            return '0'
        })
        .attr('cy', () => {
            return '0'
        })
        .attr('transform', (d) => {
            return 'translate(' + ts_x(d.pos[0]) + ',' + ts_y(d.pos[1]) + ')'
        })
}

function updateDomain(data) {
    ts_x.domain([d3.min(data, function (d) {
        return d[0];
    }) - 2, d3.max(data, function (d) {
        return d[0];
    }) + 2]);

    ts_y.domain([d3.min(data, function (d) {
        return d[1];
    }) - 2, d3.max(data, function (d) {
        return d[1];
    }) + 2]);
}



