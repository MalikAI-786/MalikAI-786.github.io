#!/usr/bin/env python3
"""
The signature family, generated so five near-identical blocks cannot drift.

One signature cannot serve a dissertation committee, a recruiter, opposing
counsel, and the fourth reply in a thread. Using the full block every time is
how a signature stops being read. So there are five, and they differ only in
what they claim and which number answers.

Two rules the generator enforces rather than trusts:

  Numbers are routed, not repeated. Professional lines carry the 786; personal
  carries the 305; legal correspondence carries both, because in that context
  being reachable matters more than being tidy.

  No line asserts something the workflow does not actually do. The AI-use
  disclosure on the legal signature says what is true and defensible — that
  assistance is used, that every assertion is reviewed and adopted, that no
  system decides anything. It deliberately does NOT claim that no material
  ever reaches a model, because that claim would be unverifiable, and a
  disclosure that overstates is worse to hand an opposing party than no
  disclosure at all.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "signature.html")

MARK = "https://malikai-786.github.io/assets/brand/signature-mark.png"
SITE = "https://malikai-786.github.io/"
EMAIL = "YasirAMalik@gmail.com"

PRO_TEL = ("+1 (786) 704-8536", "+17867048536")

# Not known to this generator, and never to be guessed. A signature that
# ships a plausible-looking wrong number is worse than one with a visible gap.
PERSONAL_TEL = ("+1 (305) &mdash; &mdash; &mdash;", None)

EMBER, INK, MUTED, FAINT, LINE = "#E0662E", "#171A1D", "#5A646E", "#8A929B", "#E2DAD3"
EMBER_TEXT = "#AD4317"

SERIF = "Georgia,'Times New Roman',serif"
SANS = "Arial,Helvetica,sans-serif"


def a(href, text, col=EMBER_TEXT):
    return f'<a href="{href}" style="color:{col};text-decoration:none;">{text}</a>'


def tel(pair):
    label, href = pair
    return a(f"tel:{href}", label, MUTED) if href else f'<span style="color:{FAINT};">{label}</span>'


def rule():
    return ('<div style="font-size:1px;line-height:1px;height:14px;">&nbsp;</div>'
            f'<div style="border-top:1px solid {LINE};font-size:1px;line-height:1px;height:1px;">&nbsp;</div>'
            '<div style="font-size:1px;line-height:1px;height:12px;">&nbsp;</div>')


def block(middle, contact, mark=True, name_size=19):
    """A signature. Table layout, inline styles, no web fonts, no SVG."""
    img = (f'<td style="padding:0 18px 0 0;vertical-align:top;">'
           f'<img src="{MARK}" width="56" height="56" alt="Yasir A. Malik" '
           f'style="display:block;width:56px;height:56px;border:0;outline:none;'
           f'text-decoration:none;"></td>') if mark else ""
    pad = "0 0 0 18px" if mark else "0 0 0 14px"
    return f"""<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:{SANS};">
  <tr>
    {img}<td style="padding:{pad};vertical-align:top;border-left:2px solid {EMBER};">
      <div style="font-family:{SERIF};font-size:{name_size}px;line-height:{name_size+5}px;font-weight:bold;color:{INK};letter-spacing:-0.2px;">Yasir A. Malik</div>
      <div style="font-family:{SANS};font-size:10px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:{EMBER_TEXT};padding-top:3px;">Audit &middot; Risk &middot; Governance</div>
{middle}{rule() if contact else ""}
      <div style="font-family:{SANS};font-size:12px;line-height:20px;color:{MUTED};">
{contact}
      </div>
    </td>
  </tr>
</table>"""


# --------------------------------------------------------------------------

ACADEMIC = block(
    middle=f"""      <div style="font-family:{SERIF};font-size:13px;line-height:20px;color:{MUTED};padding-top:8px;"><span style="color:{INK};">Doctoral Candidate, DBA</span> &mdash; expected 2028<br>{a('https://www.fiu.edu/', 'Florida International University')}</div>
      <div style="font-family:{SERIF};font-size:13px;line-height:20px;color:{MUTED};padding-top:7px;"><span style="color:{FAINT};">Research:</span> {a(SITE + '#research', 'AI and professional judgment')}<br><span style="color:{FAINT};">Anchoring bias in audit judgment &middot; automation bias &middot; over-reliance</span></div>
""",
    contact=f"""        {a('mailto:' + EMAIL, EMAIL)}&nbsp;&middot;&nbsp;{tel(PRO_TEL)}&nbsp;&middot;&nbsp;<span style="color:{FAINT};">Newark, NJ</span><br>
        {a(SITE, 'malikai-786.github.io')}&nbsp;&middot;&nbsp;{a('https://github.com/MalikAI-786', 'github.com/MalikAI-786')}&nbsp;&middot;&nbsp;{a('https://linkedin.com/in/yasiramalik', 'LinkedIn')}<br>
        {a('https://github.com/MalikAI-786/malik-research', 'Instrument and models')}<span style="color:{FAINT};">, open &middot; </span>{a('https://proofoverpromise.substack.com', 'Proof Over Promise')}<span style="color:{FAINT};">, the newsletter</span>""")

PROFESSIONAL = block(
    middle=f"""      <div style="font-family:{SERIF};font-size:13px;line-height:19px;color:{MUTED};padding-top:7px;">Doctoral research on AI and professional judgment<br>{a(SITE + '#research', 'Florida International University &rarr;')}</div>
""",
    contact=f"""        {a('mailto:' + EMAIL, EMAIL)}&nbsp;&middot;&nbsp;{tel(PRO_TEL)}<br>
        {a(SITE, 'malikai-786.github.io')}&nbsp;&middot;&nbsp;{a('https://linkedin.com/in/yasiramalik', 'linkedin.com/in/yasiramalik')}&nbsp;&middot;&nbsp;{a('https://github.com/MalikAI-786', 'GitHub')}<br>
        {a('https://proofoverpromise.substack.com', 'Proof Over Promise')}<span style="color:{FAINT};">, a newsletter on AI governance and professional judgment</span>""")

PERSONAL = block(
    middle="",
    contact=f"""        {a('mailto:' + EMAIL, EMAIL)}&nbsp;&middot;&nbsp;{tel(PERSONAL_TEL)}<br>
        {a(SITE, 'malikai-786.github.io')}""")

LEGAL = block(
    middle=f"""      <div style="font-family:{SERIF};font-size:13px;line-height:19px;color:{MUTED};padding-top:7px;">Newark, New Jersey</div>
""",
    contact=f"""        {a('mailto:' + EMAIL, EMAIL)}<br>
        <span style="color:{FAINT};">Direct</span>&nbsp;{tel(PRO_TEL)}&nbsp;&middot;&nbsp;<span style="color:{FAINT};">Mobile</span>&nbsp;{tel(PERSONAL_TEL)}""")

# The disclosure that hangs below the legal signature.
DISCLOSURE = f"""<div style="font-family:{SANS};font-size:11px;line-height:17px;color:{MUTED};padding-top:16px;max-width:62ch;border-top:1px solid {LINE};margin-top:14px;">
  <span style="color:{INK};font-weight:bold;">Use of AI assistance.</span>
  Portions of this correspondence may be prepared with the assistance of AI
  tools. Every factual assertion, figure, and position stated here has been
  reviewed and adopted by me before sending, and I remain solely responsible
  for its content. No AI system exercises judgment or makes a decision on my
  behalf, and nothing in this message is transmitted on an automated basis.
</div>"""

REPLY = block(middle="", contact="", mark=False, name_size=15).replace(
    f"""
      <div style="font-family:{SANS};font-size:12px;line-height:20px;color:{MUTED};">

      </div>""",
    f"""
      <div style="font-family:{SANS};font-size:11px;line-height:18px;color:{MUTED};padding-top:2px;">{a(SITE, 'malikai-786.github.io')}</div>""")


VARIANTS = [
    ("Academic", "The full block. Faculty, your committee, journals, conference "
     "organisers, research collaborators, and anyone meeting you for the first "
     "time. Carries the <b>786</b>.", ACADEMIC, None),

    ("Professional", "The working default. Recruiters, advisory enquiries, "
     "regulators, colleagues. Keeps the doctoral line as a differentiator, "
     "drops the research detail. Carries the <b>786</b>.", PROFESSIONAL, None),

    ("Personal", "Friends, family, anything not work. Carries the <b>305</b> "
     "and nothing that reads as a pitch.", PERSONAL,
     "The 305 number is not filled in &mdash; I do not have it and will not "
     "guess at a phone number. Send it and it goes in."),

    ("Legal correspondence", "For matters where both numbers should reach you "
     "and the record matters. Deliberately plain: no newsletter, no GitHub, "
     "nothing that reads as marketing in a file that may be read back to you.",
     LEGAL + DISCLOSURE,
     "<b>Have your attorney approve the disclosure before you use it.</b> "
     "Whether to volunteer an AI-use statement to an opposing party is a "
     "strategic decision, not a design one, and I am not your lawyer. Note "
     "what it does <i>not</i> say: it makes no claim about what does or does "
     "not reach a model, because that claim would be unverifiable &mdash; and "
     "an overstated disclosure handed to an opponent is worse than none."),

    ("Reply", "Second message onward, and phones. They already know who you "
     "are. No image at all, so it cannot trip an image blocker or a mobile "
     "data warning.", REPLY, None),
]


def page():
    out = [f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Email signatures — Yasir A. Malik</title>
</head>
<body style="margin:0;padding:0;background:#F6F3F0;font-family:{SANS};color:{INK};">

<!-- =====================================================================
     EMAIL SIGNATURES — The Reference Mark
     Generated by assets/brand/make_signatures.py. Do not edit this file;
     change the generator and re-run it.

     Built for mail clients, not browsers: table layout, every style
     inline, no CSS variables, no web fonts, no SVG. Georgia stands in for
     Charter because it is the one serif present on effectively every
     client on every platform. The mark is a hosted PNG at 3x with width
     and height set, so it stays sharp on retina and holds its box even
     when images are blocked.

     Ember #E0662E measures 3.11:1 on paper, so it never carries text
     here. #AD4317 does.
     ===================================================================== -->

<div style="max-width:720px;margin:0 auto;padding:36px 22px 60px;">

  <div style="font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:{EMBER_TEXT};padding-bottom:10px;">Email signatures</div>
  <div style="font-family:{SERIF};font-size:29px;line-height:35px;font-weight:bold;">Five weights, one identity.</div>
  <p style="font-size:14px;line-height:22px;color:{MUTED};max-width:62ch;margin:11px 0 0;">
    Select a block, copy it, and paste into <b>Gmail &rsaquo; Settings &rsaquo; Signature</b>.
    Gmail lets you save several and pick one per message, which is the point of
    having five. Copy the signature itself, not the dashed frame around it.
  </p>
  <p style="font-size:13px;line-height:21px;color:{MUTED};max-width:62ch;margin:12px 0 0;padding:13px 16px;background:#FFFFFF;border:1px solid {LINE};border-left:3px solid {EMBER};">
    <b style="color:{INK};">Which number answers.</b> Professional and academic
    carry the <b>786</b>. Personal carries the <b>305</b>. Legal correspondence
    carries both, because there being reachable beats being tidy.
  </p>
"""]

    for i, (title, note, body, warn) in enumerate(VARIANTS, 1):
        out.append(f"""
  <div style="margin-top:34px;padding-top:22px;border-top:1px solid {LINE};">
    <div style="font-family:{SERIF};font-size:19px;font-weight:bold;">{i} &middot; {title}</div>
    <p style="font-size:13px;line-height:20px;color:{MUTED};margin:5px 0 0;max-width:64ch;">{note}</p>
  </div>

  <div style="margin-top:15px;border:1px dashed {LINE};background:#FFFFFF;padding:24px;">

{body}

  </div>""")
        if warn:
            out.append(f"""
  <div style="margin-top:11px;background:#FFFFFF;border:1px solid {LINE};border-left:3px solid {EMBER};padding:14px 17px;font-size:12.5px;line-height:20px;color:{MUTED};">{warn}</div>""")

    out.append(f"""

  <div style="margin-top:34px;background:#FFFFFF;border:1px solid {LINE};border-left:3px solid {EMBER};padding:18px 20px;">
    <div style="font-family:{SERIF};font-size:15px;font-weight:bold;color:{INK};">Two things that break signatures</div>
    <p style="font-size:12.5px;line-height:20px;color:{MUTED};margin:8px 0 0;">
      <b style="color:{INK};">Do not paste it as an image.</b> A screenshot of a
      signature has no working links, disappears when images are blocked, and is
      unreadable to a screen reader. These are HTML tables on purpose.
    </p>
    <p style="font-size:12.5px;line-height:20px;color:{MUTED};margin:9px 0 0;">
      <b style="color:{INK};">Do not let Gmail restyle it.</b> If the fonts come
      out wrong after pasting, undo, then paste again with
      <b>Ctrl/Cmd&nbsp;+&nbsp;Shift&nbsp;+&nbsp;V</b> and check the mark still
      appears. Gmail occasionally strips a table cell on the first attempt.
    </p>
  </div>

  <div style="margin-top:26px;font-size:11px;line-height:18px;color:{FAINT};">
    {a('https://malikai-786.github.io/brand-assets.html', 'Asset index')} &middot;
    {a('https://malikai-786.github.io/assets/brand/signature-options/compare-light.png', 'Signature mark options')} &middot;
    {a('https://malikai-786.github.io/brand.html', 'The brand system')} &middot;
    {a(SITE, 'malikai-786.github.io')}
  </div>

</div>

</body>
</html>
""")
    return "".join(out)


if __name__ == "__main__":
    html = page()
    with open(OUT, "w") as fh:
        fh.write(html)

    # Guard: no signature may ship a guessed phone number.
    import re
    for m in re.findall(r"\(305\)\s*([^<&]*)", html):
        if re.search(r"\d", m):
            raise SystemExit(f"A 305 number was filled in: {m!r}. "
                             "It was never supplied — do not guess it.")

    print(f"  signature.html   {len(VARIANTS)} variants, {len(html) // 1024} KB")
    print("  305 number left blank, as it was never supplied")
