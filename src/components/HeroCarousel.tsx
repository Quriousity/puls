"use client";

import { useRef, useState } from "react";
import { X } from "@phosphor-icons/react";

export type HeroItem = { img: string; title: string; sub: string };

// Unsplash 광고용 이미지 URL 빌더
export const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

function HeroCard({ img, title, sub }: HeroItem) {
  return (
    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <p className="text-white text-lg font-bold leading-tight">{title}</p>
        <p className="text-white/70 text-xs mt-1">{sub}</p>
        <button className="mt-3 text-xs font-semibold bg-orange-500 text-white rounded-lg px-3 py-1.5">
          이 자리에 광고하기 · ₩100,000/주
        </button>
      </div>
    </div>
  );
}

export default function HeroCarousel({ items }: { items: HeroItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  if (dismissed) return null;

  return (
    <div className="relative space-y-2">
      {/* 닫기 */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="광고 닫기"
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition-colors"
      >
        <X size={14} />
      </button>

      <div
        ref={ref}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(h => (
          <div key={h.img} className="snap-center shrink-0 w-full">
            <HeroCard {...h} />
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번째 광고`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-4 bg-orange-500" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
