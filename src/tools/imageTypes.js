// Defines the image types to MIME type
// http://en.wikipedia.org/wiki/Internet_media_type#Type_image

var types = {
  'gif': 'image/gif',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'tiff': 'image/tiff',
  'txt': 'text/plain'
};

for (var type in types) {
  if (types.hasOwnProperty(type)) {
    exports[type] = types[type];
  }
}
