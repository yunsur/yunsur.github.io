// fix menu and sidebar

// rating
$('.ui.rating')
  .rating('disable')
;

$(document).ready(function() {
    // fix menu when passed
    $('.masthead').visibility({
        once: false,
        onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
        },
        onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
        }
    });
    // create sidebar and attach to menu open
    $('.ui.sidebar').sidebar('attach events', '.toc.item');
});

// loading dimmer
$('.loading-trigger').click(function() {
    $('#page-loading-dimmer').dimmer('show');
});

// progress bar
$('#page-loading-progress').progress({
    total: 1,
    onSuccess: function() {
        $('#page-loading-progress').fadeOut(1000, function() {
            $('#page-loading-progress').remove();
        });
    }
});

function loading(update) {
    if (update) {
        $('#page-loading-progress').progress('increment');
    };
};
loading(true);
setInterval(function() {
    loading(false);
}, 15000);

// masthead background
$('.ui.inverted.masthead.segment').addClass('bg' + Math.ceil(Math.random() * 14)).removeClass('zoomed');