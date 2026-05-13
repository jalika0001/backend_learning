const sharp = require("sharp");

const TARGET_BYTES = 1024 * 1024; // 1MB

exports.compressToTargetSize = async (inputBuffer, mimeType) => {
  const metadata = await sharp(inputBuffer).metadata();
  const startWidth = metadata.width || 1920;
  const startHeight = metadata.height || 1080;

  // Keep small images as-is.
  if (inputBuffer.length <= TARGET_BYTES) {
    return {
      buffer: inputBuffer,
      extension: mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg",
      mimeType,
      compressed: false
    };
  }

  let width = startWidth;
  let height = startHeight;
  let quality = 82;
  let output = null;

  for (let pass = 0; pass < 9; pass += 1) {
    output = await sharp(inputBuffer)
      .rotate()
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (output.length <= TARGET_BYTES) {
      return {
        buffer: output,
        extension: ".jpg",
        mimeType: "image/jpeg",
        compressed: true
      };
    }

    if (quality > 55) {
      quality -= 7;
    } else {
      width = Math.max(640, Math.floor(width * 0.85));
      height = Math.max(640, Math.floor(height * 0.85));
    }
  }

  return {
    buffer: output,
    extension: ".jpg",
    mimeType: "image/jpeg",
    compressed: true
  };
};