import { useState } from 'react';
import { Camera, Image as ImageIcon, Upload } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/Button';

interface CoverImagePickerProps {
  onImageSelected: (blob: Blob) => void;
  loading?: boolean;
  currentImageUrl?: string | null;
}

export function CoverImagePicker({ onImageSelected, loading, currentImageUrl }: CoverImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);

  async function pickFromCamera() {
    try {
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1200,
        height: 600,
      });

      if (photo.dataUrl) {
        setPreview(photo.dataUrl);
        const blob = await dataUrlToBlob(photo.dataUrl);
        onImageSelected(blob);
      }
    } catch (err) {
      // User cancelled
    }
  }

  async function pickFromGallery() {
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          width: 1200,
          height: 600,
        });

        if (photo.dataUrl) {
          setPreview(photo.dataUrl);
          const blob = await dataUrlToBlob(photo.dataUrl);
          onImageSelected(blob);
        }
      } catch (err) {
        // User cancelled
      }
    } else {
      // Web fallback: file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setPreview(dataUrl);
          onImageSelected(file);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preview */}
      <div className="relative h-40 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
        {preview ? (
          <img
            src={preview}
            alt="Cover preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon size={32} className="text-slate-300" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {Capacitor.isNativePlatform() && (
          <Button variant="secondary" size="sm" onClick={pickFromCamera} type="button">
            <Camera size={16} />
            Camera
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={pickFromGallery}
          type="button"
          className={Capacitor.isNativePlatform() ? '' : 'col-span-2'}
        >
          <Upload size={16} />
          {Capacitor.isNativePlatform() ? 'Gallery' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
