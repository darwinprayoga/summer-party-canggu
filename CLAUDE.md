# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for Summer Party Canggu - a beach and pool equipment rental service and event website in Bali. The site promotes beach activities, surfboard rentals, and pool parties in the Canggu area.

## Common Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linting

## Architecture & Tech Stack

**Framework:** Next.js 15.2.4 with App Router
**Styling:** Tailwind CSS with shadcn/ui components
**TypeScript:** Strict mode enabled
**UI Library:** Radix UI components via shadcn/ui
**Analytics:** Vercel Analytics
**Form Handling:** React Hook Form with Zod validation

## Project Structure

```
app/                    # Next.js app router pages
├── components/         # Page-specific components
├── admin/             # Admin registration page
├── staff/             # Staff registration page
├── event/             # Event RSVP page
├── blog/              # Blog pages and posts
├── areas/             # Location-based pages
├── tools/             # Tools and calculators
└── globals.css        # Global styles

components/            # Reusable UI components
├── ui/               # shadcn/ui components
└── theme-provider.tsx

lib/                  # Utility functions
├── utils.ts          # Common utilities (cn, cleanTitle, etc.)
├── seo-utils.ts      # SEO helpers
├── wordpress.ts      # WordPress integration
└── performance-utils.ts
```

## Key Configuration

**Tailwind:** Custom color palette with theme colors (mint, teal, coral, cream, charcoal)
**TypeScript:** Configured with `@/*` path aliases pointing to project root
**shadcn/ui:** Configured with default style, RSC enabled, CSS variables
**Next.js:** ESLint and TypeScript errors ignored during builds, images unoptimized

## Development Patterns

**Components:** Uses shadcn/ui pattern with Radix UI primitives
**Styling:** Utility-first with Tailwind, custom color system, CSS variables for theming
**SEO:** Comprehensive metadata setup in layout.tsx with structured data
**Performance:** Preloading critical resources, DNS prefetch for external domains
**Forms:** React Hook Form with Zod validation schemas
**Content:** WordPress integration for blog content with HTML entity cleaning

## Important Notes

- Site promotes beach/pool equipment rental and party events in Canggu, Bali
- Heavy focus on SEO optimization with detailed metadata and structured data
- Custom utility functions for cleaning WordPress HTML entities
- Performance optimizations include resource preloading and connection hints
- Uses custom CSS classes like `btn-primary`, `container-custom`, `section-padding`
- Color system designed around beach/summer theme (coral, teal, mint)