// Tile Math Functions from OpenStreetMap
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
//

var tileMath = module.exports = {
  addPixelsToLat: function(pixels, y, zoom) {
    pixels = parseFloat(pixels, 10);
    y = parseFloat(y, 10);
    zoom = parseFloat(zoom, 10);
    return tileMath.tile2lat(tileMath.lat2tile(y, zoom) - (pixels / 256), zoom);
  },
  addPixelsToLong: function(pixels, x, zoom) {
    pixels = parseFloat(pixels, 10);
    x = parseFloat(x, 10);
    zoom = parseFloat(zoom, 10);
    return tileMath.tile2long(tileMath.long2tile(x, zoom) - (pixels / 256), zoom);
  },
  lat2tile: function(lat, zoom) {
    return ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  },
  long2tile: function(lon, zoom) {
    return ((lon + 180) / 360 * Math.pow(2, zoom));
  },
  tile2lat: function(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  },
  tile2long: function(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
  }
};
