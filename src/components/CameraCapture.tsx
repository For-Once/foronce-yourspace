import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCcw, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// Compress a data URL down so gallery photos stay small in local storage.
async function compress(dataUrl: string, max = 1000): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function CameraCapture({
  onCapture,
}: {
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const open = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      // wait a tick for the video element to mount
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError("couldn't reach the camera. you can upload a photo instead.");
    }
  };

  const snap = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const raw = canvas.toDataURL("image/jpeg", 0.9);
    const small = await compress(raw);
    onCapture(small);
    stop();
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const small = await compress(raw);
    onCapture(small);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onUpload}
      />

      {!active ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="hero" size="lg" onClick={open}>
            <Camera className="h-4 w-4" /> open camera
          </Button>
          <Button variant="soft" size="lg" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> upload a photo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-80 w-full -scale-x-100 object-cover"
            />
            <button
              onClick={stop}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-cream backdrop-blur transition-colors hover:bg-rose/70"
              aria-label="close camera"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="lg" onClick={snap}>
              <Check className="h-4 w-4" /> capture this moment
            </Button>
            <Button variant="soft" size="lg" onClick={open}>
              <RefreshCcw className="h-4 w-4" /> restart
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose/80">{error}</p>
      )}
    </div>
  );
}
