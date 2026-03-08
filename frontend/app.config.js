// Dynamic Expo config
module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      kakaoJavascriptKey: process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY,
      kakaoRestApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY,
      devApiUrl: process.env.EXPO_PUBLIC_DEV_API_URL,
    },
  };
};
