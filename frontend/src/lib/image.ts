const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

// Downscales and re-encodes the image client-side so the base64 payload we
// send stays reasonable — there's no external file storage wired up in this
// build, so photoUrl just holds a data: URL directly.
export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error("A kép túl nagy (max 6 MB)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nem sikerült beolvasni a képet."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nem sikerült beolvasni a képet."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("A böngésző nem támogatja a képfeldolgozást."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
