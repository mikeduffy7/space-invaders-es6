$(document).ready(function () {

    let icons = ['up', 'right', 'down', 'left'];

    function displayIcons() {
        for (var i = 0; i < icons.length; i++) {
            show(i);
        }
    }
    
    function show(i) {
        setTimeout(function() {
            $('#arrow-cycle').html('<h1><i class="fa fa-5x fa-arrow-circle-o-' + icons[i] + '" aria-hidden="true"></i></h1> ')
        }, 1000 + i * 1000);
    }

    displayIcons();
});
