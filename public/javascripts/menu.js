$(document).ready(function(){
    let element = $('meta[name="active-menu"]').attr('content');
    $('#' + element).addClass('active');
});




