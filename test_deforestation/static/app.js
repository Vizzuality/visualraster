
// optimized version for threshold rendering
function CanvasTileLayerThreshold (canvas_setup, filter) {
    CanvasTileLayer.call(this, canvas_setup, filter);
    this.threshold = 0;
}

CanvasTileLayerThreshold.prototype = new CanvasTileLayer();

CanvasTileLayerThreshold.prototype.filter_tiles = function() {
    var new_threshold = arguments[0];
    CanvasTileLayer.prototype.filter_tiles.apply(this, arguments)
    this.threshold = new_threshold;
}

CanvasTileLayerThreshold.prototype.filter_tile = function(canvas, args) {
    var new_threshold = args[0];
    var ctx = canvas.getContext('2d');
    ctx.drawImage(canvas.image, 0, 0);  
    var I = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.filter.apply(this, [I.data, ctx.width, ctx.height].concat(args));
    ctx.putImageData(I,0,0);
}

var App = function() {
        var me = {
            mapOptions: {
                zoom: 3,
                center: new google.maps.LatLng(41.850033,-87.6500523),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        };

        function filter(image_data, w, h, threshold) {
            var components = 4; //rgba
            var pixel_pos;
            console.log(threshold);
            for(var i=0; i < w; ++i) {
                for(var j=0; j < h; ++j) {
                    var pixel_pos = (j*w + i) * components;
                    var yearLoss = image_data[pixel_pos];
                    var intensity = image_data[pixel_pos + 1];
                    //var intensity = 0;
                    /*if(yearLoss > 0) {
                        image_data[pixel_pos] = intensity;
                        image_data[pixel_pos + 1] = 0;
                        image_data[pixel_pos + 2] = 0;
                        image_data[pixel_pos + 3] =  255;
                    }*/
                    if(yearLoss) {
                      yearLoss = 2000 + yearLoss;
                      //intensity = 255 - image_data[pixel_pos + 1];
                      if(yearLoss < threshold) {
                        image_data[pixel_pos] = intensity;
                        image_data[pixel_pos + 1] = 0;
                        image_data[pixel_pos + 2] = 0;
                        image_data[pixel_pos + 3] =  intensity < 10 ? 0: 255;
                      } else {
                        image_data[pixel_pos + 3] = 0;
                      }
                    } else {
                      image_data[pixel_pos + 3] = 0;
                    }
                }
            }
        };

        function canvas_setup(canvas, coord, zoom) {
          var image = new Image();  
          var ctx = canvas.getContext('2d');
          image.crossOrigin = '';
          image.src = 'http://earthengine.google.org/static/hansen_2013/gfw_loss_year/' + zoom + "/"+ coord.x + "/" + coord.y +".png";
          canvas.image = image;
          $(image).load(function() { 
                //ctx.globalAlpha = 0.5;
                ctx.drawImage(image, 0, 0);  
                App.heightLayer.filter_tile(canvas, [App.threshold]);
          });
        }

        me.init = function(layer) {
            var map = new google.maps.Map(document.getElementById("map"), this.mapOptions);
            this.heightLayer = layer || new CanvasTileLayerThreshold(canvas_setup, filter);
            map.overlayMapTypes.insertAt(0, this.heightLayer);
            this.map = map;
            this.setup_ui();
        }

        me.setup_ui = function() {
            var that = this;
            $("#slider").slider({
                slide: function(event, ui) {  
                    var v = (2000 + 13*ui.value/100) | 0;
                    $("#slider_value").html("year " + v);
                    that.threshold = v
                    that.heightLayer.filter_tiles(v);
                }
            });
        }
        return me;
    }();


