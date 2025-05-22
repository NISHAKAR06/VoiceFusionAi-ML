import React from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export function VideoPlayer({ src, className = "" }: VideoPlayerProps) {
  return (
    <div className={`relative ${className}`}>
      <video 
        className="w-full rounded-lg shadow-lg"
        controls
        src={src}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}