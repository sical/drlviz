function dragElement(elmnt) {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;


    var inc1 = false;
    var inc2 = false;

    var click = false;

    var time;


    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        click = false;


        pos3 = e.clientX;//- elmnt.offsetLeft;
        pos4 = e.clientY;//- elmnt.offsetTop;
        //$(elmnt).css('position', 'absolute');
        $(elmnt).css('top', pos4);


        $('.main-canvas').css('display', 'inline-block');
        $('.diff-canvas').remove();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;//- elmnt.offsetLeft;
        pos4 = e.clientY;//- elmnt.offsetTop;
        //$(elmnt).css('position', 'absolute');


        console.log($(elmnt).offset()['left']);

        $(elmnt).css('top', pos4);
        $(elmnt).css('left', $(elmnt).offset()['left']);

        /*    time = setTimeout(function () {
                click = true;
            }, 70)*/


        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;

    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();


        // calculate the new cursor position:
        pos1 = (e.clientX - $(elmnt).width() / 2); //- pos3);
        pos2 = (e.clientY - $(elmnt).height() / 2);
        // pos3 = e.screenX;
        // pos4 = e.screenY;
        // set the element's new position:
        $(elmnt).css('position', 'absolute');
        elmnt.style.top = pos2 + "px";
        //   elmnt.style.left = pos1 + "px";


    }

    function closeDragElement() {
    $(elmnt).css('position', '');
        document.onmouseup = null;
        document.onmousemove = null;

    }
}