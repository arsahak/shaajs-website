"use client";

import { useProductSelection } from "@/component/product/ProductSelection";
import { Play } from "lucide-react";
import Image from "next/image";
import { CiZoomIn, CiZoomOut } from "react-icons/ci";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TransitionEvent,
} from "react";

export type ProductMedia =
  | { type: "image"; src: string }
  | { type: "video"; source: "upload" | "youtube"; src: string };

interface ProductGalleryProps {
  /** Ordered media — the feature image first, then the video (if any), then gallery images. */
  media: ProductMedia[];
  alt: string;
  /** Pre-rendered on the server; shown when the product has no media at all. */
  fallback: ReactNode;
  /** Gradient classes behind the fallback icon. */
  fallbackGradient: string;
  badge?: ReactNode;
}

/** How long each image stays before the gallery moves on. */
const AUTOPLAY_MS = 5000;

// Zooming the picture: a click goes straight to CLICK_ZOOM at the spot that
// was clicked; the + and − buttons then move a step at a time up to MAX_ZOOM.
const CLICK_ZOOM = 2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1;
/** A press that travels further than this (px) is a drag, not a click. */
const DRAG_THRESHOLD = 6;

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const zoomButtonClass =
  "flex size-8 items-center justify-center bg-transparent p-0 text-(--color-dark) drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.9)] transition-[color,transform] hover:scale-110 hover:text-(--color-primary) active:scale-95";

// "https://www.youtube.com/embed/{id}" → YouTube's own thumbnail for the strip.
function youtubeThumbnail(embedUrl: string): string | null {
  const id = embedUrl.match(/\/embed\/([\w-]{6,})/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Browsers only allow autoplay when muted; viewers can unmute in the player.
function youtubeAutoplayUrl(embedUrl: string): string {
  const joiner = embedUrl.includes("?") ? "&" : "?";
  return `${embedUrl}${joiner}autoplay=1&mute=1&playsinline=1&rel=0`;
}

export function ProductGallery({
  media,
  alt,
  fallback,
  fallbackGradient,
  badge,
}: ProductGalleryProps) {
  const count = media.length;
  const videoIndex = media.findIndex((item) => item.type === "video");
  const hasVideo = videoIndex !== -1;
  // Without a video the slideshow loops, so a copy of the first slide sits at
  // the end: sliding up onto it looks like wrapping, then we snap back to 0.
  const loops = !hasVideo && count > 1;
  const slides = loops ? [...media, media[0]] : media;

  const [slide, setSlide] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hovering, setHovering] = useState(false);
  // With a video, autoplay is a one-shot: feature image → video, then stop.
  const [videoAutoplayed, setVideoAutoplayed] = useState(false);

  const activeIndex = count ? slide % count : 0;
  const active = media[activeIndex];

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Zoom level of the showing picture (1 = not zoomed) and the point of it,
  // in percent, that the zoom is centred on — dragging moves that point.
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const dragRef = useRef<{ x: number; y: number; travel: number } | null>(null);
  const zoomable = active?.type === "image";
  const zoomed = zoomable && zoom > 1;

  // Every move to another slide starts un-zoomed.
  const goTo = useCallback((index: number) => {
    setAnimate(true);
    setSlide(index);
    setZoom(1);
  }, []);

  // When the shopper picks a color that has its own photo, show that photo —
  // and stop the slideshow, so it doesn't wander off the color they chose.
  const colorPhoto = useProductSelection()?.color?.images[0];
  const colorIndex = colorPhoto
    ? media.findIndex(
        (item) => item.type === "image" && item.src === colorPhoto,
      )
    : -1;
  const pinnedToColor = colorIndex !== -1;
  // Jump there once per change of color (adjusting state while rendering,
  // rather than in an effect, avoids an extra render with the old slide).
  const [shownColorPhoto, setShownColorPhoto] = useState(colorPhoto);
  if (colorPhoto !== shownColorPhoto) {
    setShownColorPhoto(colorPhoto);
    if (colorIndex !== -1) {
      setAnimate(true);
      setSlide(colorIndex);
      setZoom(1);
    }
  }

  // Fit the gallery into one screen: measure how far down the page it starts
  // (top bar + sticky header + breadcrumb) and the sticky header's height, and
  // expose both as CSS variables that size the main viewer below.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const header = document.querySelector("header");

    const measure = () => {
      // The parent grid isn't sticky, so its top is the gallery's resting position.
      const anchor = root.parentElement ?? root;
      const top = anchor.getBoundingClientRect().top + window.scrollY;
      root.style.setProperty("--gallery-offset", `${Math.round(top)}px`);
      root.style.setProperty(
        "--header-h",
        `${Math.round(header?.getBoundingClientRect().height ?? 0)}px`,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Autoplay timer. Restarts whenever the slide changes (including a manual
  // thumbnail click), and waits while the viewer is hovered or the tab is hidden.
  useEffect(() => {
    if (
      count < 2 ||
      hovering ||
      zoomed ||
      pinnedToColor ||
      active?.type === "video"
    ) {
      return;
    }
    if (hasVideo && (videoAutoplayed || activeIndex !== 0)) return;

    const timer = setTimeout(() => {
      if (document.visibilityState === "hidden") return;
      if (hasVideo) {
        setVideoAutoplayed(true);
        goTo(videoIndex);
      } else {
        goTo(slide + 1);
      }
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [
    active?.type,
    activeIndex,
    count,
    goTo,
    hasVideo,
    hovering,
    pinnedToColor,
    slide,
    videoAutoplayed,
    videoIndex,
    zoomed,
  ]);

  // Play an uploaded video when it slides in, pause it when it slides away.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active?.type === "video") {
      video.play().catch(() => {
        video.muted = true;
        void video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [active]);

  // Keep the showing picture's thumbnail in view: glide the strip (sideways
  // on small screens, up and down on desktop) until it sits in the middle.
  // Only the strip moves — the page itself is never scrolled.
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeIndex];
    if (!strip || !(thumb instanceof HTMLElement)) return;
    strip.scrollTo({
      left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
      top: thumb.offsetTop - (strip.clientHeight - thumb.offsetHeight) / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  // After sliding onto the copy of the first slide, jump back to the real one
  // with the transition off, then turn it back on for the next move.
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (loops && slide === count) {
      setAnimate(false);
      setSlide(0);
    }
  };

  // A click on the picture zooms in on the spot that was clicked; a click
  // while zoomed (one that wasn't the end of a drag) zooms back out.
  const handleViewerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!zoomable) return;
    const dragged = (dragRef.current?.travel ?? 0) > DRAG_THRESHOLD;
    dragRef.current = null;
    if (dragged) return;
    if (zoomed) {
      setZoom(1);
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: clampPercent(((event.clientX - box.left) / box.width) * 100),
      y: clampPercent(((event.clientY - box.top) / box.height) * 100),
    });
    setZoom(CLICK_ZOOM);
  };

  // While zoomed, dragging (mouse or finger) moves the picture around.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoomed || (event.target as Element).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, travel: 0 };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!zoomed || !drag || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.travel += Math.abs(dx) + Math.abs(dy);
    // The picture follows the pointer: moving the zoom's centre one way
    // slides the picture the other, by (zoom − 1) times as much.
    const box = event.currentTarget.getBoundingClientRect();
    setZoomOrigin((origin) => ({
      x: clampPercent(origin.x - (dx / ((zoom - 1) * box.width)) * 100),
      y: clampPercent(origin.y - (dy / ((zoom - 1) * box.height)) * 100),
    }));
  };

  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true)),
    );
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  return (
    <div
      ref={rootRef}
      // Fallbacks until measured: typical desktop offset / header height.
      style={{ "--gallery-offset": "186px", "--header-h": "70px" } as CSSProperties}
      className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start"
    >
      <div
        // The thumbnail column is there whenever the product has a picture —
        // a lone feature image gets its one thumbnail too, so every product
        // page is laid out the same way.
        className={`grid grid-cols-1 gap-3 ${count > 0 ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]" : ""}`}
      >
        {/* Main viewer — a square no taller than the screen space left under
            the header (minus the thumbnail row on small screens). */}
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={handleViewerClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className={`relative aspect-square w-full max-w-[max(18rem,calc(100dvh-var(--gallery-offset)-6.5rem))] overflow-hidden rounded-(--radius-2xl) max-lg:mx-auto lg:order-2 lg:max-w-[max(20rem,calc(100dvh-var(--gallery-offset)-1.5rem))] ${
            !active ? `bg-linear-to-br ${fallbackGradient}` : "bg-white"
          } ${
            // Zoomed: the finger drags the picture rather than the page.
            zoomed
              ? "cursor-zoom-out touch-none select-none active:cursor-grabbing"
              : zoomable
                ? "cursor-zoom-in"
                : ""
          }`}
        >
          {/* Hidden over video so it doesn't cover the player's own controls,
              and while zoomed so it doesn't cover the picture. */}
          {active?.type !== "video" && !zoomed && badge}

          {/* Zoom buttons, top right: + is always there on a picture (it
              shows the picture can be zoomed, and works from the keyboard);
              − joins it once zoomed in. */}
          {zoomable && (
            <div
              className="absolute end-3 top-3 z-20 flex flex-col gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Zoom in"
                disabled={zoom >= MAX_ZOOM}
                onClick={() =>
                  setZoom((level) => Math.min(MAX_ZOOM, level + ZOOM_STEP))
                }
                className={zoomButtonClass}
              >
                <CiZoomIn aria-hidden="true" size={22} />
              </button>
              {zoomed && (
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() =>
                    setZoom((level) => Math.max(1, level - ZOOM_STEP))
                  }
                  className={zoomButtonClass}
                >
                  <CiZoomOut aria-hidden="true" size={22} />
                </button>
              )}
            </div>
          )}

          {!active ? (
            fallback
          ) : (
            // Vertical track: each move slides the next slide up from the bottom.
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{ transform: `translateY(-${slide * 100}%)` }}
              className={`flex h-full flex-col ${
                animate
                  ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  : ""
              }`}
            >
              {slides.map((item, index) => {
                const isActive = index === slide;
                return (
                  <div
                    key={`${index}-${item.src}`}
                    aria-hidden={!isActive}
                    className={`relative h-full w-full shrink-0 ${
                      item.type === "video" ? "bg-black" : ""
                    }`}
                  >
                    {item.type === "image" ? (
                      <Image
                        src={item.src}
                        alt={isActive ? alt : ""}
                        fill
                        unoptimized
                        priority={index === 0}
                        draggable={false}
                        // The showing picture grows around the point that
                        // was clicked; scale(1) is simply "not zoomed".
                        style={
                          isActive
                            ? {
                                transform: `scale(${zoom})`,
                                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                              }
                            : undefined
                        }
                        className="object-contain transition-transform duration-300 ease-out motion-reduce:transition-none"
                      />
                    ) : item.source === "youtube" ? (
                      isActive ? (
                        <iframe
                          src={youtubeAutoplayUrl(item.src)}
                          title={alt}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full border-0"
                        />
                      ) : (
                        // Only the active slide loads the player; others show its poster.
                        youtubeThumbnail(item.src) && (
                          <Image
                            src={youtubeThumbnail(item.src)!}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover opacity-80"
                          />
                        )
                      )
                    ) : (
                      <video
                        ref={videoRef}
                        src={item.src}
                        controls
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Autoplay progress — a thin bar that fills over the 5s wait. */}
          {count > 1 &&
            active?.type === "image" &&
            !hovering &&
            !zoomed &&
            !pinnedToColor &&
            (!hasVideo || (!videoAutoplayed && activeIndex === 0)) && (
              <span
                key={`progress-${slide}`}
                aria-hidden="true"
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                className="absolute inset-x-0 bottom-0 z-10 h-0.5 origin-left animate-[gallery-progress_linear_forwards] bg-(--color-primary)/70 motion-reduce:hidden"
              />
            )}
        </div>

        {/* Thumbnails — a row under the image on small screens, a scrollable
            column beside it on desktop that never grows taller than the image.
            Shown for a single picture as well (just the feature image). */}
        {count > 0 && (
          // min-w-0: a long row of thumbnails scrolls inside the column
          // instead of stretching it — and the picture above — past the screen.
          <div className="relative min-w-0 lg:order-1">
            <div
              ref={thumbsRef}
              // A few thumbnails sit centred under the picture; more than fit
              // scroll, from the first one, with a smooth glide and a gentle
              // stop on each thumbnail.
              className="relative flex snap-x snap-proximity gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] max-lg:mx-auto max-lg:w-fit max-lg:max-w-full lg:absolute lg:inset-0 lg:snap-y lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:[scrollbar-width:thin] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden lg:[&::-webkit-scrollbar]:block"
            >
              {media.map((item, index) => {
                const isActive = index === activeIndex;
                const thumb =
                  item.type === "image"
                    ? item.src
                    : item.source === "youtube"
                      ? youtubeThumbnail(item.src)
                      : null;

                return (
                  <button
                    key={`${item.type}-${item.src}`}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={
                      item.type === "video"
                        ? "Play product video"
                        : `Show image ${index + 1}`
                    }
                    aria-current={isActive}
                    className={`relative aspect-square w-16 shrink-0 snap-center overflow-hidden rounded-(--radius-md) border-2 bg-white p-0 transition-colors lg:w-full ${
                      isActive
                        ? "border-(--color-primary)"
                        : "border-(--color-border) hover:border-(--color-primary)"
                    }`}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        unoptimized
                        className={
                          item.type === "image"
                            ? "object-contain p-1"
                            : "object-cover"
                        }
                      />
                    ) : (
                      // Uploaded video: its first frame stands in as the thumbnail.
                      <video
                        src={`${item.src}#t=0.1`}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full bg-black object-cover"
                      />
                    )}
                    {item.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-(--color-dark)">
                          <Play
                            aria-hidden="true"
                            className="ms-0.5 h-3.5 w-3.5 fill-current"
                          />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
