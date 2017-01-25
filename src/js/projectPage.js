$('#foodFeudButton').on('click', function(event) {
    event.preventDefault();
    $('#foodFeudFrame').attr('src', 'https://itch.io/embed-upload/364731?color=272C2D');
    $(this).hide();
});

$('#litLimoButton').on('click', function(event) {
    event.preventDefault();
    $('#litLimoFrame').attr('src', 'https://itch.io/embed/102358?color=272C2D');
    $(this).hide();
});
