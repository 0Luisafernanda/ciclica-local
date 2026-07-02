# Ciclica Local Information Architecture & Content Hierarchy Plan

> **For Hermes:** Use this plan task-by-task. Do **not** start with the navigation bug; that is intentionally deferred until the structure is defined.

**Goal:** Redefine Ciclica Local’s product structure, hierarchy, and content model so the app feels like a focused pocket app with one primary daily view and clear secondary destinations.

**Architecture:** Treat the product as a single-core mobile-first experience: one primary action surface (“Hoy”), three supporting destinations, and a compact settings/profile layer. The UI should answer four questions immediately: what is this app, why does it matter, what can I do here today, and where do I go next?

**Tech Stack:** Vanilla ES modules, static HTML/CSS, localStorage-backed state, browser-based verification.

---

## What we know now

Current app surfaces:
- `Hoy` — daily capture + immediate interpretation
- `Patrones` — 28-day pattern scan + findings
- `Consulta` — exportable summary for a professional conversation
- `Laboratorio` — transparency/logbook about product decisions
- `Ajustes` / profile modal — onboarding and local profile setup

Current risks / gaps:
- The app still behaves like a multi-section dashboard if the hierarchy is not deliberately constrained.
- The primary screen needs a stronger narrative: value, purpose, and next action must be obvious in under 5 seconds.
- Secondary sections need a clear role so they feel supportive, not competing.
- The copy mix still leans on feature descriptions instead of user-facing product promises.
- The “Laboratorio” destination needs to be explicitly framed as transparency, not a generic settings or debug area.

This plan focuses only on structure, hierarchy, content framing, and navigation semantics.

---

## Proposed product structure

### Primary surface: Hoy
This is the only screen that should feel like the app’s center of gravity.

**Purpose:**
- capture today’s state fast
- communicate the most relevant insight
- guide the next best action

**Must contain:**
- day label / current date
- current state summary (very short)
- one strong headline: what matters now
- one explanatory paragraph: why it matters
- 3 compact chips / tags that summarize status
- one local reading card (“qué observar hoy”)
- one primary action area for quick entry
- one secondary note field

**Should avoid:**
- long explanatory blocks above the fold
- duplicate messaging across multiple cards
- too many competing CTAs
- any “dashboard” feeling

### Secondary surface: Patrones

**Purpose:**
- help the user understand trends over time
- show only meaningful patterns, not raw data overload

**Must contain:**
- a 28-day visual scan
- a short “lecturas útiles” stack
- a clearly labeled rationale for why a finding matters

**Should avoid:**
- over-detailed charts
- clinical sounding analysis without user benefit
- dense metrics that require interpretation effort

### Secondary surface: Consulta

**Purpose:**
- create a clean, exportable summary for a professional conversation
- reassure the user that this is a human-readable record, not a diagnosis engine

**Must contain:**
- a short explanation of what the summary is for
- a primary export/copy action
- a readable report with safe language

**Should avoid:**
- diagnostic claims
- technical jargon
- huge walls of text without sectioning

### Secondary surface: Laboratorio

**Purpose:**
- communicate product transparency and evolution
- show what the app currently supports, what is planned, and what is intentionally blocked

**Must contain:**
- a title that frames it as transparency / product log
- a brief explanation of why it exists
- status cards for rules, safety constraints, and roadmap items

**Should avoid:**
- making it feel like a developer console
- exposing internal mechanics without user value
- competing with Hoy for attention

### Settings / profile layer

**Purpose:**
- optional configuration, not the main journey
- keep onboarding lightweight and non-judgmental

**Must contain:**
- last period date
- approximate cycle length
- cycle regularity
- optional contexts (SOMP/SOP, PMDD, endo, contraception, perimenopause, no fertility focus)

**Should avoid:**
- forcing the user through long setup before they can act
- wording that implies diagnosis or certainty

---

## Content hierarchy principles

1. **One primary action per screen.**
   - On Hoy, the main action is register/adjust today.
   - Everything else supports that.

2. **Explain value before features.**
   - “Qué puedo hacer hoy” beats “qué módulos tengo”.
   - “Por qué sirve” beats “cómo está construido”.

3. **Put the user’s state before system metadata.**
   - Start with what matters now.
   - The phase estimate is a support layer, not the headline.

4. **Use progressively deeper layers.**
   - Top layer: summary.
   - Middle layer: explanation.
   - Bottom layer: detailed evidence / history / transparency.

5. **Keep secondary destinations supportive.**
   - Patrones = pattern sensemaking.
   - Consulta = sharing / reporting.
   - Laboratorio = trust / transparency.

6. **Avoid CRM / dashboard semantics.**
   - No “modules”, “widgets”, “metrics board”, “panels” as the main narrative.
   - Favor “vista”, “lectura”, “registro”, “patrón”, “resumen”, “transparencia”.

---

## User-facing story to validate

The app should answer these questions immediately:

- **What is this?**
  - A private local app for understanding your cycle without cloud tracking.

- **Why is it valuable?**
  - It helps you notice patterns, make sense of today, and prepare a conversation if needed.

- **What do I find here?**
  - A simple daily view, a pattern view, a summary for consultation, and a transparency log.

- **How do I use it?**
  - Open Hoy, record the day, glance at the guidance, and only move deeper when you want more context.

---

## Implementation plan

### Task 1: Write the IA / content model spec

**Objective:** Turn the product story into a concrete content model with labels, purpose statements, and priorities.

**Files:**
- Create: `.hermes/plans/2026-07-01_203005-pocket-ia-structure.md`
- Modify later: `src/data/labels.js`
- Modify later: `README.md`

**Deliverable:**
- Finalize the list of primary and secondary surfaces
- Define one-sentence purpose for each surface
- Define the top-level product promise and the user story hierarchy

**Verification:**
- The specification should let a new contributor explain the app in <30 seconds.
- The primary view should be obviously the daily capture view.

---

### Task 2: Refactor labels and navigation semantics

**Objective:** Rename/adjust labels so the UI language matches the intended hierarchy.

**Files:**
- Modify: `src/data/labels.js`
- Modify: `src/components/Shell.js`
- Modify: `src/components/ProfileModal.js`

**Likely changes:**
- confirm whether “Laboratorio” remains the right label or should become a more transparent term like “Transparencia”
- decide whether “Consulta” should be phrased as “Resumen” or stay as consultation-focused
- tighten microcopy for top header, screen header, and onboarding
- ensure the profile modal is framed as optional setup, not required onboarding

**Verification:**
- On first glance, the app should read like a pocket app with a single center.
- Secondary tabs should feel like supporting tools, not peers to the main screen.

---

### Task 3: Rebuild the primary view hierarchy

**Objective:** Make `Hoy` the strongest, cleanest, and most obvious screen.

**Files:**
- Modify: `src/components/TodayView.js`
- Modify: `src/styles.css`

**Content rules:**
- headline must be the main emotional anchor
- explanatory paragraph must be concise and specific
- chips must summarize status, not repeat paragraphs
- guidance card must be short enough to read in one glance
- quick capture form should sit below the narrative, not dominate above it

**Verification:**
- In the first viewport, the user should understand what to do today without scrolling.
- The page should feel calm and deliberate, not packed.

---

### Task 4: Define the role of supporting views

**Objective:** Give each secondary section a clear job and limit its surface area.

**Files:**
- Modify: `src/components/PatternsView.js`
- Modify: `src/components/ConsultView.js`
- Modify: `src/components/LibraryView.js`
- Modify: `src/domain/cycle.js`
- Modify: `src/domain/report.js`

**Notes:**
- `Patrones` should emphasize “useful interpretation” rather than raw history.
- `Consulta` should become a polished report with sections and trust-building phrasing.
- `Laboratorio` should feel like a transparent product log / roadmap note, not a developer area.
- adjust domain copy so the meaning of each destination is consistent with the UI.

**Verification:**
- Each tab should answer a different user question.
- No tab should feel like a duplicate of another.

---

### Task 5: Write the product narrative in the README

**Objective:** Document the app story so the codebase explains itself.

**Files:**
- Modify: `README.md`

**What to add:**
- one paragraph on what Ciclica Local is
- what the user finds in each section
- privacy-first / local-first promise
- a short “why this exists” section

**Verification:**
- A new contributor should understand the app’s hierarchy from the README alone.

---

### Task 6: Validate the hierarchy in browser

**Objective:** Confirm the new structure feels pocket-sized and that the content order is correct.

**Files:**
- No code changes expected unless the verification reveals layout issues

**Steps:**
1. Open the app in browser.
2. Confirm the default landing screen is clearly Hoy.
3. Check that the first screen communicates value, not just inputs.
4. Click through the secondary tabs and verify each one has a distinct role.
5. Use the browser console only to confirm there are no runtime errors.

**Expected result:**
- The app should feel like one primary daily surface with four support destinations.
- The product hierarchy should be obvious without explanation.

---

## Later phase, intentionally deferred

After the structure is stable, we will fix the navigation bug you mentioned:
- default landing / tab state can fall into the wrong view
- clicking between sections currently exposes a broken layout state
- that issue should be handled **after** the hierarchy is settled

---

## Risks / tradeoffs

- If we overexplain the purpose, the app may become text-heavy.
- If we underdescribe the tabs, secondary views may feel vague.
- If “Laboratorio” is kept without framing, it can still feel too technical.
- A too-large headline stack on Hoy could make the screen feel like marketing instead of utility.

---

## Success criteria

We’re done when:
- the app has a clear pocket-first hierarchy
- Hoy is the unmistakable center
- each secondary tab has a distinct job
- the product story is obvious from the UI and README
- the structure reads as intentional, not as a pile of views
