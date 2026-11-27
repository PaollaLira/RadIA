/**
 * Redimensiona e comprime imagens (capturas de câmera ou uploads de galeria)
 * antes de salvar no dispositivo e enviar à IA, reduzindo latência de rede e consumo de armazenamento.
 */
export async function resizeImageDataUrl(
  sourceDataUrl: string,
  maxDim = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const longestSide = Math.max(img.width, img.height);
      if (longestSide <= maxDim && sourceDataUrl.length < 350_000) {
        resolve(sourceDataUrl);
        return;
      }
      const scale = Math.min(1, maxDim / longestSide);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}
