# ES 192 Shape Efficiency Lab

Interactive 3D test rigs for **ES 192: Materials Selection in Mechanical Design** (Harvard SEAS), Week 8: buckling, shape factors and architectured materials.

**Live page:** https://curiositaslabs.github.io/es192-shape-lab/

| # | Tab | Link | What it shows |
|---|---|---|---|
| 1 | Columns | [#column](https://curiositaslabs.github.io/es192-shape-lab/#column) | Steel tube vs solid bar of the same mass in a press: the bar bows and buckles first |
| 2 | Thin walls | [#wall](https://curiositaslabs.github.io/es192-shape-lab/#wall) | Aluminium tube, same area, thinner and wider: stronger until the wall kinks |
| 3 | Cells | [#cells](https://curiositaslabs.github.io/es192-shape-lab/#cells) | Solid bar, tube and cellular beam of the same mass; hexagon, square, triangle or foam cells |
| 4 | Lattices | [#lattice](https://curiositaslabs.github.io/es192-shape-lab/#lattice) | Printed titanium lattices side by side: octet truss, open (BCC) lattice, gyroid and diamond TPMS sheets. Bet on which holds more, or press **Random pair** |
| 5 | Corrugation | [#sheet](https://curiositaslabs.github.io/es192-shape-lab/#sheet) | Flat vs corrugated steel sheet |

Each tab has a microscope strip (grains and atoms) that follows the load: elastic stretch, slip, kinking and fracture.

**Experiments** ([#experiments](https://curiositaslabs.github.io/es192-shape-lab/#experiments), or press `E`) is a predict-then-test guide with ten in-class experiments, at least one per tab. Each experiment has the question to ask, the setup steps, a **Load setup** button that puts the lab in that state with the load at zero, what to watch, and a folded answer that explains why. Every test curve marks where each specimen fails, and the deflection (or strain) at that point.

**Printable guide:** [Shape-Lab-Experiments-Guide.pdf](Shape-Lab-Experiments-Guide.pdf) has every setup, chart and answer (8 pages). Rebuild it with `cd tests && node experiments-pdf.js ../index.html ../Shape-Lab-Experiments-Guide.pdf`.

## Using it in class

- **Play** (▶ or Space) ramps the load; **New specimen** (N) resets a broken part.
- **Strain colours** (S) colour the part, and the atoms in the microscope, from blue (low) to red (failure).
- **Labels** (L) show forces, supports and section sizes; they are off by default.
- `1`–`5` switch tabs, `P` toggles Present mode (full screen), `R` resets the view, `E` opens the Experiments. **Sources** lists every equation with its Ashby 6e number and page.

## Embed in Canvas

In a Canvas page, switch the editor to HTML and paste:

```html
<iframe src="https://curiositaslabs.github.io/es192-shape-lab/#cells" width="100%" height="900" style="border:0" allowfullscreen title="ES 192 Shape Efficiency Lab"></iframe>
```

## Editing

`index.html` is a built, single-file page (works offline; three.js r128 is inlined, MIT licence).
Edit `es192-8a-shape-demos.src.html` (markup and CSS) and `js/*.js`, then rebuild:

```
python3 -I build-demos.py --copy-to .
```

Tests (headless Chrome): `cd tests && npm install && npm test`.

## Sources

Ashby, *Materials Selection in Mechanical Design*, 6th ed. (Elsevier, 2025): Eqs 11.3, 11.14, 11.15a, 11.38, 12.8–12.9, 13.3, 13.18, 13.20, 13.27–13.29. Column imperfections: EN 1993-1-1 §6.3.1. Wood strengths: USDA Wood Handbook (Sitka spruce). Gyroid and diamond TPMS: Naghavi et al., *Bioengineering* 9 (2022) 504, Table 7 (L-PBF Ti-6Al-4V). Full list in the page's **Sources** panel.
