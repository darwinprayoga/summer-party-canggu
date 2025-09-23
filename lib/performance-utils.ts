import React from "react"
// Performance optimization utilities for better Core Web Vitals

export interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

// Lazy loading utility for components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
) {
  const LazyComponent = React.lazy(importFunc)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return React.createElement(
      React.Suspense,
      {
        fallback: fallback
          ? React.createElement(fallback)
          : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, props)
    )
  }
}

// Image optimization utility
export function getOptimizedImageProps(src: string, alt: string, width: number, height: number, priority = false) {
  return {
    src,
    alt,
    width,
    height,
    priority,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    style: {
      maxWidth: "100%",
      height: "auto",
    },
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    if (type) link.type = type
    document.head.appendChild(link)
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
  if (typeof window === "undefined") return null

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Performance monitoring
export function measurePerformance(): PerformanceMetrics {
  if (typeof window === "undefined") return {}

  const metrics: PerformanceMetrics = {}

  // Largest Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        metrics.lcp = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (e) {
      console.warn("LCP measurement not supported")
    }
  }

  // First Contentful Paint
  const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0] as any
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime
  }

  // Time to First Byte
  const navigationEntry = performance.getEntriesByType("navigation")[0] as any
  if (navigationEntry) {
    metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
  }

  return metrics
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string) {
  if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.textContent = css
    document.head.appendChild(style)
  }
}

// Resource hints utility
export function addResourceHints(hints: Array<{ rel: string; href: string; as?: string; type?: string }>) {
  if (typeof document !== "undefined") {
    hints.forEach((hint) => {
      const link = document.createElement("link")
      link.rel = hint.rel
      link.href = hint.href
      if (hint.as) link.setAttribute("as", hint.as)
      if (hint.type) link.type = hint.type
      document.head.appendChild(link)
    })
  }
}

// Service Worker registration
export function registerServiceWorker(swPath = "/sw.js") {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    })
  }
}

// Web Vitals reporting
export function reportWebVitals(metric: any) {
  // Send to analytics service
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
}

// Image lazy loading with Intersection Observer
export function lazyLoadImages() {
  if (typeof window === "undefined") return

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.classList.remove("loading")
          img.classList.add("loaded")
          observer.unobserve(img)
        }
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// Preload critical fonts
export function preloadFonts(fonts: string[]) {
  fonts.forEach((font) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = font
    link.as = "font"
    link.type = "font/woff2"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  })
}
