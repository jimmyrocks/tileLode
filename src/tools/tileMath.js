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
  },
 //http://www.gal-systems.com/2011/07/convert-coordinates-between-web.html
  toWgs84: function(mercatorLonX, mercatorLatY) {
    if (Math.abs(mercatorLonX) < 180 && Math.abs(mercatorLatY) < 90)
      return;

    if ((Math.abs(mercatorLonX) > 20037508.3427892) || (Math.abs(mercatorLatY) > 20037508.3427892))
      return;

    var x = mercatorLonX,
      y = mercatorLatY,
      num3 = x / 6378137.0,
      num4 = num3 * 57.295779513082323,
      num5 = Math.floor((num4 + 180.0) / 360.0),
      num6 = num4 - (num5 * 360.0),
      num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
    return {
      'lat': num6,
      'lon': num7 * 57.295779513082323
    };
  },
  toWebMercator: function(mercatorLonX, mercatorLatY) {
    if ((Math.abs(mercatorLonX) > 180 || Math.abs(mercatorLatY) > 90))
      return;

    var num = mercatorLonX * 0.017453292519943295,
      x = 6378137.0 * num,
      a = mercatorLatY * 0.017453292519943295;
    return {
      'lon': x,
      'lat': 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)))
    };
  }
};
