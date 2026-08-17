# Visual QA Checklist — Hero wrappers & Checkout

Scope: hero wrapper imagery, hero copy legibility, wrapper interactions (repel, parallax, drift), checkout phone UX and Country selector.

Checklist
- [ ] Desktop (1440px+): hero wrappers should be subtle, not occlude headline.
- [ ] Tablet (768–1024px): wrappers scale down; pointer interactions still work on touch (tap/drag fallback).
- [ ] Mobile (<= 480px): wrappers minimized or removed; hero CTA and headline visible above the fold.
- [ ] First paint: hero wrappers load quickly (images preloaded, `loading="eager"`, `decoding="sync"`).
- [ ] Motion tuning: amplitude and drift feel organic — reduce motion on user-preferred-reduced-motion.
- [ ] Pointer repel: pointer moves cause wrappers to repel; keyboard users can focus the hero and motion should not trap focus.
- [ ] Accessibility: hero headline has sufficient contrast; frosted backing applied; text-shadow/stroke used sparingly.
- [ ] Checkout country selector: default `+254` visible for Kenyan users; selector accessible via keyboard; searchable.
- [ ] Phone normalization: entering `07xxxxxxxx` auto-formats to `+2547xxxxxxxx` on blur; international numbers left intact.
- [ ] Error announcements: screen readers receive phone validation errors via `aria-live="polite"`.
- [ ] Preload test: simulate slow 3G — hero should show headline and CTA before wrappers fully load.

Notes
- Use devtools throttling (CPU and network) to verify performance. 
- Record any visual regressions and the device/resolution where they occur.
