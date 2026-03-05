import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
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
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false"></script>
  <script>
    let map = null;
    let debounceTimer = null;

    kakao.maps.load(function() {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(${region.latitude}, ${region.longitude}),
        level: 3
      };

      map = new kakao.maps.Map(container, options);
      window.kakaoMap = map;

      // Notify React Native that map is loaded
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded' }));

      // Listen for map center changes (drag, zoom)
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
    });
  </script>
</body>
</html>
    `;

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          cacheEnabled={true}
          originWhitelist={['*']}
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
