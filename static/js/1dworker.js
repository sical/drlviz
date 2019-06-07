onmessage = function (e) {
    window = self;
    importScripts('tsne.js');


    var tsne = new tsnejs.tSNE(e.data[1]);

    tsne.initDataRaw(e.data[0]);

    for (let i = 0; i < 250; i++) {
        tsne.step();
    }

    postMessage(tsne.getSolution());

};