
Visual raster tests
===================

This repo contains some examples of per pixel image processing using HTML5 canvas element and some javascript code. There are 3 examples:

 - flood_fill.html: shows how to use [flood fill](http://en.wikipedia.org/wiki/Flood_fill) technique.
 - contour_tracing.html: search contour for shapes with the same color. Clicking on the image the contour of the selected color is highlight.
 - threshold.html: filter image based on a threshold changed by user. In this example an altitude map is shown and can be filtered using a slider.


In order to run examples you should put files in a public folder of your http server. This is because security issues with cross domain images using canvas element:

    $ git clone git://github.com/Vizzuality/visualraster.git
    $ cd test_pixel
    $ python -m SimpleHTTPServer
    $ open http://localhost:8000 (on osx)


this is a WIP, enjoy :)
  





