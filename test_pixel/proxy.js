// Quick image proxy in node.js to bypass 
// Cross Site CANVAS tag security

var http = require('http')
    url = require("url"),
    path = require("path"),
    fs = require("fs");

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
        console.log(res.statusCode);

        var headers = res.headers;
        headers['access-control-allow-origin'] = '*';
        headers['access-control-allow-credentials'] = 'true';
        console.log(headers);
        response.writeHead(res.statusCode, headers);

        res.on('data', function (chunk) {
          response.write(chunk, 'binary');
        });
      }).on('end', function(e){
        response.end();
      });
      return;
    }

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
  });    
}).listen(8080);

