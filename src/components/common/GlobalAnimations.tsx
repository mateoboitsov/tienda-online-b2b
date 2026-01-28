"use client";

import { animationStyles } from "@/lib/utils/animations";

export function GlobalAnimations() {
  return (
    <style jsx global>
      {animationStyles}
    </style>
  );
}
