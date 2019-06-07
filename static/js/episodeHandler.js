function inieplist() {

    let epl = $('#epilist');


    for (let i = 0; i < nb_ep; i++) {
        epl.append(gen_ep(i));
    }

    $("div[class^='boxep']").css('opacity', '0.5');
    $('.boxep').css('opacity', '1')

}

function gen_ep(epn) {
    return '<div  class="epbox" style="background-color: ' + colors[epn] + ';" id="boxep' + epn + '"><p> ' + epn + ' </p> </div>'
}


function switchep(data, tepisode) {
    if (!data[tepisode].actions[whichstep]) {
        whichstep = data[tepisode].actions.length - 1
    }
    episode = tepisode;
    changeHighlight()

}


function megamerge() {

    console.log('Merging');
    let all = {};

    delete megadata['all'];
    let tkeys = Object.keys(megadata[episode]);
    let mkeys = Object.keys(megadata);

    for (let i = 0; i < tkeys.length; i++) {

        all[tkeys[i]] = [];
    }


    for (let k = 0; k < mkeys.length; k++) {


        for (let i = 0; i < tkeys.length; i++) {

            all[tkeys[i]] = all[tkeys[i]].concat(megadata[mkeys[k]][tkeys[i]])
        }
    }


    megadata['all'] = all;
    console.log('done Merging');
    episode = 'all'
}