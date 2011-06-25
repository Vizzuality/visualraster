
from __future__ import with_statement

import os
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import urlfetch
from google.appengine.api import files
from google.appengine.ext.webapp import blobstore_handlers
from  google.appengine.ext.blobstore  import  BlobInfo
from google.appengine.ext import blobstore

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'templates', 'index.html')
        self.response.out.write(template.render(path, {}))

class NFDI(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'templates', 'nfdi.html')
        self.response.out.write(template.render(path, {}))



def save_image(data):
    path = files.blobstore.create(mime_type='image/png')
    with files.open(path, 'a') as f:
      f.write(data)
    files.finalize(path)
    return  BlobInfo.get(files.blobstore.get_blob_key(path))
"""
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        self.send_blob(blob_info)
"""

class ImageCache(db.Model):
    img_path = db.StringProperty()
    blob = blobstore.BlobReferenceProperty()

    @staticmethod
    def get_for_path(path):
        k = ImageCache.all().filter("img_path =", path).fetch(1)
        if k:
            return k[0].blob

class ImageProxyCache(blobstore_handlers.BlobstoreDownloadHandler):

    def get(self, images_url, path):
        key = images_url + "/" + path
        k = ImageCache.get_for_path(key)
        if not k:
            url = "http://%s/%s" % (images_url, path)
            result = urlfetch.fetch(url +'?'+ self.request.environ['QUERY_STRING'])
            if result.status_code == 200:
                k = save_image(result.content)
            ImageCache(blob=k, img_path=key).put();

        self.response.headers['Expires'] = 'Thu, 15 Apr 2020 20:00:00 GMT'
        self.send_blob(k)

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/nfdi', NFDI),
                                      ('/proxy/(.*)/(.*)', ImageProxyCache)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
