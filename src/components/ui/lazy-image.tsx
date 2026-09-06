import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Image that lazy-loads below the fold and fades in once decoded, so a slow
 * network never looks like broken UI.
 */
export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  eager = false,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={cn("relative block overflow-hidden bg-muted", wrapperClassName)}>
      {!loaded ? (
        <span aria-hidden="true" className="absolute inset-0 shimmer" />
      ) : null}
      <img
        src={src}
        alt={alt}
        {...(sizes ? { sizes } : {})}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </span>
  );
}
