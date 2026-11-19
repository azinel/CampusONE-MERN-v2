import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImageUpload({ images = [], onChange, max = 3 }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, max - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    onChange([...images, ...newImages]);
    e.target.value = '';
  };

  const remove = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-2xs"
          >
            <img src={img.preview || img} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xs transition-opacity hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground transition-all duration-150 hover:border-primary/80 hover:bg-primary/5 hover:text-primary cursor-pointer'
            )}
          >
            <Upload className="h-4 w-4" />
            <span className="text-[11px] font-medium">Upload</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
        Up to {max} photos as evidence (PNG, JPG, WebP)
      </p>
    </div>
  );
}
