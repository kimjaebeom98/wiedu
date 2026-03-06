import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';

const KAKAO_JAVASCRIPT_KEY = Constants.expoConfig?.extra?.kakaoJavascriptKey || '';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface KakaoMapViewProps {
  initialRegion?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  style?: object;
  showsUserLocation?: boolean;
}

export interface KakaoMapViewRef {
  animateToRegion: (region: Region, duration?: number) => void;
  setCenter: (latitude: number, longitude: number) => void;
}

const KakaoMapView = forwardRef<KakaoMapViewRef, KakaoMapViewProps>(
  ({ initialRegion, onRegionChangeComplete, style, showsUserLocation }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [isLoaded, setIsLoaded] = React.useState(false);

    const defaultRegion: Region = {
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    const region = initialRegion || defaultRegion;

    useImperativeHandle(ref, () => ({
      animateToRegion: (newRegion: Region, duration = 500) => {
        webViewRef.current?.injectJavaScript(`
          if (window.kakaoMap) {
            const moveLatLon = new kakao.maps.LatLng(${newRegion.latitude}, ${newRegion.longitude});
            window.kakaoMap.panTo(moveLatLon);
          }
          true;
        `);
      },
      setCenter: (latitude: number, longitude: number) => {
        webViewRef.current?.injectJavaScript(`
          if (window.kakaoMap) {
            const moveLatLon = new kakao.maps.LatLng(${latitude}, ${longitude});
            window.kakaoMap.setCenter(moveLatLon);
          }
          true;
        `);
      },
    }));

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'regionChange' && onRegionChangeComplete) {
            onRegionChangeComplete({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: data.latitudeDelta || 0.01,
              longitudeDelta: data.longitudeDelta || 0.01,
            });
          } else if (data.type === 'mapLoaded') {
            setIsLoaded(true);
          } else if (data.type === 'error') {
            console.error('KakaoMap Error:', data.message);
          } else if (data.type === 'debug') {
            console.log('KakaoMap Debug - Origin:', data.origin, 'Href:', data.href);
          }
        } catch (e) {
          console.warn('KakaoMapView message parse error:', e);
        }
      },
      [onRegionChangeComplete]
    );

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #18181B; }
    #map { width: 100%; height: 100%; }
    #error { color: white; padding: 20px; font-family: sans-serif; display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="error"></div>
  <script>
    window.onerror = function(msg, url, line, col, error) {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').innerHTML = 'Error: ' + msg + '<br>Line: ' + line;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: msg,
        url: url,
        line: line
      }));
      return false;
    };

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'debug',
      origin: window.location.origin,
      href: window.location.href
    }));
  </script>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false"></script>
  <script>
    let map = null;
    let debounceTimer = null;

    if (typeof kakao === 'undefined') {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').innerHTML = 'Kakao SDK failed to load. Check network and domain settings.';
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: 'Kakao SDK not loaded'
      }));
    } else {
      kakao.maps.load(function() {
        try {
          const container = document.getElementById('map');
          const options = {
            center: new kakao.maps.LatLng(${region.latitude}, ${region.longitude}),
            level: 3
          };

          map = new kakao.maps.Map(container, options);
          window.kakaoMap = map;

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded' }));

          kakao.maps.event.addListener(map, 'center_changed', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
              const center = map.getCenter();
              const bounds = map.getBounds();
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();

              const latDelta = Math.abs(ne.getLat() - sw.getLat());
              const lngDelta = Math.abs(ne.getLng() - sw.getLng());

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                latitude: center.getLat(),
                longitude: center.getLng(),
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta
              }));
            }, 300);
          });
        } catch(e) {
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').innerHTML = 'Map init error: ' + e.message;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: e.message
          }));
        }
      });
    }
  </script>
</body>
</html>
    `;

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: 'http://localhost:3000/' }}
          style={styles.webview}
          onMessage={handleMessage}
          onError={(e) => console.error('WebView error:', e.nativeEvent)}
          onHttpError={(e) => console.error('WebView HTTP error:', e.nativeEvent)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          cacheEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          allowFileAccess={true}
        />
        {!isLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KakaoMapView;
