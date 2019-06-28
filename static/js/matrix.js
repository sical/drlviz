let elem_width = 1.1;
let elem_height = 1.1;
let cw = 1.432;
let mem_height = 750;
let gap = cw * 0.25;
let sort_change = false;
let old_sort = '-1';
let old_res;

function draw_matrix(data, context, colorScale, offx, offy, nb, rwidth) {

    context.clearRect(0, offy, 99900, mem_height + 20);
    let nsize = (mem_height / nb);

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < nb; j++) {
            canvas_draw(colorScale(data[i][j]), i, offy, context, cw, nsize, j)
        }
    }
}

function canvas_draw(color, offx, offy, context, telem_width, telem_height, ind) {
    // let deye = fisheye({"x": (offx * elem_width), "y": offy * elem_height});

    context.fillStyle = color;
    context.fillRect(offx * (telem_width), (parseFloat(ind + 0.01) * parseFloat(telem_height)) + offy, telem_width, telem_height);


    // context.rect(deye.x, deye.y, (deye.z * (elem_width + 0.05)), (deye.z * (elem_width + 0.05)));


}


function draw_sorted_matrix(data, context, colorScale, offx, offy, activ, nb) {
    let nsize = (mem_height / nb);
    context.clearRect(0, offy, 99900, mem_height + 20);
    let order = temp_sortToinstBig(data, activ);
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < nb; j++) {
            canvas_draw(colorScale(data[i][order[j].ind]), i, offy, context, cw, nsize, j)
        }
    }
}


function temp_sortToinstBig(data, activ) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}
        });


    for (let k = 0; k < activ.length; k++) {

        for (let i = 0; i < activ[k][1] - activ[k][0]; i++) {
            for (let j = 0; j < tempres.length; j++) {
                tempres[j].diff += Math.abs(data[activ[k][0] + i][j])
            }
        }
    }
    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });

    console.log(tempres);
    return tempres;
}


/// -------------------------------         New stuff there      ----------------------------------------------------//


function new_sortToinstBig(data) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}
        });

    for (let k = 0; k < data.length; k++) {

        for (let j = 0; j < tempres.length; j++) {
            tempres[j].diff += Math.abs(data[k][j])
        }
    }

    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });


    return tempres;
}


function new_sort1dproj(data) {


    let perElem = data[0].map(function (col, i) {
        return data.map(function (row) {
            return row[i];
        });
    });


    var tsne = new tsnejs.tSNE({epsilon: 10, perplexity: 20, dim: 1});

    tsne.initDataRaw(perElem);


    for (let i = 0; i < 150; i++) {
        tsne.step();
    }

    let tempres = tsne.getSolution().map(function (d, i) {

        return {diff: d[0], ind: i}
    });

    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });

    return tempres;
}


function new_sort1dprojabs(data) {

    let perElem = data[0].map(function (col, i) {
        return data.map(function (row) {
            return Math.abs(row[i]);
        });
    });

    var tsne = new tsnejs.tSNE({epsilon: 10, perplexity: 20, dim: 1});

    tsne.initDataRaw(perElem);


    for (let i = 0; i < 150; i++) {
        tsne.step();
    }

    let tempres = tsne.getSolution().map(function (d, i) {

        return {diff: d[0], ind: i}
    });

    tempres.sort(function (x, y) {
        return d3.ascending(x.diff, y.diff);
    });


    return tempres;
}


function new_sortTotDiff(data) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}
        });

    for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < tempres.length; j++) {
            tempres[j].diff += Math.abs(data[i][j] - data[i + 1][j])
        }
    }
    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });
    return tempres;
}

function new_sortStable(data) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i}
        });

    for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < tempres.length; j++) {
            tempres[j].diff += Math.abs(data[i][j] - data[i + 1][j])
        }
    }

    tempres.sort(function (x, y) {
        return d3.ascending(x.diff, y.diff);
    });

    return tempres;

}


function new_sortSim(data, gdata, hact) {

    let num = data[0].length;
    let tempres = Array.apply(null, Array(num))
        .map(function (d, i) {
            return {diff: 0, ind: i, sum: 0}
        });

    for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < tempres.length; j++) {
            tempres[j].sum += data[i][j]
        }
    }

    for (let j = 0; j < tempres.length; j++) {
        tempres[j].diff = Math.abs((tempres[j].sum / data.length) - average(checkline(gdata, hact.slice(), j)));
    }

    console.log(tempres);

    tempres.sort(function (x, y) {
        return d3.descending(x.diff, y.diff);
    });

    return tempres;
}


function mega_draw_matrix(data, context, colorScale, offx, offy, vactivs, zoom, hactivs) {

    let rdata = hiddenHandler(data, vactivs, zoom, hactivs, sortype);

    console.time('Drawing matrix');
    context.clearRect(0, 0, 99900, 915);

    let size = Math.min((mem_height / rdata[0].length), 60);

    if (hactivs.length > 0) {
        let nb = 0;

        if (compact) {

            let tot = 0;
            for (let h = 0; h < hactivs.length; h++) {
                tot += hactivs[h][1] - hactivs[h][0]
            }

            //  let c_st = ((((twidth - 6))) / 2) / ratio;// - ((tot * cw) + (gap * hactivs.length));
            let c_st = (data.length / 2) - tot / 2;
            console.log(c_st);

            for (let h = 0; h < hactivs.length; h++) {
                let tgap = gap * h;
                for (let i = hactivs[h][0]; i < hactivs[h][1]; i++) {

                    for (let j = 0; j < rdata[nb].length; j++) {

                        canvas_draw(colorScale(rdata[nb][j]), c_st + tgap + nb, offy, context, cw, size, j)
                    }

                    nb++
                }
                make_link(context, [hactivs[h][0] * cw, 20.5], [hactivs[h][1] * cw, 20.5], [(c_st + tgap + nb) * cw, offy], [(c_st + tgap + (nb - (hactivs[h][1] - hactivs[h][0]))) * cw, offy]);
                make_link(context, [hactivs[h][1] * cw, 915], [hactivs[h][0] * cw, 915], [(c_st + tgap + (nb - (hactivs[h][1] - hactivs[h][0]))) * cw, offy + (rdata[0].length * size)], [(c_st + tgap + nb) * cw, offy + (rdata[0].length * size)]);

            }

        } else {
            for (let h = 0; h < hactivs.length; h++) {

                for (let i = hactivs[h][0]; i < hactivs[h][1]; i++) {

                    for (let j = 0; j < rdata[nb].length; j++) {

                        canvas_draw(colorScale(rdata[nb][j]), i, offy, context, cw, size, j)
                    }
                    nb++
                }
            }

        }
    }
    else {

        let l = rdata.length;
        let l2 = rdata[0].length;
        for (let i = 0; i < l; i++) {
            for (let j = 0; j < l2; j++) {
                canvas_draw(colorScale(rdata[i][j]), i, offy, context, cw, size, j)
            }
            context.save();
        }

        context.restore()
    }
    console.timeEnd('Drawing matrix');
}

function make_link(context, p1, p2, p3, p4) {
    context.fillStyle = 'rgba(35, 62, 52,0.7)';
    context.beginPath();
    context.moveTo(p1[0], p1[1]);
    context.lineTo(p2[0], p2[1]);
    context.lineTo(p3[0], p3[1]);
    context.lineTo(p4[0], p4[1]);
    context.fill();
    context.closePath();
}


function draw_cropped_matrix(data, context, colorScale, offx, offy, activ) {


    mega_draw_matrix(data, context, colorScale, offx, offy, activ, 0, [[60, 190]])


    // console.log(hiddenHandler(data, activ, 0, [[30, 90]], false));
    /*
        context.clearRect(0, offy, 900, mem_height + 20);

        let crop = croptry(data, activ);
        cropped.sel = crop;

        console.log(crop);


        let size = Math.min((mem_height / crop.length), 25);

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < crop.length; j++) {
                canvas_draw(colorScale(data[i][crop[j]]).replace(')', ', ' + (inactiv(i, activ) ? '1' : '0.9') + ')').replace('rgb', 'rgba'), i, offy, context, cw, size, j)
            }
        }*/
}

function inactiv(ind, activ) {

    for (let i = 0; i < activ.length; i++) {

        if (ind > activ[i][0] && ind < activ[i][1]) {
            return true
        }
    }

    return false
}

function croptry(data, activ) {

    let res = [];
    cropped.avgs = [];

    for (let i = 0; i < data[0].length; i++) {

        let temp = get_elemAct(data, activ, i);

        let tvari = vari(temp) * 100;
        let actavg = average(temp);

        if (tvari < 14 && (actavg < -0.1 || actavg > 0.1)) { // Change Tvari to control stability selector

            let ntemp = checkline(data, activ.slice(), i);
            if (Math.abs(average(ntemp) - actavg) > 0.25) { // Lower for less diff between activ and other.
                res.push(i);
                cropped.avgs.push(actavg)
            }
        }
    }
    return res;
}


function checkline(data, activ, id) {

    let vect = [];

    for (let i = 0; i < data.length; i++) {

        if (activ[0]) {
            if (i < activ[0][0]) {

                vect.push(data[i][id])

            } else if (i >= activ[0][1]) {
                activ.shift()
            }
        }
    }
    return vect
}


function get_elemAct(data, activ, id) {
    let res = [];

    for (let i = 0; i < activ.length; i++) {
        for (let j = activ[i][0]; j <= activ[i][1]; j++) {
            res.push(data[j][id])
        }
    }

    return res
}

function update_size(height, nb) {
    elem_height = height / nb
}


function sortAll(top, rdata, glob, hactivs) {

    let skip = false;
    let tempres;

    if (old_sort !== top) {

        switch (top) {
            case "1":
                tempres = new_sortToinstBig(rdata);
                break;
            case "2":
                tempres = new_sortTotDiff(rdata);
                break;
            case "3":
                tempres = new_sortStable(rdata);
                break;
            case "4":
                tempres = new_sortSim(rdata, megadata[episode].hiddens, hactivs);
                break;
            case "5":
                tempres = new_sort1dproj(rdata);
                break;

            case "6":
                tempres = new_sort1dprojabs(rdata);
                break;
            default:
                skip = true;
        }
        old_sort = top;

        if (!skip) {

            let res = tempres.map(function (d) {
                return d.ind
            });

            old_res = res;
            ve_update_reorder(d3.select('#currhidd'), megadata[episode].hiddens[whichstep], res);

            let sorted_data = [];

            for (let k = 0; k < rdata.length; k++) {
                sorted_data.push([]);
                for (let j = 0; j < res.length; j++) {
                    sorted_data[k].push(rdata[k][res[j]])
                }
            }
            return sorted_data;
        } else {
            old_res = d3.range(rdata[0].length);
            ve_update_reorder(d3.select('#currhidd'), megadata[episode].hiddens[whichstep], old_res);
            return rdata
        }

    } else {

        if (top !== '0') {
            let sorted_data = [];
            for (let k = 0; k < rdata.length; k++) {
                sorted_data.push([]);
                for (let j = 0; j < old_res.length; j++) {
                    sorted_data[k].push(rdata[k][old_res[j]])
                }
            }
            return sorted_data
        } else {
            return rdata;
        }
    }

}

// ### vertical activation, zoom,  horizontal activation, sorts by top activations //

function hiddenHandler(data, vactivs, zoomnb, hactivs, top) {

    //  console.time('Handeling data');
    let rdata = data.slice();

    if (vactivs.length > 0) {

        //   rdata = [];

        let hid = croptry(data, vactivs);

        zoomnb = hid;


        console.log(hid);
        /* for (let j = 0; j < data.length; j++) {
             let tem = [];
             for (let i = 0; i < hid.length; i++) {

                 tem.push(data[j][hid[i]])
             }
             rdata.push(tem.slice())
         }
 */
    }

    if (hactivs.length > 0) {

        let tdata = rdata.slice();

        rdata = [];

        for (let i = 0; i < hactivs.length; i++) {
            for (let j = hactivs[i][0]; j <= hactivs[i][1]; j++) {
                rdata.push(tdata[j])
            }
        }
    }

    if (vactivs.length === 0)

        rdata = sortAll(top, rdata, megadata[episode].hiddens, hactivs);


    if (zoomnb.length > 0) {

        for (let i = 0; i < rdata.length; i++) {
            // rdata[i] = rdata[i].slice(0, zoomnb.length)
            rdata[i] = zoomnb.map((j, k) => rdata[i][zoomnb[k]])

        }
    }

//    console.timeEnd('Handeling data');
    return rdata;

}

































