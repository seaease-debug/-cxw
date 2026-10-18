/**
 * Robust CSV Decoding with UTF-8 and GBK Fallback
 */
export const decodeFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const decoderUtf8 = new TextDecoder('utf-8');
  const decodedUtf8 = decoderUtf8.decode(buffer);
  // Detect garbled characters (replacement character)
  if (decodedUtf8.includes('\ufffd')) {
    const decoderGbk = new TextDecoder('gbk');
    return decoderGbk.decode(buffer);
  }
  return decodedUtf8;
};
