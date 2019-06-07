onmessage = function (e) {
    window = self;
    importScripts('tsne.js');


    var tsne = new tsnejs.tSNE(e.data[1]);

    tsne.initDataRaw(e.data[0]);

    for (let i = 0; i < 40; i++) {
        for (let k = 0; k < 35; k++) {
                tsne.step()
        }
        postMessage(tsne.getSolution());
    }
};