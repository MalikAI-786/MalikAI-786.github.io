<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://malikai-786.github.io/assets/brand/banners/research/banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://malikai-786.github.io/assets/brand/banners/research/banner-light.png">
    <img alt="Research — Yasir A. Malik" src="https://malikai-786.github.io/assets/brand/banners/research/banner-light.png" width="100%">
  </picture>
</p>

# Research

Models, instrument, and analysis for doctoral research at Florida International
University on **what happens to professional judgment when auditors begin
trusting AI output more than their own review**.

IRB-approved empirical study, IRB-25-0462.

> ### Human-subjects data does not live in this repository
>
> `data/` is git-ignored and stays that way. Under the IRB protocol,
> participant data is held in approved storage only. What lives here is the
> instrument, the models, the analysis code, and the documentation needed to
> reproduce the work given access to the data.
>
> If a file contains a participant response, it is in the wrong place.

## Layout

| Path | What belongs here |
| --- | --- |
| `instrument/` | The measurement model. Constructs, items, scales, and the Qualtrics export. |
| `models/` | Models built from the research. One directory each, with its own README stating inputs, assumptions, and known limits. |
| `analysis/` | Scripts in run order: exploratory factor analysis, confirmatory factor analysis, structural model. |
| `data/` | Git-ignored. `data/README.md` records where the real data lives and who may access it. |
| `docs/` | Protocol, codebook, IRB correspondence, decision log. |

## Reproducing

Each script states its inputs and outputs in a header comment. Run them in
numeric order. Nothing writes outside `output/`, which is also git-ignored, so a
clean checkout plus the data directory reproduces every result.

## A note on method

The subject of this research is over-reliance on systems that agree with you.
That argument obliges the work itself: every model here carries a README stating
what it cannot do, and analysis decisions are logged in `docs/decision-log.md`
when they are made rather than reconstructed afterward. A record written after
the conclusion is not evidence of the reasoning.

---

<sub>[Profile](https://github.com/MalikAI-786) · [Site](https://malikai-786.github.io) · [Brand system](https://malikai-786.github.io/brand.html) · [Newsletter](https://proofoverpromise.substack.com) · [LinkedIn](https://linkedin.com/in/yasiramalik)</sub>

<sub><b>Yasir A. Malik</b> · Audit · Risk · Governance · Newark, NJ · NYC metro</sub>
