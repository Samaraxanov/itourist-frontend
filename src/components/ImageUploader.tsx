import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tokenStore } from '../lib/api';

// Uploads images to the backend (mock object storage) and returns their URLs.
// Shows current images with remove buttons; the first image is the cover.
export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: FileList) => {
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      Array.from(files).forEach((f) => body.append('files', f));
      // Multipart upload — don't set Content-Type; the browser adds the boundary.
      const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.access}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Upload failed');
      onChange([...images, ...data.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-20 w-28 overflow-hidden rounded-lg border border-majolica-100 bg-majolica-50">
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-majolica-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                cover
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((u) => u !== url))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border-2 border-dashed border-majolica-200 text-sm text-majolica-400 hover:border-majolica-400 hover:text-majolica-600 disabled:opacity-50"
        >
          {busy ? t('uploading') : `+ ${t('uploadImages')}`}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && e.target.files.length > 0 && upload(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-ochre-600">{error}</p>}
    </div>
  );
}
