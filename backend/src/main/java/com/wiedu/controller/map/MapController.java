package com.wiedu.controller.map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/map")
public class MapController {

    @Value("${kakao.javascript-key}")
    private String kakaoJavascriptKey;

    @GetMapping(value = "/kakao", produces = MediaType.TEXT_HTML_VALUE)
    public String getKakaoMapHtml(
            @RequestParam(defaultValue = "37.5665") double lat,
            @RequestParam(defaultValue = "126.978") double lng,
            @RequestParam(defaultValue = "3") int level
    ) {
        return """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%%; height: 100%%; overflow: hidden; }
    #map { width: 100%%; height: 100%%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=%s&autoload=false"></script>
  <script>
    let map, marker;

    kakao.maps.load(function() {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(%f, %f),
        level: %d
      };
      map = new kakao.maps.Map(container, options);

      marker = new kakao.maps.Marker({
        position: map.getCenter(),
        map: map
      });

      kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            latitude: latlng.getLat(),
            longitude: latlng.getLng()
          }));
        }
      });

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      }
    });

    function moveToLocation(lat, lng) {
      const position = new kakao.maps.LatLng(lat, lng);
      map.setCenter(position);
      marker.setPosition(position);
    }
  </script>
</body>
</html>
""".formatted(kakaoJavascriptKey, lat, lng, level);
    }
}
