// Tile layer container
function filter(image_data, w, h, threshold) {
    var components = 4; //rgba
    var pixel_pos;
    for(var i=0; i < w; ++i) {
        for(var j=0; j < h; ++j) {
            pixel_pos = (j*w + i) * components;
            if(image_data[pixel_pos] < threshold) {
                image_data[pixel_pos] = image_data[pixel_pos + 1] = image_data[pixel_pos + 2] = 0;
                image_data[pixel_pos + 3] = 0;
            }
        }
    }
};


function CanvasTileLayer() {
    this.threshold = null;
    this.last_threshold = null;
    this.tileSize = new google.maps.Size(256,256);
    this.maxZoom = 19;
    this.name = "Tile #s";
    this.alt = "Canvas tile layer";
    this.tiles = {};
}

// move this to the canvas_tile_layer side
CanvasTileLayer.prototype.canvas_setup = function(canvas, coord, zoom){
    var that = this;
    var image = new Image();  
//    var ctx = canvas.getContext('2d');
    image.src = "http://localhost:8080/proxy/mountainbiodiversity.org/env/z" + zoom + "/"+ coord.x + "/" + coord.y +".png";
    canvas.canvas.image = image;
    $(image).load(function() { 
        canvas.ctx.drawImage(image, 0, 0);  
        that.filter_tile(canvas, that.threshold);
    });								
};

// create a tile with a canvas element
CanvasTileLayer.prototype.create_tile_canvas = function(coord, zoom, ownerDocument) {

    // create canvas and reset style
    var canvas = ownerDocument.createElement('canvas');
    canvas.style.border  = "none";
    canvas.style.margin  = "0";
    canvas.style.padding = "0";

    // prepare canvas and context sizes
    var ctx    = canvas.getContext('2d');
    ctx.width  = canvas.width = this.tileSize.width;
    ctx.height = canvas.height = this.tileSize.height;

    //set unique id 
    var tile_id = coord.x + '_' + coord.y + '_' + zoom;  
    canvas.setAttribute('id', tile_id);

    if (tile_id in this.tiles) 
        delete this.tiles[tile_id];

    this.tiles[tile_id] = {canvas: canvas, ctx: ctx, image_data:ctx.getImageData(0, 0, canvas.width, canvas.height)};

    // custom setup
    if (this.canvas_setup) 
        this.canvas_setup(this.tiles[tile_id], coord, zoom);

    return canvas;
}

CanvasTileLayer.prototype.filter_tiles = function(threshold) {
    this.threshold = threshold;
      for(var c in this.tiles) {
          this.filter_tile(this.tiles[c]);
      }								
    this.last_threshold = threshold;	
};

CanvasTileLayer.prototype.filter_tile = function(canvas_obj) {
    if (this.last_threshold > this.threshold) 
        canvas_obj.ctx.drawImage(canvas_obj.canvas.image, 0, 0); 
    canvas_obj.image_data = canvas_obj.ctx.getImageData(0, 0, canvas_obj.ctx.width, canvas_obj.ctx.height);

    filter(canvas_obj.image_data.data, canvas_obj.ctx.width, canvas_obj.ctx.height, 255.0 * this.threshold / 100.0);
    canvas_obj.ctx.putImageData(canvas_obj.image_data,0,0);						


    //   var filterWorker = new Worker('filter_worker.js');
    // filterWorker.onmessage = function( event ){
    //   console.log(event);
    //     // var live_canvas = that.tiles[event.data.c]
    //     // var live_ctx = canvas.getContext('2d');
    //     // live_ctx.putImageData(event.data.image,0,0);
    //   }; 
    // 
    //   var image_data     = ctx.getImageData(0, 0, canvas.width, canvas.height).data;  
    //   var filter_options = {
    //     image_data: image_data,
    //     width: ctx.width,
    //     height: ctx.height,
    //     threshold: 255.0 * this.threshold / 100.0,
    //     c: c
    //   };
    // 
    //   //
    //   filterWorker.postMessage(filter_options);
    //   
    //   //filter(I.data, ctx.width, ctx.height, 255.0 * this.threshold / 100.0);  
    //   //ctx.putImageData(I,0,0);                   


};														

// could be called directly...
CanvasTileLayer.prototype.getTile = function(coord, zoom, ownerDocument) {
    return this.create_tile_canvas(coord, zoom, ownerDocument);
};

CanvasTileLayer.prototype.releaseTile = function(tile) {
    var id = tile.getAttribute('id');
    delete this.tiles[id];
};
