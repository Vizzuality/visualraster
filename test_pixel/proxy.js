// Quick image proxy in node.js to bypass 
// Cross Site CANVAS tag security

var http = require('http')
    url  = require("url"),
    path = require("path"),
    fs   = require("fs");

http.createServer(function(request, response) {
  var   uri      = url.parse(request.url).pathname
      , filename = path.join(process.cwd(), uri);

  path.exists(filename, function(exists) {
    if(!exists) {
      // doesn't exist so proxy out
      var options = {
          host         : "visualraster.appspot.com"
        , port         : 80
        , path         : request.url
        , method       : 'GET'
      }

      http.get(options, function(res){

        var headers = res.headers;
        headers['access-control-allow-origin'] = '*';
        headers['access-control-allow-credentials'] = 'true';
        response.writeHead(res.statusCode, headers);

        res.on('data', function (chunk) {
          response.write(chunk, 'binary');
        });
        
        res.on('end', function(e){
          response.end();
        });        
      });
      
    } else {
      // does exist, so pull file from disk and send to browser
  	  if (fs.statSync(filename).isDirectory()) filename += '/index.html';

      fs.readFile(filename, "binary", function(err, file) {
        if(err) {        
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }

        response.writeHead(200);
        response.write(file, "binary");
        response.end();
      });       
    }
  });    
}).listen(8080);

