# Awesome Human-Agent Collaboration in Data Science

**An experimental, living human-in-the-loop survey.**

This project explores how humans and AI agents collaborate on data science
and complex analytical workflows: how they divide work, where collaboration
breaks down, and which research questions remain open.

More than a paper list, it brings together an interactive research landscape,
traceable failure evidence, and evolving challenge synthesis. It is a working
research resource, not a completed or peer-reviewed systematic review.

## Explore the Survey

**[Open the website](https://jjydxfs-lab.github.io/awesome-human-agent-collaboration-in-data-science/)**

The homepage provides conference coverage, reading context, and links to all
reports. A useful reading order is:

1. **Literature Review Pipeline**: how collected metadata becomes a human-selected research set.
2. **3D Research Space**: selected papers, research dimensions, and within-set citation relationships.
3. **Evidence Audit**: extracted passages, paper provenance, and locations for checking interpretations.
4. **Challenge Landscape**: challenge definitions, supporting evidence, semantic maps, and temporal/community views.
5. **Error Analysis Pipeline**: how extraction and evidence merging feed the synthesis.

The Corpus Dashboard, Triage Browser, and Bucket Intersections provide broader
coverage and screening context. On GitHub, HTML files display as source; use
the deployed website for the interactive reports.

## Scope

- Human-agent interaction and collaboration in real-world, complex tasks.
- Data science, analytical workflows, and related systems, methods, and benchmarks.
- Graph analysis and reasoning as a related line of inquiry.
- Literature across ML, NLP, and HCI, with selected arXiv preprints added manually.

The current conference matrix spans 2023-2026 and ICML, ACL, ICLR, EMNLP,
NeurIPS, COLM, and CHI. Coverage varies by venue, year, source, and track;
the homepage identifies missing or partial coverage. A collected record does
not mean that a person has read or endorsed the paper. The conference matrix
does not enumerate every manually included preprint.

The bundled deep-analysis snapshot contains **81 selected papers, 639 merged
evidence rows, and 20 synthesized challenge clusters**. These describe this
snapshot, not an exhaustive census of the field.

## Human and LLM Roles

Humans define the research focus, select papers for deeper analysis, interpret
evidence, and decide which updates enter the standing research set. LLMs assist
with metadata triage, paper-card generation, failure/limitation evidence
extraction, and cross-paper synthesis. Code handles collection, local filtering,
provenance checks, and visualization.

Evidence extraction combines full-paper context with focused candidate
passages. Overlapping evidence is merged while retaining provenance. Challenge
definitions and research-gap questions are analytical interpretations, not
claims that the original authors necessarily made.

Human participation does **not** mean that every generated passage, label,
or conclusion has been manually verified. Inspect the linked evidence and
original papers before relying on an interpretation.

## Why Living?

The literature set and research questions evolve as papers and evidence are
added. Updates are prepared as increments, compared with a saved baseline,
and reviewed before promotion. A website deployment does not itself mean the
underlying research analysis was rerun.

This repository publishes static snapshots, not a continuously running crawler
or live database. The website's **Last updated** timestamp refers to site
packaging, not necessarily the collection date of every paper or analysis.

## Interpretation and Limitations

- Selection, keyword filtering, LLM judgments, and uneven source coverage can introduce bias. Relevant work may be missing.
- PDF-to-text quality can affect quotations and locations; provenance makes them inspectable, not automatically correct.
- Evidence counts are not independent paper counts. Multiple rows can come from one paper, and communities describe failures differently.
- Yearly changes describe this selected set. They do not establish field-wide popularity, prove a problem is solved, or demonstrate causal transfer between communities.
- Conference dates, preprint dates, and experiment timing differ; temporal order should not be read as causal evidence.
- Semantic-map distances are a projection aid, not a definitive taxonomy or proof of a shared failure mechanism.

## Repository Contents

This is the **static publication repository**, separate from the working
literature-review pipeline.

- `index.html`: unified entry point and coverage overview.
- `pages/`: bundled reports, including their embedded display data.
- `assets/`: local visualization libraries and shared styles.
- `coverage.json`: conference coverage snapshot used by the homepage.
- `manifest.json`: package file hashes and upstream source-path references.
- `.nojekyll`: serves the bundle as plain static files on GitHub Pages.

Upstream source paths in the manifest document provenance; the corresponding
working files are not included. The bundle excludes pipeline credentials,
PDFs, full-text caches, and the working `data/` directory. All published HTML
and its embedded data are publicly accessible.

## Hosting and Local Preview

The static files live at this repository's root. GitHub Pages publishes the
`main` branch from `/ (root)`. No build step or API key is needed to view the site.

For local preview, run from this repository's root:

```bash
python3 -m http.server 8088
```

Open `http://localhost:8088/`. Use HTTP rather than opening files directly:
the 3D report uses JavaScript modules. Deployment does not run any LLM calls
or synchronize personal browser notes.

## Credits

Maintained by [@JJYXDSF](https://jjydxfs.github.io/), developed in collaboration
with Codex. Original papers remain the work of their respective authors;
please cite those papers for their findings. Bundled third-party libraries
retain their own license notices.
