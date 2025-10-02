# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Primary Development
```bash
npm run dev          # Start development server with Turbo (hot reload at http://localhost:3000)
npm run build        # Build for production with Turbo
npm run start        # Start production server
```

### Package Management
```bash
npm install          # Install dependencies
npm install <package>  # Add new dependency
```

## Architecture Overview

This is a Next.js 15 portfolio website with a unique dual-layout system and advanced animations.

### Core Architecture Patterns

#### 1. **Responsive Layout Strategy**
- **Desktop**: Grid-based layout with `PanelSlider` component for full-screen sliding panels
- **Mobile**: Vertical scrolling layout with GSAP ScrollTrigger animations
- Layout decision made dynamically in `app/page.tsx` based on viewport width (700px breakpoint)
- Both layouts share components but render completely different experiences

#### 2. **Animation System**
- **GSAP-powered**: Uses GSAP with premium plugins (SplitText, ScrollTrigger)
- **Data-driven animations**: Elements with `data-from="left|right|up|down"` are automatically animated by PanelSlider
- **Intro sequence**: Spider-man SVG intro with scale/fade animation on initial load
- **Hover effects**: Blur/scale effects on non-hovered elements in desktop grid

#### 3. **Custom Components**
- **GlitchText**: CSS-animated text with glitch effects (supports hover activation and shadows)
- **GlitchSvg**: Animated SVG with glitch effects
- **CustomCursor**: Spinning SVG cursor that replaces default cursor sitewide
- **PanelSlider**: Full-screen panel navigation with wheel/keyboard/touch support
- **SpotifyLastPlayed**: Integration with Spotify API for music data

#### 4. **Styling System**
- **Tailwind CSS v4**: Uses new `@theme inline` directive and CSS custom properties
- **Custom color scheme**: Dark theme with `#141414` background, `#01344F` panels, `#D12128` accents, `#FAE3AC` text
- **Font stack**: Bangers (headings), Figtree (body), Marcellus SC (socials)
- **Bootstrap Icons**: For social media icons

#### 5. **Asset Management**
- **Images**: Uses Next.js Image component with remote patterns configured for Vercel storage and Spotify
- **Videos**: WebM background video for "Mixtape" section
- **Lottie**: JSON-based animations with runtime color modification
- **SVGs**: Custom cursor, intro animation, and glitch effects

### Key Files Structure

```
app/
├── page.tsx           # Main entry point with intro animation and layout decision
├── DesktopPage.tsx    # Desktop grid layout with hover effects
├── MobilePage.tsx     # Mobile vertical scroll layout
└── layout.tsx         # Root layout with fonts and CustomCursor

components/
├── PanelSlider.tsx    # Full-screen panel navigation system
├── CustomCursor.tsx   # Animated cursor replacement
├── GlitchText.jsx     # Text glitch effects
└── glitch-*.tsx       # Additional glitch components
```

## Development Guidelines

### Adding New Content
- **Desktop panels**: Add to `PanelSlider` children in `app/page.tsx`
- **Mobile sections**: Add as `.m-slide` sections in `MobilePage.tsx`
- **Animations**: Use `data-from` attributes for automatic slide-in effects

### GSAP Usage
- Premium plugins (SplitText, ScrollTrigger) are imported - handle as registered
- Use `gsap.context()` for proper cleanup in React components
- Desktop uses timeline-based animations, mobile uses ScrollTrigger

### Styling Patterns
- Use CSS custom properties defined in `globals.css` for consistent theming
- Hover states should use `transition-all duration-300 ease-out` for consistency
- Grid layouts use `col-span-*` and `row-span-*` with 6x6 desktop grid

### Performance Considerations
- Images use Next.js Image component with proper sizing
- Videos are muted and have `playsInline` for mobile compatibility
- Lottie animations are loaded asynchronously and cached
- GSAP animations use `will-change: transform` for GPU acceleration

## External Integrations

### Spotify API
- `SpotifyLastPlayed` component fetches recent tracks
- Configured for `i.scdn.co` image domain in next.config.ts

### GitHub Integration
- `react-github-calendar` shows contribution data for username "KeEbEe123"
- Custom theming in globals.css matches site color scheme

## Development Notes

- Uses PowerShell environment (pwsh)
- Turbo mode enabled for faster builds and hot reload
- TypeScript strict mode enabled
- No linting or testing configuration present - commands should be added if needed

## Asset Dependencies

Critical assets that must be present:
- `/cursor.svg` - Custom cursor graphic
- `/spiderman.svg` - Intro animation
- `/mixtape.webm` - Background video
- `/spectrum.json` - Lottie animation data
- `/namecard.png` - Hover effect image
- `/public/images/me.png` - Profile photo