import { supabase } from '@/integrations/supabase/client';
export async function makeThumbnail(file: File): Promise<Blob> {
  const source = URL.createObjectURL(file);
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser cannot create a preview.');
    let element: HTMLImageElement | HTMLVideoElement;
    let width = 0;
    let height = 0;
    if (file.type.startsWith('image/')) {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('This image could not be opened.'));
        image.src = source;
      });
      element = image;
      width = image.naturalWidth;
      height = image.naturalHeight;
    } else {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'auto';
      video.playsInline = true;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('This video format cannot be previewed in your browser.')),
          15000
        );
        video.onloadeddata = () => {
          clearTimeout(timeout);
          resolve();
        };
        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('This video format cannot be previewed in your browser.'));
        };
        video.src = source;
      });
      element = video;
      width = video.videoWidth;
      height = video.videoHeight;
    }
    const ratio = Math.min(1, 720 / width);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Preview creation failed.'))),
        'image/jpeg',
        0.82
      )
    );
  } finally {
    URL.revokeObjectURL(source);
  }
}
export async function uploadOriginal(
  bucket: string,
  path: string,
  file: File,
  onProgress: (progress: number) => void
) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in again.');
  const base = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${base}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`
    );
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', key);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('Connection lost. Please retry this file.'));
    xhr.send(file);
  });
}
