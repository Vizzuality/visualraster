onmessage = function (event) {

    var image_data = event.data.image_data;
    var width     = event.data.width;
    var height    = event.data.height;
    var threshold = event.data.threshold;
    var c         = event.data.c;



    function filter(image_data, w, h, threshold) {
        var components = 4; //rgba
        var pixel_pos;
        for(var i=0; i < w; ++i) {
            for(var j=0; j < h; ++j) {
                var pixel_pos = (j*w + i) * components;
                if(image_data[pixel_pos] < threshold) {
                    image_data[pixel_pos] = image_data[pixel_pos + 1] = image_data[pixel_pos + 2] = 0;
                    image_data[pixel_pos + 3] = 0;
                }
            }
        }
    };  

    var processed_image = filter(image_data, width, height, threshold);

    postMessage({status: 'complete', image_data: processed_image, c: c});
};







