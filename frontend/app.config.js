// Dynamic Expo config
module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      "@react-native-community/datetimepicker",
      "expo-build-properties",
    ],
    extra: {
      ...config.extra,
      kakaoJavascriptKey: process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY,
      kakaoRestApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY,
    },
  };
};
