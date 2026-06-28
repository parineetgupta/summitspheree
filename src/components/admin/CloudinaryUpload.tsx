"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus } from "lucide-react";

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string, type: "image" | "video") => void;
  className?: string;
  children?: React.ReactNode;
}

export function CloudinaryUpload({ onUploadSuccess, className, children }: CloudinaryUploadProps) {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "summitsphere_preset"}
      onSuccess={(result: any) => {
        if (result.info && result.info.secure_url) {
          const isVideo = result.info.resource_type === 'video';
          onUploadSuccess(result.info.secure_url, isVideo ? 'video' : 'image');
        }
      }}
      onError={(error: any) => {
        console.error("Cloudinary Upload Error:", error);
      }}
      options={{
        maxFiles: 10,
        resourceType: "auto",
        clientAllowedFormats: ["png", "jpg", "jpeg", "mp4", "mov", "webp"]
      }}
    >
      {({ open }) => {
        return (
          <div 
            onClick={() => open()} 
            className={className || "w-full aspect-video border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"}
          >
            {children || (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Click to upload media</p>
                  <p className="text-xs text-gray-500 mt-1">High-resolution images or videos</p>
                </div>
              </>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
