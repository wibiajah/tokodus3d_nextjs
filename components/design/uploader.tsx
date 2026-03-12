"use client";

import { useEffect, useRef } from "react";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "../ui/button";

export default function Uploader() {
  const ref = useRef<HTMLInputElement | null>(null);
  const side = useDesignStore((s) => s.side);

  const images = useDesignStore((s) => s.listImages);

  const addImage2List = useDesignStore((s) => s.addImage2List);
  const listImages = useDesignStore((s) => s.listImages);
  const insertImageFromList = useDesignStore((s) => s.insertImageFromList);
  const removeImageFromList = useDesignStore((s) => s.removeImageFromList);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImageDimensions(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const aspect = img.width / img.height;
      const newWidth = 200;
      const newHeight = newWidth / aspect;

      addImage2List({
        dataUrl: compressedDataUrl,
        width: newWidth,
        height: newHeight,
      });
    }
  }

  return (
    <div className="space-y-3">
      <Input
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        onChange={(e) => onFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-2">
        {/* {images.map((img) => ( */}
        {listImages.map((img) => (
          <div key={img.id} className={`relative rounded-md p-1 transition`}>
            {/* Tombol Hapus */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
              title="Hapus gambar"
              onClick={() => removeImageFromList(img.id)}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Gambar - klik untuk toggle visible */}
            <img
              src={img.dataUrl}
              alt="artwork"
              className={`aspect-square w-full rounded-md object-cover cursor-grab active:cursor-grabbing`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("image/list-id", img.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => insertImageFromList(img.id, side)}
            />
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Unggah logo/gambar (JPG, JPEG, PNG ≤ 1MB).
        <br />
        Klik gambar untuk menampilkannya di kanvas.
        <br />
        Hapus gambar di kanvas dengan diselect lalu delete.
      </div>
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
