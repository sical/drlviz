function mousov() {


    let key = $(this).attr('key').split('-');
    let num = $(this).attr('num');

    let steps;
    if (num !== '0') {

        steps = key2steps(key);
    } else {
        steps = get_act_steps(key[0])
    }

    let sqs = steps2sqs(steps);

    d3.selectAll('.recthf').remove();
    d3.selectAll('.txthf').remove();
    sqs2rule(d3.select('#timelien'), 2, sqs, 'Actions', 'hf');
    hiddencrops[0] = sqs;
    mega_draw_matrix(megadata[episode].hiddens, d3.select('#matrix-canvas').node().getContext('2d'), col, can_pad, memst, hiddencrops[1], hiddencrops[2], hiddencrops[0]);

}


function get_act_steps(act) {

    let res = [];

    for (let i = 0; i < megadata[episode].actions.length; i++) {

        if (megadata[episode].actions[i] === act) {
            res.push(i)
        }
    }

    return res;
}

function key2steps(key) {


    let res = [];

    let nb = key.length;
    let threshold = (1 / (nb + 1));

    for (let i = 0; i < megadata[episode].probabilities.length; i++) {

        let temp = d3.range(actions.length).map(() => {
            return 0
        });

        for (let j = 0; j < megadata[episode].probabilities[i].length; j++) {

            if (megadata[episode].probabilities[i][j] >= threshold) {

                temp[j] += 1;
            }
        }
        let tr = true;

        for (let j = 0; j < key.length; j++) {

            if (temp[key[j]] === 0) {
                tr = false;
                break;
            }
        }

        if (tr) {

            res.push(i);
        }
    }

    return res


}

function draw_details(dic, num) {

    let svg = d3.select('#up-main');
    d3.selectAll('.detail_row').remove();

    num = parseInt(num);

    let tnum = num;
    num = (num > 0 ? num : 1);

    let items = Object.keys(dic).map(function (key) {
        return [key, dic[key]];
    });

    items.sort(function (first, second) {
        return second[1] - first[1];
    });


    let scale = d3.scaleLinear().domain([0, items[0][1]]).range([4, 100]);

    let offset = actions.length + 4;

    for (let i = 0; i < items.length; i++) {

        let g = svg.append('g')
            .attr('class', 'detail_row')
            .attr('key', items[i][0])
            .attr('num', tnum)
            .on('click', mousov);


        g.append('text')
            .attr('class', 'detail_txt')
            .attr("font-family", "Verdana")
            .attr("font-size", 20)
            .attr('y', (i * col_size) + (offset * col_size))
            .attr('x', '0')
            .html(key2pic(items[i][0]));


        g.append('rect')
            .attr('class', 'bar')
            .attr('width', scale(items[i][1]))
            .attr('height', '15')
            .attr('fill', 'steelblue')
            .attr('y', ((i * col_size) + (offset * col_size) - 15))
            .attr('x', ((20) * num + 2));

        g.append('text')
            .attr('class', 'detail_tool')
            .attr("font-family", "Verdana")
            .attr("font-size", 15)
            .attr('y', (i * col_size) + (offset * col_size) - 5)
            .attr('x', ((20) * num + 2) + 10 + scale(items[i][1]))
            .html(items[i][1]);
    }
}


function key2pic(key) {

    key = key.split("-");

    let symbs = "";

    for (let i = 0; i < key.length; i++) {
        symbs += actions[parseInt(key[i])] + " "
    }

    return symbs
}


function prefillsvg() {


    let svg = d3.select('#up-main');

    for (let i = 0; i <= actions.length; i++) {

        if (!i) {

            svg.append('rect')
                .attr('class', 'head_actions')
                .attr("stroke", "#000")
                .attr("stroke-width", "0.2px")
                .attr('width', col_size)
                .attr('height', col_size)
                .attr('fill', 'none')
                .attr('y', '10')
                .attr('x', col_size * i);
            svg.append('text')
                .attr("font-family", "Verdana")
                .attr("font-size", 30)
                .attr('y', 10 + 25)
                .attr('x', (i * col_size) +7)
                .html('#')

        } else {

            svg.append('rect')
                .attr('class', 'head_actions')
                .attr("stroke", "#000")
                .attr("stroke-width", "0.2px")
                .attr('width', col_size)
                .attr('height', col_size)
                .attr('fill', 'none')
                .attr('y', '10')
                .attr('x', col_size * i);
            svg.append('text')
                .attr("font-family", "Verdana")
                .attr("font-size", 24)
                .attr('y', 10 + 25)
                .attr('x', (i * col_size) + 5)
                .html(actions[i - 1])
        }
    }

    // make_episode();
    make_combo();

}


function detail_combo(nb) {


    nb = parseInt(nb);
    let dic = {};

    if (nb > 0) {
        let threshold = (1 / (nb + 1));


        const reducer = (accumulator, currentValue) => accumulator + currentValue;


        for (let i = 0; i < megadata[episode].probabilities.length; i++) {

            let temp = d3.range(actions.length).map(() => {
                return 0
            });

            for (let j = 0; j < megadata[episode].probabilities[i].length; j++) {

                if (megadata[episode].probabilities[i][j] >= threshold) {

                    temp[j] += 1;
                }
            }

            if (temp.reduce(reducer) === nb) {

                let key = "";
                for (let j = 0; j < temp.length; j++) {

                    if (temp[j] === 1) {
                        key += j + "-"
                    }

                }

                key = key.slice(0, -1);
                if (dic[key] !== undefined) {
                    dic[key] += 1
                }
                else {
                    dic[key] = 1
                }
            }
        }

    } else {


        for (let i = 0; i < megadata[episode].probabilities.length; i++) {

            let tid = -1;
            let tproba = 0;

            for (let j = 0; j < megadata[episode].probabilities[i].length; j++) {

                if (tproba < megadata[episode].probabilities[i][j]) {

                    tproba = megadata[episode].probabilities[i][j];
                    tid = j;
                }

            }
            if (dic['' + tid] === undefined) {
                dic['' + tid] = 1
            } else {
                dic['' + tid] += 1
            }
        }

    }

    return dic
}


function up_clean() {

    let svg = d3.select('#up-main');


    svg.selectAll('.row').remove();
}


function fill_row(step, proba, scale) {


    let svg = d3.select('#up-main');
    let g = svg.append('g')
        .attr('class', 'row')
        .attr('num', step);

    for (let i = 0; i <= proba.length; i++) {

        if (!i) {


            g.append('rect')
                .attr('class', 'row_title')
                .attr("stroke", "#000")
                .attr("stroke-width", "0.2px")
                .attr('width', col_size)
                .attr('height', col_size)
                .attr('fill', 'none')
                .attr('y', ((step + 1) * col_size) + 10)
                .attr('x', col_size * i);
            g.append('text')
                .attr('class', 'row_txt')
                .attr("font-family", "Verdana")
                .attr("font-size", 20)
                .attr('y', ((step + 1) * col_size) + 30)
                .attr('x', (i * col_size) + 10)
                .html(step)
        } else {


            g.append('rect')
                .attr('class', 'row_actions')
                .attr("stroke", "#000")
                .attr("stroke-width", "0.2px")
                .attr('width', col_size)
                .attr('height', col_size)
                .attr('fill', 'none')
                .attr('y', ((step + 1) * col_size) + 10)
                .attr('x', col_size * i);

            g.append('rect')
                .attr('class', 'fillbar')
                .attr('width', col_size - 1.5)
                .attr('height', scale(proba[i - 1]))
                .attr('fill', 'steelblue')
                .attr('y', (((step + 2) * col_size) + 9.5) - (scale(proba[i - 1])))
                .attr('x', (col_size * i) + 1)


        }
    }
}


function make_episode() {


    for (let i = 0; i < megadata[episode].probabilities.length; i++) {
        fill_row(i, megadata[episode].probabilities[i], d3.scaleLinear().domain([0, 1]).range([0, col_size]));


        if (i === 9) {
            break;
        }
    }

}


function get_number() {

    let res = d3.range(actions.length).map(() => {
        return 0
    });


    for (let i = 0; i < megadata[episode].probabilities.length; i++) {

        let tid = -1;
        let tproba = 0;

        for (let j = 0; j < megadata[episode].probabilities[i].length; j++) {

            if (tproba < megadata[episode].probabilities[i][j]) {

                tproba = megadata[episode].probabilities[i][j];
                tid = j;
            }

        }
        res[tid] += 1;
    }
    return res;
}

function make_combo() {

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    for (let i = 0; i < 9; i++) {
        let array;
        if (i === 0) {
            array = get_number()
        } else {
            array = find_frequency(i);

        }

        fill_row(i, array, d3.scaleLinear().domain([0, array.reduce(reducer)]).range([0, col_size]));

    }

}


function find_frequency(nb) {

    let threshold = (1 / (nb + 1));


    const reducer = (accumulator, currentValue) => accumulator + currentValue;


    let res = d3.range(actions.length).map(() => {
        return 0
    });


    for (let i = 0; i < megadata[episode].probabilities.length; i++) {

        let temp = d3.range(actions.length).map(() => {
            return 0
        });

        for (let j = 0; j < megadata[episode].probabilities[i].length; j++) {

            if (megadata[episode].probabilities[i][j] >= threshold) {

                temp[j] += 1;
            }
        }

        if (temp.reduce(reducer) === nb) {

            for (let j = 0; j < temp.length; j++) {

                if (temp[j] === 1) {
                    res[j] += 1
                }
            }

        }

    }


    return res
}