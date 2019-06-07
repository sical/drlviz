let col_elem_width = 3;
let col_elem_height = 1.4;
let anc;
let can_height = 878;

function setup(data, context, an1, an2, step, colorScale, order, bunch, pad) {
    let chunk1 = data.slice(Math.max(0, (step - an1) - 1), Math.max(0, step - 1));
    let chunk2 = data.slice(step + 1, Math.min(data.length, (step + an2 + 1)));
    context.clearRect(0, 0, 1000, 1000);

    if (bunch < 510)

        update_size(can_height, bunch);

    if (order === 0) {

        draw_chunk(chunk1, context, colorScale, 34, pad, 1, bunch);
        draw_chunk(chunk2, context, colorScale, (col_elem_width * an1) + 46, pad, 2, bunch);
        draw_hidden_step(data[step], context, colorScale, 20, pad);

    } else if (order === 1) {

        let ord = sortTotDiff(data);

        draw_chunk_ordered(chunk1, context, colorScale, 40, pad, ord, 1, bunch);
        draw_chunk_ordered(chunk2, context, colorScale, (col_elem_width * an1) + 70, pad, ord, 2, bunch);
        draw_hidden_step_ordered(data[step], context, colorScale, 40, pad, ord);

    } else if (order === 2) {

        let ord = sortToinstBig(data);

        draw_chunk_ordered(chunk1, context, colorScale, 40, pad, ord, 1, bunch);
        draw_chunk_ordered(chunk2, context, colorScale, (col_elem_width * an1) + 70, pad, ord, 2, bunch);
        draw_hidden_step_ordered(data[step], context, colorScale, 40, pad, ord);
    }
    anc = an1;
}


function draw_chunk_ordered(chunk, context, colorScale, offx, offy, order, nb, bunch) {

    update_size(can_height, bunch);
    for (let i = 0; i < chunk.length; i++) {
        chunk[i].every(function (value, w) {
            if (w > bunch)
                return false;
            if (nb === 1 && chunk.length < anc) {
                canvas_draw(colorScale(chunk[i][order[w].ind]), (anc - 1 - i) + offx, w + offy, context, col_elem_width, col_elem_height)
            } else {
                canvas_draw(colorScale(chunk[i][order[w].ind]), i + offx, w + offy, context, col_elem_width, col_elem_height)
            }

            return true
        });
    }
}

function draw_chunk(chunk, context, colorScale, offx, offy, nb, bunch) {
    update_size(can_height, bunch);
    for (let i = 0; i < chunk.length; i++) {

        chunk[i].every(function (value, w) {
            if (w > bunch)
                return false;
            if (nb === 1 && chunk.length < anc) {
                canvas_draw(colorScale(value), (anc - 1 - i) + offx, w + offy, context, col_elem_width, col_elem_height)
            } else {
                canvas_draw(colorScale(value), i + offx, w + offy, context, col_elem_width, col_elem_height)
            }

            return true

        });
    }
}


function update_size(height, nb) {
    col_elem_height = height / nb
}


function draw_hidden_step(data, context, colorScale, offx, offy) {

    for (let i = 0; i < data.length; i++) {
        canvas_draw(colorScale(data[i]), anc + offx, i + offy, context, col_elem_width * 2, col_elem_height)
    }
}

function draw_hidden_step_ordered(data, context, colorScale, offx, offy, order) {

    for (let i = 0; i < data.length; i++) {
        canvas_draw(colorScale(data[order[i].ind]), anc + offx, i + offy, context, col_elem_width * 2, col_elem_height)
    }
}


/** ------------------------ Sort Methods ------------------------------------------- **/

function sortTotDiff(data) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}

        });

    for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < tempres.length; j++) {
            tempres[j].diff += Math.abs(data[i][tempres[j].ind] - data[i + 1][tempres[j].ind])
        }
    }
    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });
    return tempres
}


function sortToinstBig(data) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}
        });

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < tempres.length; j++) {
            tempres[j].diff += Math.abs(data[i][j])
        }
    }
    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });
    return tempres;
}


/** ------------------------ Events ------------------------------------------- **/



function get_elem_id(data, point, nb, order) {


    if (order === 0) {
        return Math.floor(point[1] / (can_height / nb))


    } else if (order === 1) {
        let ord = sortTotDiff(data);

        return ord[Math.floor(point[1] / (can_height / nb))].ind


    } else if (order === 2) {
        let ord = sortToinstBig(data);
        return ord[Math.floor(point[1] / (can_height / nb))].ind


    }

}



















