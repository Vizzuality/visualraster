

/**
 * flood fill algorithm 
 * image_data is an array with pixel information as provided in canvas_context.data
 * (x, y) is starting point and color is the color used to replace old color
 */
function flood_fill(image_data, canvas_width, canvas_height, x, y, color) {

    var components = 4; //rgba

    // unpack values
    var  fillColorR = color[0];
    var  fillColorG = color[1];
    var  fillColorB = color[1];

    // get start point
    var pixel_pos = (y*canvas_width + x) * components;
    var startR = image_data[pixel_pos];
    var startG = image_data[pixel_pos + 1];
    var startB = image_data[pixel_pos + 2];

    function matchStartColor(pixel_pos) {
      return startR == image_data[pixel_pos] && 
             startG == image_data[pixel_pos+1] &&
             startB == image_data[pixel_pos+2];
    }

    function colorPixel(pixel_pos) {
      image_data[pixel_pos] = fillColorR;
      image_data[pixel_pos+1] = fillColorG;
      image_data[pixel_pos+2] = fillColorB;
      image_data[pixel_pos+3] = 255;
    }

    var pixelStack = [[x, y]];

    while(pixelStack.length)
    {
      var newPos, x, y, pixel_pos, reachLeft, reachRight;
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];
      
      pixel_pos = (y*canvas_width + x) * components;
      while(y-- >= 0 && matchStartColor(pixel_pos))
      {
        pixel_pos -= canvas_width * components;
      }
      pixel_pos += canvas_width * components;
      ++y;

      var sides = [];
      sides[-1] = false;
      sides[1] = false;

      function trace(dir) {
          if(matchStartColor(pixel_pos + dir*components)) {
            if(!sides[dir]) {
              pixelStack.push([x + dir, y]);
              sides[dir]= true;
            }
          }
          else if(sides[dir]) {
            sides[dir]= false;
          }
      }

      while(y++ < canvas_height-1 && matchStartColor(pixel_pos)) {
        colorPixel(pixel_pos);

        // left side
        if(x > 0) {
            trace(-1);
        }

        // right side
        if(x < canvas_width-1) { 
            trace(1);
        }
        pixel_pos += canvas_width * components;

      }
    }
}
