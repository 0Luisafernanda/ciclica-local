# Ciclica Local — visual system brief

## North star
Ciclica Local should feel like a calm, private, pocket-sized companion: premium, legible, and emotionally steady. The UI should never feel like a dashboard, CRM, or debug console.

## Design principles
1. **One primary surface**
   - The default screen must always feel like the center of gravity.
   - Secondary surfaces support the primary view; they never compete with it.

2. **No visual noise**
   - Every element needs a job.
   - If a component does not improve clarity, trust, or actionability, remove it.

3. **Quiet premium**
   - Use restraint, spacing, and typography to create quality.
   - Prefer calm confidence over flashy decoration.

4. **Private by design**
   - The UI should communicate local-first privacy naturally, not as a marketing banner.
   - Settings, export, and deletion should be present but discreet.

## Visual direction

### Brand feeling
- Human
- Calm
- A little editorial
- Highly legible
- Personal, not institutional
- Productive without looking technical

### What to avoid
- Dashboard density
- Equal-weight cards everywhere
- Decorative gradients
- Too many colors
- Loud shadows
- Icons used as ornament
- Sidebars as the main navigation language
- Any control whose purpose is not obvious

## Color system

### Palette roles
- **Background:** soft neutral, not stark white
- **Surface:** slightly raised neutral panel
- **Text primary:** near-black with warmth
- **Text secondary:** muted gray for support text only
- **Accent:** one strong brand color for primary actions
- **Danger:** used only for destructive confirmations

### Color rules
- One primary accent only.
- No rainbow UI.
- No semantic colors unless they communicate actual state.
- Contrast must stay strong enough for calm reading.
- Background and surface contrast should be subtle, not stark.

## Typography

### Type behavior
- Use a modern system-like sans serif.
- Keep headings confident and short.
- Keep body text warm and easy to scan.
- Use few weights; avoid typographic noise.

### Hierarchy
1. Page title / hero
2. Supporting line
3. Primary action or daily reading
4. Secondary insight
5. Metadata

### Rules
- Headings should be direct, not poetic.
- Body copy should be short and specific.
- Labels should be functional, not decorative.
- Do not overuse uppercase or tiny labels.

## Layout

### Desktop
- Constrain width with a centered app container.
- Keep the surface pocket-sized even on large screens.
- Use tabs or compact navigation, not a sidebar.

### Mobile
- Preserve a single visible primary loop.
- Navigation should stay lightweight and unobtrusive.
- No floating controls that cover content.

### Spacing
- Use generous breathing room around the hero.
- Use compact spacing inside forms and controls.
- Let empty space create calm, not emptiness.

## Component style

### Shell
- Minimal header
- Clear brand cue
- Small utility actions only
- No unnecessary chrome

### Tabs / navigation
- Compact
- Obvious
- Low visual weight
- Clearly indicates active state without shouting

### Cards
- Soft surfaces
- Mild radius
- Very light elevation or none
- Clear separation by spacing first, borders second

### Buttons
- One primary button style
- Secondary buttons should be quieter
- Destructive actions must look clearly destructive
- No novelty button shapes

### Inputs
- High legibility
- Clear focus state
- No complex chrome
- Placeholder text must not be mistaken for content

## UX rules by screen

### Today
- Show what matters now.
- Make the first answer immediate.
- Keep actions short and obvious.

### Patterns
- Show meaningful trends only.
- Avoid overloading the user with charts or noise.
- Signal what is worth noticing.

### Consult
- Make the screen feel shareable and trustworthy.
- The tone should support a professional conversation.
- Prioritize clarity over detail density.

### Transparency
- Explain why the product works this way.
- Make trust visible.
- Keep the content concise and honest.

## Microcopy tone
- Calm
- Human
- Clear
- Non-alarmist
- Non-clinical unless required
- Helpful, not verbose

### Good microcopy qualities
- Says what the user gets
- Explains why something exists
- Uses familiar words
- Avoids jargon

### Bad microcopy qualities
- Overly clever
- Too technical
- Too many internal labels
- Words that feel like placeholders

## Final taste test
A screen is good if:
- you know where to look first
- you understand why each element exists
- the app feels private and calm
- nothing looks like a CRM
- the UI feels elegant but not fragile
- removing one extra element improves the screen

## Implementation order
1. Lock visual tokens
2. Apply shell polish
3. Simplify each screen’s hierarchy
4. Remove noise
5. Verify in browser
