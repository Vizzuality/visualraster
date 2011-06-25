

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

        function canvas_setup(canvas, coord, zoom) {
          var image = new Image();  
          var ctx = canvas.getContext('2d');
          image.src = "/proxy/mountainbiodiversity.org/env/z" + zoom + "/"+ coord.x + "/" + coord.y +".png";
          canvas.image = image;
          $(image).load(function() { 
                //ctx.globalAlpha = 0.5;
                ctx.drawImage(image, 0, 0);  
                App.heightLayer.filter_tile(canvas, [App.threshold]);
          });
        }

        me.init = function(layer) {
            var map = new google.maps.Map(document.getElementById("map"), this.mapOptions);
            this.heightLayer = layer || new CanvasTileLayer(canvas_setup, filter);
            map.overlayMapTypes.insertAt(0, this.heightLayer);
            this.map = map;
            this.setup_ui();
        }

        me.setup_ui = function() {
            var that = this;
            $("#slider").slider({
                slide: function(event, ui) {  
                    $("#slider_value").html(8000*ui.value/100.0 + " meters");
                    that.threshold = ui.value;
                    that.heightLayer.filter_tiles(ui.value);
                }
            });
        }
        return me;
    }();


