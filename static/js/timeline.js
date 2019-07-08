let abstr3 = {
        "Health": [],
        "Events": [],
        "Medikit": [],
        "Poison": [],
        "Or_to_next": [],
        "variation": [],
        "Ambiguous": []
    };

let svgbound = [109 + 12, 748 + 3];
let sswidth;
let padding = 30;
let rowh = 20;
let label_pad = 110;

function timeline_init(data, twidth) {
    svgbound = [label_pad + 11, twidth + label_pad + 5];

    let svg = d3.select('#timelien');
    svg_timelien = d3.select('#timelien');


    sswidth = $('#timelien').width();

    svg.selectAll("*").remove();

    new_timeline_setRows(svg);


    let keys = Object.keys(abstr3);
    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', label_pad)
        .attr('x2', label_pad)
        .attr('y1', 0)
        .attr('y2', 580);

    let event = timeline_make_event(data.health, data.positions);
    //.attr('stroke-dasharray', '5,5');
    timeline_draw_line(data.health, svg, padding - rowh / 2 - 2, '#FDB462', [0, 100], keys[0]);
    timeline_draw_events(event, svg, 2 * padding - rowh / 2 - 2, keys[1]);
    if (scenario === 'health_gathering_supreme') {                                                //500
        timeline_item(data.fov, data.positions, svg, 'CustomMedikit', 3 * padding - rowh / 2 - 2, '#a1de52', 500, keys[2]);
        timeline_item(data.fov, data.positions, svg, "Poison", 4 * padding - rowh / 2 - 2, '#fb7258', 375, keys[3]);
    } else if (scenario === 'my_way_home') {

        timeline_item(data.fov, data.positions, svg, 'GreenArmor', 3 * padding - rowh / 2 - 2, '#a1de52', 500, keys[2]);

    }

    timeline_or2next(data.fov, data.positions, event[0].slice(), svg, '#FDB462', [0, 640], 5 * padding - rowh / 2 - 2, keys[4]);
    timeline_variation(data.orientations, svg, 6 * padding - rowh / 2 - 2, '#FDB462', keys[5]);
    // timeline_dir2next(data.fov, data.positions, event[0].slice(), svg, '#FDB462', 7 * padding - rowh / 2 - 2, keys[6]);
    timeline_actionVari(data.probabilities, svg, 7 * padding - rowh / 2 - 2, '#FDB462', keys[6])
}

function new_timeline_setRows(svg) {


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', 25)
        .attr('x2', sswidth)
        .attr('y1', 10)
        .attr('y2', 10);

    let keys = Object.keys(abstr3);


    for (let i = 1; i <= keys.length; i++) {


        svg.append('text')
            .attr('x', '35')
            .attr('y', i * padding)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '14')
            .text(keys[i - 1]);

        svg.append('line')
            .style('stroke-width', '1px')
            .attr('stroke', 'black')
            .attr('x1', 25)
            .attr('x2', sswidth)
            .attr('y1', (i * padding) + 12)
            .attr('y2', (i * padding) + 12);

    }
}


function timeline_variation(data, svg, y, color, key) {

    let res = [0];

    for (let i = 1; i < data.length; i++) {

        res.push(Math.abs(data[i - 1] - data[i]))
    }
        let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);
    let scy = d3.scaleLinear().domain([0, 30]).range([rowh, 0]);

    let line = d3.line()
        .x(function (d, i) {
            return scx(i)
        })
        .y(function (d) {
            if (d < 40) {
                return y + (scy(d) > rowh ? rowh : scy(d))
            } else {
                return y + (scy(360 - d) > rowh ? rowh : scy(360 - d))
            }
        }).curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(res)
        .attr("class", "line")
        .attr("d", line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', '2px');

    abstr3[key] = res
}

function timeline_item(data, posis, svg, name, y, color, threshold, key) {

    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);

    let sqs = [];
    let sq = [];

    for (let i = 0; i < data.length; i++) {

        let hpin = false;
        for (let j = 0; j < data[i].length; j++) {

            if (data[i][j].object_name === name) {
                if (threshold > 0) {
                    if (threshold >= euclidian_dist(posis[i], [data[i][j].object_position_x, data[i][j].object_position_y])) {
                        hpin = true;
                        break;
                    }
                } else {
                    hpin = true;
                    break;
                }


            }
        }
        if (hpin && sq.length === 0) {
            sq.push(i)
        }
        else if (!hpin && sq.length === 1) {
            sq.push(i - 1);
            sqs.push(sq.slice());
            sq = []
        }
    }


    if (sq.length === 1) {
        sq.push(data.length - 1);
        sqs.push(sq.slice());
        sq = []
    }

    for (let i = 0; i < sqs.length; i++) {
        svg.append('rect')
            .attr('x', () => {
                return scx(sqs[i][0])
            })
            .attr('y', y)
            .attr('width', () => {
                return scx(((sqs[i][1] - sqs[i][0]) >= 2 ? (sqs[i][1] - sqs[i][0]) : (sqs[i][1] - sqs[i][0]) + 1)) - svgbound[0]
            })
            .attr('height', 10)
            .attr('fill', color)
    }


    abstr3[key] = sqs;
}

function timeline_or2next(fov, pos, event, svg, color, size, offy, key) {

    // console.log(event[0]);
    let res = [];
    for (let i = 0; i < fov.length; i++) {

        let nope = false;
        for (let j = 0; j < fov[i].length; j++) {
            if (fov[i][j].object_name === 'CustomMedikit' && event.length > 0) {

                if (Math.hypot((event[0][0][0] - fov[i][j].object_position_x), (event[0][0][1] - fov[i][j].object_position_y)) < 52) {
                    nope = true;
                    res.push(timeline_orFromx(fov[i][j].object_x, size));
                    break;
                }
            }
        }
        if (!nope) {
            res.push(NaN)
        }

        // console.log(event);
        if (event.length > 0) {
            if (event[0][0] === pos[i]) {
                event.shift();
            }
        }
    }
    abstr3[key] = res;
    timeline_draw2next(res, svg, offy, color, [-45, 45])
}

function timeline_make_event(health, pos) {

    let hps = [];
    let pvs = [];

    let da = [];

    for (let i = 1; i < health.length; i++) {
        if (health[i] - health[i - 1] > 2) {
            hps.push([pos[i], i]);
            da.push(1)

        }
        else if (health[i - 1] - health[i] > 8) {
            pvs.push([pos[i], i]);
            da.push(2)

        }
        else if (megadata[episode].items[i - 1] < megadata[episode].items[i]) {
            hps.push([pos[i], i]);
            da.push(1)

        }
        else {
            da.push(0)

        }
    }
    return [hps, pvs];
}


function timeline_orFromx(x, size) {

    let angle = d3.scaleLinear().domain(size).range([-45, 45]);

    return angle(x)
}

function timeline_draw2next(data, svg, y, color, dom) {
    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);
    let scy = d3.scaleLinear().domain(dom).range([0, rowh]);

    let line = d3.line()
        .x(function (d) {
            return scx(d[0])
        })
        .y(function (d) {
            return y + scy(d[1])
        }).curve(d3.curveMonotoneX);

    let temp = [];

    for (let i = 0; i < data.length; i++) {

        if (!isNaN(data[i])) {

            temp.push([i, data[i]])

        } else if (temp.length !== 0) {
            svg.append("path")
                .datum(temp)
                .attr("class", "line")
                .attr("d", line)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', '2px');

            temp = [];
        }
    }
}


function timeline_draw_events(data, svg, y, key) {

    let tcolors = ['#a1de52', '#fb7258'];
    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);

    abstr3[key] = data;

    svg.append('line')
        .attr('x1', scx(0))
        .attr('x2', scx(megadata[episode].health.length - 1))
        .attr('y1', y + 8)
        .attr('y2', y + 8);


    for (let i = 0; i < data.length; i++) {


        for (let j = 0; j < data[i].length; j++) {


            if (i === 0) {

                svg.append('rect')
                    .attr('x', scx(data[i][j][1]) - 1)
                    .attr('y', y - 1)
                    .attr('width', cw / 6)
                    .attr('height', 9)
                    .attr('fill', tcolors[i])


            } else {

                svg.append('rect')
                    .attr('x', scx(data[i][j][1]) - 1)
                    .attr('y', y + 8)
                    .attr('width', cw / 6)
                    .attr('height', 9)
                    .attr('fill', tcolors[i])
            }
        }
    }


}


function scaleAll() {

    svgbound = [label_pad + 11, twidth + label_pad + 5];

    let svg = d3.select('#timelien');
    svg_timelien = d3.select('#timelien');


    sswidth = $('#timelien').width();

    svg.selectAll("*").remove();

    new_timeline_setRows(svg);


    let keys = Object.keys(abstr3);

    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', label_pad)
        .attr('x2', label_pad)
        .attr('y1', 0)
        .attr('y2', 580);


    timeline_draw_line(abstr3[keys[0]], svg, padding - rowh / 2 - 2, '#FDB462', [0, 100], keys[0]);
    timeline_draw_events(abstr3[keys[1]], svg, padding * 2 - rowh / 2 - 2, keys[1]);
    timeline_draw_sqs(abstr3[keys[2]], svg, 3 * padding - rowh / 2 - 2, '#a1de52');
    timeline_draw_sqs(abstr3[keys[3]], svg, 4 * padding - rowh / 2 - 2, '#fb7258');

    timeline_draw2next(abstr3[keys[4]], svg, 5 * padding - rowh / 2 - 2, '#FDB462', [-45, 45]);

    timeline_draw_line(abstr3[keys[5]], svg, 6 * padding - rowh / 2 - 2, '#FDB462',[0,30] ,keys[5]);
    timeline_draw_line(abstr3[keys[6]], svg, padding * 7 - rowh / 2 - 2, '#FDB462', [0, 1], keys[6])


}


function timeline_draw_sqs(sqs, svg, y, color) {


    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);

    for (let i = 0; i < sqs.length; i++) {
        svg.append('rect')
            .attr('x', () => {
                return scx(sqs[i][0])
            })
            .attr('y', y)
            .attr('width', () => {
                return scx(((sqs[i][1] - sqs[i][0]) >= 2 ? (sqs[i][1] - sqs[i][0]) : (sqs[i][1] - sqs[i][0]) + 1)) - svgbound[0]
            })
            .attr('height', 10)
            .attr('fill', color)
    }
}

function timeline_actionVari(data, svg, y, color, key) {

    let res = [];


    for (let i = 0; i < data.length; i++) {

        let varia = Math.min(vari(data[i]) * 10, 1);


        res.push(Math.max(0, ((1 - varia > 0.9 ? 1 - varia : (1 - varia) * 0.65))))
    }

    abstr3[key] = res;

    timeline_draw_line(res, svg, y, color, [0, 1], key)

}


function timeline_draw_line(data, svg, y, color, domain, key) {
    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);
    let scy = d3.scaleLinear().domain(domain).range([rowh, 0]).clamp(true);

    let line = d3.line()
        .x(function (d, i) {
            return scx(i)
        })
        .y(function (d) {
            return y + scy(d)
        }).curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', '2px');


    abstr3[key] = data
}

function appendRule(svg, rule, nb, activs, id) {

    nb += Object.keys(abstr3).length + 2;

    draw_rule_activation(svg, nb * padding - rowh / 2 - 1, activs, rule.color, id);

    svg.append('text')
        .attr('x', '15')
        .attr('y', nb * padding)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '14')
        .attr('class', 'svrl txt' + id)
        .text(rule.name);

    svg.append('line')
        .attr('class', 'svrl')
        .attr('x1', 20)
        .attr('x2', sswidth)
        .attr('y1', (nb * padding) + 12)
        .attr('y2', (nb * padding) + 12);

}


function draw_rule_activation(svg, y, activs, color, id) {


    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);


    for (let i = 0; i < activs.length; i++) {
        svg.append('rect')
            .attr('class', 'svrl rect' + id)
            .attr('x', () => {
                return scx(activs[i][0])
            })
            .attr('y', y + 1)
            .attr('width', () => {
                return scx((activs[i][1] - activs[i][0]) + 1) - svgbound[0]
            })
            .attr('height', 10)
            .attr('fill', color)
    }
}

