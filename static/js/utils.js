function toImage(im, clas, styl) {

    return "<img style='" + styl + "' class='" + clas + "' src=\"data:image/jpeg;base64," + im + "\">";
}


function toSrc(im) {

    return "data:image/jpeg;base64," + im ;
}

function tofloat(data) {
    console.log(data);

    data.hiddens = data.hiddens.slice(0, data.hiddens.length).map(function (d) {
        for (let i = 0; i < d.length; i++) {
            d[i] = parseFloat(d[i])
        }
        return d
    });


    data.probabilities = data.probabilities.slice(0, data.probabilities.length).map(function (d) {
        for (let i = 0; i < d.length; i++) {
            d[i] = parseFloat(d[i])
        }
        return d
    });

    return data;
}


function filterValue(obj, key, value) {
    return obj.find(function (v) {
        return v[key] === value
    });
}

Array.prototype.unique = function () {
    let a = this.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

function euclidian_dist(a, b) {
    let sum = 0;

    for (let n = 0; n < a.length; n++) {
        sum += Math.pow(a[n] - b[n], 2)
    }
    return Math.sqrt(sum)
}

function vari(arr) {
    let len = 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === "") {
        }

        else {
            len = len + 1;
            sum = sum + parseFloat(arr[i]);
        }
    }
    let v = 0;
    if (len > 1) {
        let mean = sum / len;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === "") {
            }
            else {
                v = v + (arr[i] - mean) * (arr[i] - mean);
            }
        }
        return v / len;
    }
    else {
        return 0;
    }
}