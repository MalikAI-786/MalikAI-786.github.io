# Presence — developer handoff

## Scope and evidence
Provisional MVP approved in conversation on September 12, 2026. The original AI Personal Appearance Coach 22-point plan was not available. No claim is made that this implements those 22 points. Working title: Presence; trademark availability not assessed.

## What it does
Select occasion, setting, dress code, style direction, expected weather, preparation time, and coverage preference. Generate an outfit suggestion, reasoning, three practical tips, and a 3–5-item checklist. Download a text plan or JSON feedback. Reset clears the working state. All recommendations use explicit local rules, not a model. No API key, account, uploads, backend, payments, or analytics required.

## Run and edit
Serve this directory with `python3 -m http.server 8080`, then open http://localhost:8080. No dependencies or build required. `index.html` owns the interface; `style.css` owns layout; `tokens.css` is a verbatim snapshot of the existing brand tokens; `app.js` contains validation, `makePlan`, DOM rendering, downloads, and an optional feature-detected WebMCP registration. `wardrobe.jpg` is a licensed illustrative photo, not an outfit generated for the user.

The GitHub copy is under `appearance-coach/` on the `codex/appearance-coach-mvp` branch of MalikAI-786/MalikAI-786.github.io. Keep edits confined to this folder. Do not modify the generated root README or brand assets. The branch is a reviewable handoff; merging is separate. Sites hosts the standalone demo.

## Acceptance criteria
1. Changing inputs alone marks the result stale; Build my plan applies them and clears prior checklist and feedback.
2. Each supported combination generates a nonempty plan. Unknown enums fail validation before state changes.
3. Five, fifteen, and thirty minutes yield three, four, and five checklist items.
4. Video produces camera guidance; weather and coverage preferences change their corresponding tips.
5. Checklist progress updates and exports reflect checked state.
6. Feedback rating is required, notes are capped at 1,000 characters, and the exported JSON includes the displayed plan, rating, and notes.
7. No input is transmitted or persisted. Refresh clears all choices. Downloaded files remain on the user's device.
8. Mobile layout collapses into one column. Native controls have labels and visible focus. Verify keyboard, screen-reader, mobile, and download behavior in real browsers before a wider pilot.

## Validation in this delivery
JavaScript syntax and exhaustive recommendation combinations checked. Local asset references checked. Browser/end-to-end and WebMCP runtime validation were unavailable under the permitted preview workflow; no claim of browser-tested behavior. GitHub CI/review outcome should be checked on the handoff PR.

## Improvements, in order
1. Obtain the original 22 points. Create a mapping: requirement, user benefit, MVP/later, acceptance test. Resolve differences with this provisional scope before expanding.
2. Test with five volunteer users preparing for a real occasion. Ask each to complete a plan unaided, identify one useful suggestion, and explain what is missing. Proposed pilot threshold: four of five complete unaided and find at least one useful suggestion. This is a proposed decision rule, not measured traction.
3. Add a small wardrobe inventory and explicit constraints (available garments, sensory comfort, preferred colors). This would address the largest current gap: plans cannot know what the user owns. Keep identity and cultural preferences self-described.
4. Add stylist-reviewed examples and alternative outfits, then test whether the extra choice improves usefulness or adds indecision. Dress-code guidance should remain flexible and context-specific.
5. Add AI only after the core flow is useful. Put the model call behind a server endpoint; never put credentials in client code. Validate input and output schemas, apply timeouts and request limits, and retain the rule engine as a clearly labeled fallback. Compare AI output with the baseline for relevance, constraint compliance, harmful language, and per-plan cost.
6. If photo features are later approved, first implement explicit consent, limited retention, deletion, and access controls. Do not infer sensitive identity, rank attractiveness, or offer diagnosis. Keep advice about clothing and the user's stated goals.

## Proposed AI contract (not implemented)
POST /api/plan accepts the current brief plus optional user-entered wardrobe items. Response: title, outfit, why, tips[], checks[], engine, version. Reject unknown enum values and excessive free text. Render model output as text, not HTML. Show which engine actually produced each plan. Add server-side abuse protection and cost ceilings before exposure.

## Known limits
Generic rules; no live weather, actual wardrobe knowledge, real-time fashion data, purchase links, model inference, durable feedback collection, cross-device accounts, or face analysis. The feedback download must be shared manually. Suggestions are illustrative and do not establish that an outfit meets a specific employer's or host's requirements. The demo URL contains no personal user data; visitor choices are ephemeral.

## Image provenance
Photo by David Kristianto, Unsplash: https://unsplash.com/photos/oyr0WnJuvFQ . License: https://unsplash.com/license . Downloaded September 12, 2026; commercially reusable under that license. No endorsement implied.
