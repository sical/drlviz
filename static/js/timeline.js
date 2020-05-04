let abstr3 = {
    "Health": [],
    "Events": [],
};

let svgbound = [109 + 12, 748 + 3];
let sswidth;
let padding = 18;
let rowh = 0;
let label_pad = 93;
let y_offset = 12;
let item_ord;
let time_colors = ["#66aa00", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#3366cc", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];

function timeline_init(data, twidth) {
    svgbound = [label_pad + 11, twidth + label_pad + 5];

    let svg = d3.select('#timelien');
    svg_timelien = svg;


    let items = find_items(data.fov);
    item_ord = items


    //TODO: The following is off for now
    abstr3["variation"] = [];
    abstr3["Ambiguous"] = [];
    abstr3["Or_to_next"] = [];


    for (let i = 0; i < items.length; i++) {

        let name = items[i];

        switch (name) {
            case "BlueArmor":
                abstr3['RedArmor'] = [];
                break;

            case "CustomMedikit-----":
                abstr3['Medikit'] = [];
                break;
            default:
                abstr3[name] = []; //TODO: Keep this
                break;

        }
    }


    split_stuff(data);

    abstr3["To the left"] = [];
    abstr3["To the right"] = [];
    sswidth = $('#timelien').width();

    svg.selectAll("*").remove();

    new_timeline_setRows(svg);


    let keys = Object.keys(abstr3);

    make_side(svg, keys, items.length);
    let event;
    if (scenario === "health_gathering_supreme" || scenario === "two_col") {
        event = timeline_make_event(data.health, data.positions);

    } else {
        event = timeline_make_event_score(data.scores, data.positions);
    }
    let starter = 6;

    timeline_draw_line(data.health, svg, starter * padding - rowh / 2 - y_offset, '#FDB462', [0, 100], keys[0]);
    timeline_draw_events(event, svg, (starter + 1) * padding - rowh / 2 - 12, keys[1]);

    timeline_variation(data.orientations, svg, (starter + 2) * padding - rowh / 2 - y_offset, '#FDB462', keys[2]);
    timeline_actionVari(data.probabilities, svg, (starter + 3) * padding - rowh / 2 - y_offset, '#FDB462', keys[3]);

    timeline_or2next(data.fov, data.positions, event[0].slice(), svg, '#FDB462', [0, 640], (starter + 4) * padding - rowh / 2 - 4, keys[4]);


    for (let i = 0; i < items.length; i++) {
        timeline_item(data.fov, data.positions, svg, items[i], ((starter + 5) + i) * padding - rowh / 2 - 12, time_colors[i], 800, keys[5 + i])
    }

    let nb = starter + 4 + items.length - 3


    timeline_draw_sqs(abstr3["High Health"], svg, (nb + 4) * padding - rowh / 2 - y_offset, '#FDB462');
    timeline_draw_sqs(abstr3["Low Health"], svg, (nb + 5) * padding - rowh / 2 - y_offset, '#FDB462');
    timeline_draw_sqs(abstr3["High Ambi"], svg, (nb + 6) * padding - rowh / 2 - y_offset, '#FDB462');
    timeline_draw_sqs(abstr3["Low Ambi"], svg, (nb + 7) * padding - rowh / 2 - y_offset, '#FDB462')

    timeline_draw_sqs(abstr3["High Vari"], svg, (nb + 8) * padding - rowh / 2 - y_offset, '#FDB462')
    timeline_draw_sqs(abstr3["Low Vari"], svg, (nb + 9) * padding - rowh / 2 - y_offset, '#FDB462')
    abstr3["To the left"] = split_steps_max(abstr3['Or_to_next'], 0)
    abstr3["To the right"] = split_steps_min(abstr3['Or_to_next'], 0)
    timeline_draw_sqs(abstr3["To the left"], svg, (nb + 10) * padding - rowh / 2 - y_offset, '#FDB462')
    timeline_draw_sqs(abstr3["To the right"], svg, (nb + 11) * padding - rowh / 2 - y_offset, '#FDB462')
}


function make_side(svg, keys, nb) {
    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', label_pad)
        .attr('x2', label_pad)
        .attr('y1', 5 * padding - rowh / 2 - 3 - y_offset)
        .attr('y2', 900);


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 25)
        .attr('x2', sswidth - 25)
        .attr('y1', 5 * padding - rowh / 2 + 9 - y_offset)
        .attr('y2', 580);

    svg.append('line')
        .style('stroke-width', '1px')
        .attr('class', 'timelienll')
        .attr('x1', sswidth - 55)
        .attr('x2', sswidth - 55)
        .attr('y1', 5 * padding - rowh / 2 + 12 - y_offset)
        .attr('y2', 580);


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('class', 'timelienll')
        .attr('x1', sswidth - 85)
        .attr('x2', sswidth - 85)
        .attr('y1', 5 * padding - rowh / 2 + 12 - y_offset)
        .attr('y2', 580);


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 115)
        .attr('x2', sswidth - 115)
        .attr('y1', 5 * padding - rowh / 2 + 9 - y_offset)
        .attr('y2', 580);


//-------------------------------------------------------------------------


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 75)
        .attr('x2', sswidth - 115)
        .attr('y1', 0)
        .attr('y2', 5 * padding - rowh / 2 + 8 - y_offset);


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 25)
        .attr('x2', sswidth + 10)
        .attr('y1', 5 * padding - rowh / 2 + 8 - y_offset)
        .attr('y2', 0);

    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 55)
        .attr('x2', sswidth - 15)
        .attr('y1', 5 * padding - rowh / 2 + 8 - y_offset)
        .attr('y2', 0);


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', sswidth - 85)
        .attr('x2', sswidth - 45)
        .attr('y1', 5 * padding - rowh / 2 + 8 - y_offset)
        .attr('y2', 0);


    svg.append('text')
        .text("Erase")
        .attr('font-family', 'Helvetica')
        .attr('font-size', '14pt')
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(' + (sswidth - 95) + ',' + (5 * padding - rowh / 2 + 9 - y_offset) + ')rotate(-65)')
        .attr('class', 'annheader')
        .attr('nb', 0)


    svg.append('text')
        .text("Union")
        .attr('font-family', 'Helvetica')
        .attr('font-size', '14pt')
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(' + (sswidth - 65) + ',' + (5 * padding - rowh / 2 + 9 - y_offset) + ')rotate(-65)')
        .attr('class', 'annheader')
        .attr('nb', 0);

    svg.append('text')
        .text("Intersec")
        .attr('font-family', 'Helvetica')
        .attr('font-size', '14pt')
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(' + (sswidth - 35) + ',' + (5 * padding - rowh / 2 + 9 - y_offset) + ')rotate(-65)')
        .attr('class', 'annheader')
        .attr('nb', 0);

    /*
    .
        attr('x2', sswidth - 25)
            .attr('y1', 4 * padding - rowh / 2 + 9)
    */


    let wsd = [(sswidth - 115), (sswidth - 85), (sswidth - 55)];

    for (let i = 0; i < 8 + nb; i++) {

        for (let j = 0; j < 3; j++) {

            svg.append('circle')
                .attr('cx', (wsd[j] + 15))
                .attr('cy', (i + 10) * padding - rowh / 2 + 20 - y_offset)
                .attr('r', 8)
                .attr('stroke', '#3d3d3d')
                .attr('stroke-width', 1)
                .attr('fill', 'rgb(208,208,208)')
                .attr('class', 'timecl')
                .attr('maur', keys[(i + 5)])
                .attr('fltype', j)

        }
    }
}

function timeline_make_event_score(score, pos) {

    let hps = [];
    let pvs = [];

    let da = [];

    for (let i = 1; i < score.length; i++) {
        if (score[i] - score[i - 1] > 0.2) {
            hps.push([pos[i], i]);
            da.push(1)

        } else if (score[i - 1] - score[i] > 0.2) {
            pvs.push([pos[i], i]);
            da.push(2)

        } else {
            da.push(0)

        }
    }

    abstr3['Events'] = da;
    return [hps, pvs];
}

function find_items(data) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (!res.includes(data[i][j].object_name)) {
                res.push(data[i][j].object_name)
            }
        }

    }

    return res;
}

function new_timeline_setRows(svg) {


    svg.append('line')
        .style('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('x1', 0)
        .attr('x2', sswidth - 25)
        .attr('y1', 5 * padding + 10 - y_offset)
        .attr('y2', 5 * padding + 10 - y_offset);

    let keys = Object.keys(abstr3);


    for (let i = 1; i <= keys.length; i++) {


        svg.append('text')
            .attr('x', '15')
            .attr('maur', keys[i - 1])
            .attr('y', ((i + 5) * padding) + 5 - y_offset)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '14')
            .text(keys[i - 1]);

        svg.append('line')
            .style('stroke-width', '1px')
            .attr('class', 'timelienll')
            .attr('x1', 0)
            .attr('x2', sswidth - 25)
            .attr('y1', ((i + 5) * padding) + 10 - y_offset)
            .attr('y2', ((i + 5) * padding) + 10 - y_offset);

    }
}


function timeline_variation(data, svg, y, color, key) {

    let res = [0];


    for (let i = 3; i < data.length; i++) {

        // res.push(Math.min(Math.abs(data[i - 3] - data[i - 2]), 360 - Math.abs(data[i - 3] - data[i - 2])) + Math.min(Math.abs(data[i - 2] - data[i - 1]), 360 -Math.abs(data[i - 2] - data[i - 1])) + Math.min(Math.abs(data[i - 1] - data[i]), 360 -Math.abs(data[i - 1] - data[i])))
        res.push(Math.min(Math.abs(data[i - 2] - data[i]), 360 - Math.abs(data[i - 2] - data[i])))
    }
    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);
    let scy = d3.scaleLinear().domain([0, 30]).range([padding - y_offset + 3, 0]).clamp(true);

    let line = d3.line()
        .x(function (d, i) {
            return scx(i)
        })
        .y(function (d) {
            if (d < 30) {
                return y + (scy(d) > padding - y_offset ? padding - y_offset : scy(d))
            } else {
                return y + (scy(360 - d) > padding - y_offset ? padding - y_offset : scy(360 - d))
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
        } else if (!hpin && sq.length === 1) {
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
            .attr('y', y - 5.5)
            .attr('width', () => {
                return scx(((sqs[i][1] - sqs[i][0]) >= 2 ? (sqs[i][1] - sqs[i][0]) : (sqs[i][1] - sqs[i][0]) + 1)) - svgbound[0]
            })
            .attr('height', 13.5)
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

        } else if (health[i - 1] - health[i] > 8) {
            pvs.push([pos[i], i]);
            da.push(2)

        } else if (megadata[episode].items[i - 1] < megadata[episode].items[i]) {
            hps.push([pos[i], i]);
            da.push(1)

        } else {
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
    let scy = d3.scaleLinear().domain(dom).range([1, padding - y_offset]);

    y = y - y_offset;
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

    y = y - 5

    svg.append('line')
        .attr('x1', scx(0))
        .attr('x2', scx(megadata[episode].health.length - 1))
        .attr('y1', y + 7)
        .attr('y2', y + 7);


    for (let i = 0; i < data.length; i++) {


        for (let j = 0; j < data[i].length; j++) {


            if (i === 0) {

                svg.append('rect')
                    .attr('x', scx(data[i][j][1]) - 1)
                    .attr('y', y - 1)
                    .attr('width', cw / 6)
                    .attr('height', 7)
                    .attr('fill', tcolors[i])


            } else {

                svg.append('rect')
                    .attr('x', scx(data[i][j][1]) - 1)
                    .attr('y', y + 7)
                    .attr('width', cw / 6)
                    .attr('height', 7)
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


    timeline_draw_line(abstr3[keys[0]], svg, padding - rowh / 2 - y_offset, '#FDB462', [0, 100], keys[0]);
    timeline_draw_events(abstr3[keys[1]], svg, padding * 2 - rowh / 2 - y_offset, keys[1]);

    timeline_draw_sqs(abstr3[keys[2]], svg, 3 * padding - rowh / 2 - y_offset, '#a1de52');
    timeline_draw_sqs(abstr3[keys[3]], svg, 4 * padding - rowh / 2 - y_offset, '#fb7258');

    timeline_draw2next(abstr3[keys[4]], svg, 5 * padding - rowh / 2 - y_offset, '#FDB462', [-45, 45]);

    timeline_draw_line(abstr3[keys[5]], svg, 6 * padding - rowh / 2 - y_offset, '#FDB462', [0, 30], keys[5]);
    timeline_draw_line(abstr3[keys[6]], svg, padding * 7 - rowh / 2 - y_offset, '#FDB462', [0, 1], keys[6])


}


function timeline_draw_sqs(sqs, svg, y, color) {

    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length - 1]).range([svgbound[0], svgbound[1]]);

    for (let i = 0; i < sqs.length; i++) {
        svg.append('rect')
            .attr('x', () => {
                return scx(sqs[i][0])
            })
            .attr('y', y - 5.5)
            .attr('width', () => {
                return scx(((sqs[i][1] - sqs[i][0]) >= 2 ? (sqs[i][1] - sqs[i][0]) : (sqs[i][1] - sqs[i][0]) + 1)) - svgbound[0]
            })
            .attr('height', 13.5)
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
    let scy = d3.scaleLinear().domain(domain).range([padding - y_offset + 3, 0]).clamp(true);


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


function split_steps_min(array, lim) {
    let sqs = [];
    let temp = -1;
    for (let i = 0; i < array.length; i++) {

        if (temp === -1 && array[i] !== NaN) {
            if (array[i] < lim)
                temp = i
        } else if (isNaN(array[i])) {
            if (temp !== i) {
                sqs.push([temp, i])
            } else {
                sqs.push([(temp > 0 ? temp - 1 : 0), i])
            }
            temp = -1
        } else if (array[i] > lim) {

            if (temp !== i) {
                sqs.push([temp, i])

            } else {
                sqs.push([(temp > 0 ? temp - 1 : 0), i])

            }
            temp = -1
        }

    }
    if (temp !== -1) {
        sqs.push([temp, array.length - 1])
    }

    return sqs;
}

function split_steps_max(array, lim) {
    let sqs = [];
    let temp = -1;
    for (let i = 0; i < array.length; i++) {

        if (temp === -1) {
            if (array[i] > lim)
                temp = i

        } else if (isNaN(array[i])) {

            if (temp !== i) {
                sqs.push([temp, i])

            } else {
                sqs.push([(temp > 0 ? temp - 1 : 0), i])

            }
            temp = -1
        } else if (array[i] < lim || isNaN(array[i])) {

            if (temp !== i) {
                sqs.push([temp, i])

            } else {
                sqs.push([(temp > 0 ? temp - 1 : 0), i])

            }
            temp = -1
        }
    }
    console.log(temp);
    if (temp !== -1) {
        sqs.push([temp, array.length - 1])
    }

    return sqs;
}


function split_stuff(data) {

    abstr3['High Health'] = split_steps_max(data.health, 51);
    abstr3['Low Health'] = split_steps_min(data.health, 52);


    let ambi = [];
    for (let i = 0; i < data.health.length; i++) {

        let varia = Math.min(vari(data.probabilities[i]) * 10, 1);


        ambi.push(Math.max(0, ((1 - varia > 0.9 ? 1 - varia : (1 - varia) * 0.65))))
    }

    abstr3['High Ambi'] = split_steps_max(ambi, 0.7);
    abstr3['Low Ambi'] = split_steps_min(ambi, 0.69);


    let varu = [];
    for (let i = 3; i < data.orientations.length; i++) {

        // res.push(Math.min(Math.abs(data[i - 3] - data[i - 2]), 360 - Math.abs(data[i - 3] - data[i - 2])) + Math.min(Math.abs(data[i - 2] - data[i - 1]), 360 -Math.abs(data[i - 2] - data[i - 1])) + Math.min(Math.abs(data[i - 1] - data[i]), 360 -Math.abs(data[i - 1] - data[i])))
        varu.push(Math.min(Math.abs(data.orientations[i - 2] - data.orientations[i]), 360 - Math.abs(data.orientations[i - 2] - data.orientations[i])))
    }

    abstr3['High Vari'] = split_steps_max(varu, 20);
    abstr3['Low Vari'] = split_steps_min(varu, 19)

}


function match(from, filter) {

    let res = [];
    for (let i = 0; i < megadata[episode].health.length; i++) {

        let a, b = 0;

        if (cjecin(from, i)) {
            a = 1
        }

        if (cjecin(filter, i)) {
            b = 1;
        }

        if (combtype === "1") {
            if (a || b) {
                res.push(i)
            }
        } else if (combtype === "2") {
            if (a && b) {
                res.push(i)
            }
        }

    }

    return steps2sqs(res);
}


function cjecin(arr, ind) {

    for (let i = 0; i < arr.length; i++) {

        if (arr[i][0] <= ind) {
            if (arr[i][1] >= ind) {
                return true
            }
        } else {
            return false;
        }
    }


}