import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-md border">
            <img src={img.preview || img} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground"
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
              'flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary'
            )}
          >
            <Upload className="h-4 w-4" />
            <span className="text-[10px]">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <ImageIcon className="h-3 w-3" />
        Up to {max} photos. JPG, PNG supported.
      </p>
    </div>
  );
}
