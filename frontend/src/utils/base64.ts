/**
 * Base64 URL-safe 인코딩
 */
export const base64UrlEncode = (str: string): string => {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const bytes = new TextEncoder().encode(str);

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1] || 0;
    const b3 = bytes[i + 2] || 0;

    result += base64Chars[b1 >> 2];
    result += base64Chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? base64Chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += i + 2 < bytes.length ? base64Chars[b3 & 63] : '=';
  }

  return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
