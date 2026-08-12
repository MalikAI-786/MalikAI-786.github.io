<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://malikai-786.github.io/assets/brand/banners/site/banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://malikai-786.github.io/assets/brand/banners/site/banner-light.png">
    <img alt="The Site — Yasir A. Malik" src="https://malikai-786.github.io/assets/brand/banners/site/banner-light.png" width="100%">
  </picture>
</p>

# The site, and the identity system behind it

My research, advisory practice, and the brand that every other surface on this
account inherits from.

This is the canonical surface. Everything else on my GitHub either feeds it or
points back at it.

It also holds the identity system itself: the palette, the mark, and the
generators that produce every logo, banner, avatar and card I use. Nothing here
is drawn by hand. The whole family derives from one set of constants in
`assets/brand/make_marks.py`, so the mark on a business card and the mark on a
repository banner are provably the same geometry rather than two things that
happen to look alike.

The colour is not invented either. Ember `#E0662E` was sampled from a physical
badge holder and white-balanced. It carries a documented limitation, written
into the tokens file rather than discovered later: at 3.11:1 on paper it fails
WCAG for body text, so a darker cut (`#AD4317`) carries any words set on a light
ground.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The site |
| `brand.html` | The identity system, documented — palette, mark, type, usage rules |
| `newsletter.html` | Proof Over Promise |
| `linkedin.html` | Profile copy, kept in sync with the resume |

## The generators

| File | What it makes |
| --- | --- |
| `assets/brand/tokens.css` | Single source of truth for the palette |
| `assets/brand/make_marks.py` | The mark family — every other generator imports its geometry |
| `assets/brand/make_banners.py` | Repository banners, light and dark |
| `assets/brand/make_profile_hero.py` | The profile hero, with the portrait re-lit into the palette |
| `assets/brand/make_avatars.py` | Stream avatars — A, M, P letterforms |
| `assets/brand/make_linkedin.py` | LinkedIn cover, verified against the mobile crop |
| `assets/brand/make_card.py` | Business card |
| `assets/brand/make_readmes.py` | Every README on the account, including this one |

Each generator asserts its own clearances rather than trusting the eye. Run any
of them directly; they print what they wrote.

---

<sub>[Profile](https://github.com/MalikAI-786) · [Site](https://malikai-786.github.io) · [Brand system](https://malikai-786.github.io/brand.html) · [Newsletter](https://proofoverpromise.substack.com) · [LinkedIn](https://linkedin.com/in/yasiramalik)</sub>

<sub><b>Yasir A. Malik</b> · Audit · Risk · Governance · Newark, NJ · NYC metro</sub>
