"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";

export function VideoPlayer({
  src,
  poster,
  onProgress,
  initialPosition = 0,
}: {
  src: string;
  poster?: string;
  onProgress?: (sec: number) => void;
  initialPosition?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const rate = useAppSelector((s) => s.playerUi.playbackRate);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !initialPosition) return;
    const seek = () => {
      if (Math.abs(el.currentTime - initialPosition) > 2) {
        el.currentTime = initialPosition;
      }
    };
    el.addEventListener("loadedmetadata", seek);
    return () => el.removeEventListener("loadedmetadata", seek);
  }, [initialPosition, src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onProgress) return;
    const tick = () => onProgress(Math.floor(el.currentTime));
    el.addEventListener("timeupdate", tick);
    return () => el.removeEventListener("timeupdate", tick);
  }, [onProgress]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-black">
      <video
        ref={ref}
        className="aspect-video w-full"
        controls
        playsInline
        poster={poster}
        src={src}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
