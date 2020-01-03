let traj_x;
let traj_y;

let ts_y;
let ts_x;
let Y;
let last_circle;

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

    let mapx, mapy;

    if (scenario === 'health_gathering_supreme') {
        mapx = [0, 2000];
        mapy = [0, 2000];

    } else if (scenario === 'two_col') {
        mapx = [-800, 500];
        mapy = [-800, 500];

    } else if (scenario === 'my_way_home') {
        mapx = [200, 1200];
        mapy = [-600, 100];

    } else if (scenario === 'arnold') {
        mapx = [-2000, -200];
        mapy = [2000, 3800];

    } else {
        mapx = [-650, 500];
        mapy = [-650, 500];
    }

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


    draw_agent_path(svg, data[episode].positions[whichstep], data[episode].orientations[whichstep])
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


function draw_agent_path(svg, pos, or) {

    d3.selectAll('.agent').remove();

    svg.append('path')
        .attr('d', "M 15.8,8.3 0.8,15.8 5,8.3 0.8,0.8 Z")
        .attr('class', 'agent')
        .attr('transform', 'translate(' + (traj_x(pos[0]) - 7.5) + ',' + (traj_y(pos[1]) - 7.5) + ') rotate(' + (360 - or) + ' ' + (7.5) + ' ' + (7.5) + ')')
}

function updatehps(svg, data, step) {

    d3.selectAll('.hp').remove();

    if (data[step].length > 0) {

        for (let i = 0; i < data[step].length; i++) {

            svg.append("circle")
                .attr("class", "hp")
                .attr('cx', traj_x(data[step][i].object_position_x) - 2.5)
                .attr('cy', traj_y(data[step][i].object_position_y) - 2.5)
                // .attr('fill', (data[step][i].object_name === 'Poison' ? 'red' : (!objids.includes(data[step][i].object_id) ? 'orange' : 'green')))
                .attr('fill', (time_colors[item_ord.indexOf(data[step][i].object_name)]))
                .attr("r", 5)
                .style('opacity', '0.8');

            if (!objids.includes(data[step][i].object_id)) {
                objids.push(data[step][i].object_id)
            }
        }
    }
}


function find_cur_dot(svg, step) {

    if (last_circle !== undefined) {
        last_circle.attr("r", 3).attr('fill', 'steelblue')
    }


    let cirs = svg.selectAll('.perst').filter((d) => (d ? d.id === step : false));


    cirs.attr('fill', 'red').attr('r', 4.5);

    last_circle = cirs


}


function update_ts(svg) {

    let svbbox = svg.node().getBoundingClientRect();
    ts_y = d3.scaleLinear().rangeRound([svbbox.height - 10, 0]);
    ts_x = d3.scaleLinear().rangeRound([0, svbbox.width - 10]);


}

function makeState(svg, data) {

    myWorker.terminate();
    myWorker = new Worker("static/js/worker.js");

    let svbbox = svg.node().getBoundingClientRect();
    ts_y = d3.scaleLinear().rangeRound([svbbox.height - 10, 0]);
    ts_x = d3.scaleLinear().rangeRound([0, svbbox.width - 10]);

    svg.selectAll('g').transition().delay(300).remove();
    let g1 = svg.append('g').attr('id', 'lay');


    initdrawCircles(g1, data.length, 'steelblue');

    myWorker.onmessage = function (e) {
        drawCircles(g1, e.data);
        Y = e.data;

    };

    myWorker.postMessage([data, opt]);

}


function initdrawCircles(grp, dataln, color) {
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

