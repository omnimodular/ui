# Accessibility and verification

## Target and scope

The implementation targets WCAG 2.2 AA for the supplied dashboard and native HTML components. High-Contrast Clarity is a visual identity, not a substitute for accessible design in the other themes. Automated scans are evidence about specific rules, not proof of full conformance.

## Automated evidence

`npm test` checks:

- All 103 required tokens in ten themes × two appearances, unique manifests, schema fields, and contract compatibility.
- Registration, initialization, persistence, invalid stored values, unavailable storage, system-mode changes, cross-tab updates, listener cleanup, failed loads, incomplete tokens, and stale resolutions during rapid switching.
- Dialog initial focus/restoration and Escape controller behavior, table sorting/edit/empty states, mobile navigation and cleanup.
- Measured contrast for documented normal-text pairs at **4.5:1** and control boundaries/focus pairs at **3:1**. All tested values are opaque six-digit hex colors; the parser rejects untested color forms rather than guessing.
- Brand anchor OKLCH coordinates, deterministic/immutable derivation, sRGB gamut mapping, quantized hue tolerances, preserved chroma personalities, and branded role contrast across every theme/mode.
- Package boundaries, no theme-catalog imports in core/components, no theme-ID component selectors, and no hardcoded hex colors in component CSS.

`npm run test:a11y` runs Playwright with axe-core in Chrome/Chromium:

- **60 scans:** dashboard, component showcase, and native dialog in every one of the 20 theme/mode combinations.
- WCAG 2 A/AA, WCAG 2.1 A/AA, and WCAG 2.2 AA axe tags.
- Real browser checks for task validation, creation, editing, search, empty state, persistence, sorting, dialog Escape/focus restoration, mobile navigation, and reduced motion.
- Desktop/mobile screenshots plus a forced-colors rendering for inspection.

The test waits for theme transitions to settle before contrast scans. It caught and led to fixes for active-navigation hover contrast and the mobile disclosure panel. Token-pair tests alone had not covered that actual hovered selector interaction.

`npm run test:bundle` builds the Nordic-only fixture and inspects every emitted artifact for all nine unrelated theme IDs. Its JSON report lists the inspected files and exclusions.

## Manual inspection performed

The generated desktop dashboard and mobile component screenshots were opened and visually inspected after the browser run. The forced-colors screenshot was also opened. Headless forced-colors emulation is not equivalent to Windows High Contrast Mode on physical hardware, so that remains a rendering check rather than platform certification. See `artifacts/` after running the browser suite.

## Contrast caveats

Documented pairs cover primary/secondary/muted text, links, action states, selected states, inputs/placeholders, invalid feedback, and all four status pairs. Disabled controls are exempt from WCAG contrast minima but retain readable values. Large-text thresholds are not substituted for the stricter 4.5:1 normal-text checks. Component boundaries and focus indicators are checked at 3:1 where applicable; text itself still needs 4.5:1.

All bundled text surfaces are opaque. The only alpha color is the modal overlay, which is not a foreground/background text pair. Ocean Glass uses opaque layered surfaces and inset shadows, so no translucent surface is silently exempted from measurement.

## Still requires human/platform verification

- Screen readers (NVDA, JAWS, VoiceOver) and voice control.
- Full keyboard review across every theme, including focus appearance against every adjacent layered background.
- 200%/400% browser zoom, text-only zoom, 320 CSS-pixel reflow, and long translated content.
- Actual Windows forced-colors themes, high-contrast OS settings, and mobile browser display modes.
- Touch target spacing on physical devices and pointer cancellation across real input hardware.
- Browser matrix beyond the installed Chromium used for the automated run.

Native `<dialog>` supplies top-layer modality and focus containment in supported browsers; the controller supplies deliberate naming, initial focus, and restoration. This does not remove the need for assistive-technology testing. Report any unrun item explicitly rather than claiming blanket WCAG conformance.
