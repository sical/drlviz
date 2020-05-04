function draw_metric_line(data, context, offx, offy, scales) {


    let line = d3.line()
        .x(function (d, i) {
            return scales[0](i) + offx;
        })
        .y(function (d) {
            return scales[1](d) + offy;
        })
        .curve(d3.curveLinear)
        .context(context);


    context.beginPath();
    line(data);
    context.lineWidth = 2;
    context.strokeStyle = '#000';
    context.stroke();

}


function event_line(data, context, offx, offy) {

    context.beginPath();
    context.moveTo(0 + offx, 0 + offy);
    context.lineTo(twidth + offx, 0 + offy);
    context.stroke();
    context.closePath();


    let scx = d3.scaleLinear().domain([0, (megadata[episode].health.length - 1)]).range([0, 748.125]);

    for (let i = 1; i < data.length; i++) {
        if (data[i] - data[i - 1] > 2) {
            context.beginPath();
            context.moveTo(scx(i) + offx, 0 + offy);
            context.lineTo(scx(i) + offx, -10 + offy);
            context.strokeStyle = '#7ab642';
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        }
        else if (data[i - 1] - data[i] > 8) {
            context.beginPath();
            context.strokeStyle = '#bf542f';
            context.lineWidth = 2;
            context.moveTo(scx(i) + offx, 0 + offy);
            context.lineTo(scx(i) + offx, 10 + offy);
            context.stroke();
            context.closePath();
        }
    }
}


function stream_acts(data, context, offx, offy) {
    let scx = d3.scaleLinear().domain([0, megadata[episode].health.length]).range([0, ((twidth -5) * ratio)]);
    let scy = d3.scaleLinear().domain([0, 1]).range([0, 75]);

    let colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5"];

    // context.scale(3, 3);
    for (let i = 0; i < data.length; i++) {
        let bheight = 0;
        draw_stream_action(context, scx(i) + offx, scy(0) + offy, scy(data[i][0]), colors[0]);

        for (let j = 1; j < data[i].length; j++) {
            bheight += scy(data[i][j - 1]);
            draw_stream_action(context, scx(i) + offx, bheight + offy, scy(data[i][j]), colors[j]);

        }
    }
}


function draw_stream_action(context, x1, y1, y2, color) {

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x1, y1 + y2);
    context.lineWidth = cw;
    context.strokeStyle = color;
    context.stroke();
    context.closePath();

}