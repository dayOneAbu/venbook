"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { Button } from "~/_components/ui/button";
import { cn } from "~/lib/utils";

interface GalleryProps {
  images: { url: string }[];
  venueName: string;
}

export function Gallery({ images, venueName }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const handleNext = () => setIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative group aspect-video w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Image
              src={images[index]?.url ?? "/hero.jpeg"}
              alt={`${venueName} - Image ${index + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Controls */}
        <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
              index === i ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={image.url}
              alt={`${venueName} thumbnail ${i + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 md:p-10"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-8 w-8" />
            </Button>

            <div className="relative h-full w-full max-w-6xl flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 text-white hover:bg-white/20 rounded-full h-16 w-16 hidden md:flex"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                 <Image
                  src={images[index]?.url ?? "/hero.jpeg"}
                  alt={venueName}
                  fill
                  className="object-contain"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 text-white hover:bg-white/20 rounded-full h-16 w-16 hidden md:flex"
                onClick={handleNext}
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
               {images.map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "h-2 rounded-full transition-all",
                     index === i ? "w-8 bg-primary" : "w-2 bg-white/40"
                   )} 
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
