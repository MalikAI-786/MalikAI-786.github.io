# Instructions for AI agents — newsletter drafting

> 🚨 **Renamed 2026-09-03 — the newsletter is `How Would We Know`, not `Proof
> Over Promise`.**
> `proofoverpromise.substack.com` was never ours: it is **William Zhu's**
> publication, *"Proof Over Promise: How to Build an Undeniable Career in the
> Age of AI"*, with posts bylined him dated August 2026 — verified by search,
> since Substack is unreachable from the build environment. Every Subscribe
> CTA on the site and every generated footer pointed at his newsletter until
> Yasir confirmed the replacement name and the codebase was renamed to match.
>
> The canonical name and URL now live in `assets/brand/links.py`
> (`NEWSLETTER_NAME`, `SUBSTACK` = `https://howwouldweknow.substack.com`) — every
> generator that needs either imports from there. Change a name or URL there,
> not by hand in a generator or a page.
>
> **There is still no live Substack publication.** `howwouldweknow.substack.com`
> does not exist yet — creating it is Yasir's, not something this environment
> can do (Substack is unreachable from here regardless). Nothing here should
> claim or imply the publication is live until he says so.
>
> **Do not publish, and do not rename again on your own** — the name and the
> public URL are Yasir's calls.

Read the root **[AGENTS.md](../../AGENTS.md)** first. Every safeguard there
applies here, and two of them apply hardest: never invent a fact about him, and
never send anything as him.

## What this directory is

`voice.md` is the deliverable. It is the system prompt for **How Would We
Know** — the editorial position, the five threads, the facts on the record,
and the lines a draft may not cross. `draft_issue.py` is plumbing around it.

## Rules

1. **`voice.md` is the editing surface.** Change how issues read by changing
   `voice.md`, not by patching the script or the draft afterwards.

2. **The facts section in `voice.md` is a whitelist.** It lists every
   biographical and professional fact that is on the public record, and the
   prompt states those are the only ones that may be asserted. To let a draft
   use a new fact, add it there — with a source on the site. Never widen the
   list to something you inferred.

3. **Never loosen the research language.** The completed study reached
   **feasibility, not validation**. The AI-and-judgment work is **in
   development**. Both are stated in `voice.md`; do not soften, upgrade, or
   summarise them away.

4. **Never add a send path.** No Substack, no LinkedIn, no email, no scheduler.
   This tool writes a file and nothing else, and that is the point — it cannot
   transmit, so it cannot transmit by accident. If someone asks for publishing,
   bring it to him.

5. **Drafts stay out of git.** `tools/newsletter/drafts/` is gitignored on purpose.
   Do not commit a draft, do not `git add -f` one, and do not move output
   somewhere tracked.

6. **No participant data.** The study runs under IRB-25-0462. If source
   material contains a participant response, stop and say so — do not draft
   from it.

7. **Drafts are drafts.** Every one carries a `status: DRAFT` header and a
   disclosure line. Leave both intact.

8. **Run the gate.** `review.md` is the standard a draft must clear before it
   goes anywhere — Section A blocking, Section B quality. No draft skips it,
   including a short one, a good one, or a late one. Record the verdict in the
   handback note and in the Notion pipeline row. An agent never clears its own
   draft to publish; Yasir gives the final yes.

9. **Keep the pipeline honest.** Every issue is a row in *📰 Newsletter
   Pipeline — How Would We Know* under the Notion control center. Move the
   Stage as it moves and keep `Blocked on` current. A row parked at *Drafted*
   is the send-step bottleneck, and hiding it helps nobody.
