$( document ).ready(function() {
    
    "use strict";
    
    var $image = $(".image-crop > img");

    $image.cropper({
        aspectRatio: 7 / 5,
        preview: ".img-preview"
    });
    
    $("#zoomIn").on('click', function() {
        $image.cropper('zoom', 0.1);
    });

    $("#zoomOut").on('click', function() {
        $image.cropper('zoom', -0.1);
    });

    $("#rotateLeft").on('click', function() {
        $image.cropper('rotate', 45);
    });

    $("#rotateRight").on('click', function() {
        $image.cropper('rotate', -45);
    });
    
    $("#clear").on('click', function() {
        $image.cropper('clear');
    });
    
    var $replaceWith = $('#replaceWith');
    $('#replace').click(function () {
      $image.cropper('replace', $replaceWith.val());
    });
    
});