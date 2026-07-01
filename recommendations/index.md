
<PageHero
  eyebrow="Catalogue · SMART International Recommendations"
  title="Recommendations already modelled"
  lede="Each OIML International Recommendation listed here has been fully decomposed into machine-readable requirements, conformance tests, calculation-powered forms, and terminology. The structured data drives the interactive application — these pages summarize what each Recommendation covers."
/>



<DraftCallout />
## In the catalogue

<div class="rec-grid">
  <a class="rec-card" href="/recommendations/r60/">
    <div class="rec-num">R 60 · 2021</div>
    <h3>Load cells</h3>
    <p class="scope">
      Metrological regulation for load cells used in nonautomatic weighing
      instruments. The pilot SMART Recommendation — the most complete model.
    </p>
    <div class="meta">
      <span><strong>42</strong> reqs</span>
      <span><strong>18</strong> tests</span>
      <span><strong>12</strong> forms</span>
    </div>
  </a>
  <a class="rec-card" href="/recommendations/r129/">
    <div class="rec-num">R 129 · 2000</div>
    <h3>Mass of road vehicles</h3>
    <p class="scope">
      Dynamic measuring instruments for the determination of mass of road
      vehicles in motion — weighing-in-motion (WIM) systems.
    </p>
    <div class="meta">
      <span><strong>35</strong> reqs</span>
      <span><strong>14</strong> tests</span>
      <span><strong>9</strong> forms</span>
    </div>
  </a>
  <a class="rec-card" href="/recommendations/r144/">
    <div class="rec-num">R 144 · 2006</div>
    <h3>Gas meters</h3>
    <p class="scope">
      Diaphragm gas meters for custody transfer and billing of fuel gases.
    </p>
    <div class="meta">
      <span><strong>28</strong> reqs</span>
      <span><strong>11</strong> tests</span>
      <span><strong>8</strong> forms</span>
    </div>
  </a>
</div>

## In progress

The catalogue grows as OIML Technical Committees prioritize and resource
new SMART modelling work. Priority is set by member-state demand and
OIML-CS coverage.

To request a new Recommendation or contribute to an in-progress one, see
[Getting Involved](/about/contact.html) or open an issue in the
[smart application repository](https://github.com/oimlsmart/smart).

## How a SMART Recommendation is structured

Each modelled Recommendation is organized as a directory under
`data/<recommendation>/` containing:

- `standard.yaml` — identity, value model (calculations, tables), terminology.
- `dimensions.yaml` — classification axes (accuracy class, load range, etc.).
- `requirements/` — requirements classes with structured acceptance criteria.
- `conformance/` — conformance test procedures.
- `forms/` — test report form schemas with embedded calculations.

The build pipeline validates every cross-reference, generates TypeScript
modules, and the interactive application loads them at runtime. Adding a new
Recommendation is a YAML-only task — see the
[Adding a Standard](/docs/workflow/adding-a-standard.html) guide.
