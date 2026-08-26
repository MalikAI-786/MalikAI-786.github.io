<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/brand/banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset=".github/brand/banner-light.png">
    <img alt="Research — Yasir A. Malik · Audit · Risk · Governance" src=".github/brand/banner-light.png">
  </picture>
</p>

# Research

Models, instrument, and analysis for doctoral research at Florida
International University on **what happens to professional judgment when
auditors begin trusting AI output more than their own review**.

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
| `qualitative/` | The qualitative arm. `protocol/`, `guide/`, `memos/`, `reflexivity/`, `coding/`, `propositions/`. |
| `data/` | Git-ignored. `data/README.md` records where the real data lives and who may access it. |
| `docs/` | Protocol, codebook, IRB correspondence, decision log. |

## The qualitative arm

Method doctrine lives in the site repository under `methods/`, public, so it can
be taught and cited. What lives here is the study: protocol, interview guide,
memos, coding, and the propositions that come out the other end.

**Transcripts are participant data.** They belong in `data/`, git-ignored, under
the same rule as everything else. A transcript in `qualitative/` is in the wrong
directory even after de-identification.

`reflexivity/` holds predictions recorded **before** each interview and scored
against the codes that actually emerged. That is the audit trail, and it only
counts if the prediction is committed before the outcome is known — a file
written afterwards proves nothing.

## Reproducing

Each script states its inputs and outputs in a header comment. Run them in
numeric order. Nothing writes outside `output/`, which is also git-ignored, so
a clean checkout plus the data directory reproduces every result.

## A note on method

The subject of this research is over-reliance on systems that agree with you.
That argument obliges the work itself: every model here carries a README
stating what it cannot do, and analysis decisions are logged in
`docs/decision-log.md` when they are made rather than reconstructed afterward.
A record written after the conclusion is not evidence of the reasoning.

---

<sub><b>Yasir A. Malik</b> · Audit · Risk · Governance — <a href="https://malikai-786.github.io">malikai-786.github.io</a> · <a href="https://linkedin.com/in/yasiramalik">LinkedIn</a></sub>
