/* ===================== experiments: in-class predict–observe–explain guide, one or more per tab =====================
   Each entry: tab, title, ask (what to ask the class), setup (steps shown), set (slider values), types (segment picks),
   watch (what to look for), answer (folded HTML). "Load setup" puts the lab in that state with the load at zero.
   Numbers are the lab's own model values (v8, 2026-10-20); re-check them if a model changes. */
const EXPS=[
{tab:'column',n:1,title:'Which column buckles first?',
 ask:'A solid steel bar and a steel tube have the same mass and the same length, 3 m. Push down on both. Which one gives way first, and how much more does the other one carry?',
 setup:['Tab 1, Columns','Length <i>L</i> = 3.00 m','Load at zero','Chart: Test curve'],set:{'c-L':3,'c-F':0},
 watch:['Press ▶. The load rises to 200 kN.','Watch each column bow sideways, then fold.','The ring on each curve marks its collapse. The number under it is the sideways bow at that moment.'],
 answer:`<p><b>The solid bar goes first, at 4.6 kN. The tube holds until 44 kN, about 9.5 times as much.</b></p>
 <p>A slender column fails by buckling: it bows sideways, and the bow grows until the steel yields. The buckling load is <i>F</i><sub>c</sub> = π²<i>EI</i>/<i>L</i>². Both columns use the same steel (same <i>E</i>) and the same area <i>A</i>. The difference is <i>I</i>, which measures how far the metal sits from the centre line. The tube puts its metal out at radius 28.7 mm. Its shape factor is about <i>r</i>/<i>t</i> ≈ 10 times the bar's, so it carries about 10 times the load.</p>
 <p>Bow at collapse: the bar 126 mm (off the chart, shown by the arrow), the tube 44 mm.</p>`},
{tab:'column',n:1,then:1,title:'Then try: make them short',
 ask:'Cut both columns to 1 m. Does the tube still win by 10 times?',
 setup:['Length <i>L</i> = 1.00 m','Load at zero'],set:{'c-L':1,'c-F':0},
 watch:['Press ▶ and compare the two collapse loads.'],
 answer:`<p><b>No, only by 4.6 times (162 kN against 35 kN).</b> At 1 m the tube is too stocky to buckle. Instead it squashes: the steel yields at σ<sub>y</sub> = 355 MPa, almost at the squash load σ<sub>y</sub><i>A</i> = 186 kN. The squash load depends only on the area, which is the same for both columns. Shape helps against buckling, not against crushing.</p>`},

{tab:'wall',n:2,title:'Thinner wall, same metal: stronger forever?',
 ask:'Spread the same 150 mm² of aluminium into a wider, thinner tube. Does it keep getting stronger? Which tube would you rather stand under when it fails?',
 setup:['Tab 2, Thin walls','<i>r</i>/<i>t</i> = 10 (31 mm tube, 1.5 mm wall)','Load at zero','Chart: Test curve'],set:{'w-k':0.231,'w-F':0},
 watch:['Press ▶. Note the load when the curve bends over (first yield) and where it levels off (plastic hinge).','Then load the second setup below and compare.'],
 answer:`<p><b><i>r</i>/<i>t</i> = 10:</b> the surface first yields at 579 N. The tube then carries up to 737 N while the yielding spreads through the wall. A plastic hinge forms at about 40 mm of tip deflection, and the load levels off. This failure is slow and gives plenty of warning.</p>`},
{tab:'wall',n:2,then:1,title:'Then try: a very thin wall',
 ask:'Same metal, now <i>r</i>/<i>t</i> = 80 (an 88 mm tube with a 0.55 mm wall). Is it stronger or weaker?',
 setup:['<i>r</i>/<i>t</i> = 80','Load at zero'],set:{'w-k':0.926,'w-F':0},
 watch:['Press ▶. Watch the squeezed underside near the clamp.','Switch to the Design chart to see the whole range of <i>r</i>/<i>t</i>.'],
 answer:`<p><b>It carries more (1,017 N) but fails suddenly.</b> The squeezed wall wrinkles (kinks) before the metal has yielded anywhere, at only 4.3 mm of deflection, and the load drops. The best tube is at <i>r</i>/<i>t</i> ≈ 39, at 1,457 N. Below that, thinner walls help, because the metal moves away from the centre line. Above it, the wall is too thin to stay flat under compression. Ashby's limit, φ<sub>max</sub> ≈ 2.3(<i>E</i>/σ<sub>f</sub>)<sup>½</sup> ≈ 38 (Eq 11.15a), predicts the same crossover.</p>`},

{tab:'cells',n:3,title:'Solid, tube or hexagons: which fails first?',
 ask:'Three wooden beams have the same mass of the same cell-wall material: a 40 mm solid bar, an 80 mm square tube and an 80 mm block of hexagonal cells. Hang a load on the end of each. Which one fails first, and why? Then: how far does each one bend before it breaks?',
 setup:['Tab 3, Cells','Inside the cellular beam: Hexagons','Relative density ρ/ρ<sub>s</sub> = 0.25','Load at zero','Chart: Test curve'],set:{'m-r':0.25,'m-P':0},cells:'hex',
 watch:['Press ▶. The load rises to 5 F₀ in about 7 seconds. Press Space to pause.','First a crease appears on the squeezed (lower) face, then the stretched (upper) face splinters.','The ring on each curve marks its break. The number under it is the tip deflection at the break.'],
 answer:`<table><thead><tr><th></th><th>Solid bar</th><th>Hexagons</th><th>Tube</th></tr></thead><tbody>
 <tr><td>Stiffer than the bar, ψ</td><td>1×</td><td>4×</td><td>7×</td></tr>
 <tr><td>Creases (first damage)</td><td>0.55 F₀ · 12 mm</td><td>1.10 F₀ · 5.9 mm</td><td>1.93 F₀ · 5.9 mm</td></tr>
 <tr><td>Breaks</td><td>1.00 F₀ · 28 mm</td><td>2.0 F₀ · 14 mm</td><td>3.5 F₀ · 14 mm</td></tr></tbody></table>
 <p><b>By load, the solid bar fails first, then the hexagons, then the tube.</b> Wood does not yield like steel. Its first damage is a crease (a kink band) on the squeezed face. This happens at 55% of the breaking load, because wood crushes along the grain at about 39 MPa but breaks in bending at about 70 MPa. The stress on the face is <i>M</i>/<i>Z</i>, where <i>Z</i> is the section modulus, so for the same moment the beam with the largest <i>Z</i> lasts longest. For the same mass, <i>Z</i> is 1 for the bar, 2 for the hexagons (= (ρ<sub>s</sub>/ρ)<sup>½</sup>) and 3.5 for the tube. The tube beats the hexagons because all of its wood sits at the faces, where the bending stress is largest. The hexagons spread their wood evenly through the depth, so the walls near the middle do little work.</p>
 <p><b>By deflection, the order flips.</b> The tube and the hexagons both break at 14 mm, half the bar's 28 mm. Wood breaks at a fixed strain, and the strain on the face is the half-depth <i>c</i> divided by the bend radius. A beam twice as deep therefore reaches that strain at half the bend: δ<sub>f</sub> ≈ ε<sub>f</sub><i>L</i>²/3<i>c</i>. Both deep beams are 80 mm (<i>c</i> = 40 mm), so they break at the same deflection. They are stiffer and stronger, but they give half the warning.</p>
 <p><b>Do they really have the same mass?</b> Yes. The hexagon block is 80 × 80 mm with 75% of its section empty: 0.25 × 80² = 1,600 mm², the same as the 40 × 40 mm bar. The tube's 5.4 mm wall also adds up to 1,600 mm².</p>
 <p class="note">The chart's millimetres are elastic values for the cell-wall solid (<i>E</i> 35 GPa). The 3D view draws the bending about 6 times larger so it can be seen; the ratios between the beams are the same.</p>`},
{tab:'cells',n:3,then:1,title:'Then try: very light beams',
 ask:'Make all three much lighter, at ρ/ρ<sub>s</sub> = 0.05. The tube is now 179 mm wide with a 2.3 mm wall. Does the tube still win?',
 setup:['Relative density ρ/ρ<sub>s</sub> = 0.05','Load at zero'],set:{'m-r':0.05,'m-P':0},cells:'hex',
 watch:['Press ▶. Watch the tube’s squeezed wall.'],
 answer:`<p><b>No.</b> The tube is still the stiffest (39× against 20×), but its thin wall wrinkles at 2.6 F₀ and the tube folds at 2.9 F₀. The hexagons hold until 4.5 F₀, because their inner walls brace one another and keep each wall flat. This is the thin-wall limit from tab 2 again, and it is why wood, bone and aircraft panels fill their sections with cells instead of using hollow tubes.</p>`},
{tab:'cells',n:3,then:1,title:'Then try: foam instead of aligned cells',
 ask:'Keep ρ/ρ<sub>s</sub> = 0.25 but switch the inside to Foam. Is it better or worse than the hexagons?',
 setup:['Inside the cellular beam: Foam','Relative density ρ/ρ<sub>s</sub> = 0.25','Load at zero'],set:{'m-r':0.25,'m-P':0},cells:'foam',
 watch:['Press ▶, then switch to the Design chart.'],
 answer:`<p><b>Much worse: no stiffer than the solid bar (ψ = 1), and it starts crushing at 0.17 F₀.</b> In a foam the walls meet at angles, so the load bends them instead of stretching them. Then <i>E</i> falls as (ρ/ρ<sub>s</sub>)² (Eq 13.18), which cancels the gain from the larger section. On the Design chart, aligned cells follow the slope-1 line and the foam follows slope 2.</p>`},

{tab:'lattice',n:4,title:'Which lattice holds more?',
 ask:'Two printed titanium lattices have the same density, 0.15. A is an octet truss and B is an open lattice. Place your bets: which one holds more stress?',
 setup:['Tab 4, Lattices','A: Octet · B: Open','Relative density ρ/ρ<sub>s</sub> = 0.15','Stress at zero','Students bet A or B (the bet buttons keep a streak)'],set:{'l-r':0.15,'l-P':0},lat:['octet','bcc'],
 watch:['Press ▶. The stress rises to 160 MPa.','Watch where each lattice snaps: along a 45° band.'],
 answer:`<p><b>The octet: 50 MPa against 17 MPa (2.9×). It is also 2.2× stiffer (5.8 against 2.6 GPa).</b> In the octet every node has 12 struts, enough that the struts can only stretch to let the lattice deform (Maxwell's rule, Eq 13.3). In the open lattice each node has only 8 struts, so they bend. Stretching is stiff, and <i>E</i> scales with ρ; bending is soft, and <i>E</i> scales with ρ². The Design chart shows the two slopes.</p>`},
{tab:'lattice',n:4,then:1,title:'Then try: how does each one fail?',
 ask:'Now compare the octet with a gyroid at density 0.40. Both hold about the same stress. Which would you put in a crash helmet or a bone implant?',
 setup:['A: Octet · B: Gyroid','Relative density ρ/ρ<sub>s</sub> = 0.40','Stress at zero'],set:{'l-r':0.4,'l-P':0},lat:['octet','gyroid'],
 watch:['Press ▶ and look at the shape of each curve after its peak.'],
 answer:`<p><b>The gyroid.</b> The octet snaps along a 45° band and its load drops, which is brittle. The gyroid sheet yields and then crushes layer by layer along a long flat plateau, so it soaks up energy at a steady stress. Compare the shapes of the curves, not the heights of the peaks: the octet numbers are ideal theory, while the gyroid values come from measured printed parts (Naghavi et al. 2022).</p>`},

{tab:'sheet',n:5,title:'How much does a wave help?',
 ask:'The same 2 mm steel sheet, flat or corrugated with waves 3 times the sheet thickness. Predict two numbers: how much stiffer is it, and how much stronger?',
 setup:['Tab 5, Corrugation','Wave amplitude <i>a</i>/<i>t</i> = 3','Load at zero','Chart: Test curve'],set:{'s-a':3,'s-P':0},
 watch:['Press ▶. Note the load at which each sheet folds.','Switch to the Design chart for the two gain curves.'],
 answer:`<p><b>49× stiffer but only about 7× stronger.</b> The wave moves steel up to ±<i>a</i> from the middle of the section. Stiffness depends on <i>I</i>, which grows as (2<i>a</i> + <i>t</i>)²/<i>t</i>² = 49 (Eq 12.8). Strength depends on <i>Z</i> = <i>I</i>/<i>c</i>, and the outermost fibre <i>c</i> moves out too, so the gain is only (2<i>a</i> + <i>t</i>)/<i>t</i> = 7 (Eq 12.9). In the test the flat sheet folds at 120 N and the corrugated one at 730 N (6.1×; a flat strip has a little more plastic reserve). The flat sheet bends 588 mm before it folds (the arrow, off the chart), the corrugated one only 73 mm.</p>`},
];
const TABNAME={column:'Columns',wall:'Thin walls',cells:'Cells',lattice:'Lattices',sheet:'Corrugation'};
$('exp-list').innerHTML=EXPS.map((e,i)=>`<article class="exp${e.then?' then':''}">
  <header>${e.then?'':`<span class="tk">${e.n} · ${TABNAME[e.tab]}</span>`}<h4>${e.title}</h4><button class="ib go" type="button" data-x="${i}">Load setup</button></header>
  <p class="ask">${e.ask}</p>
  <div class="cols"><div><h5>Set up</h5><ol>${e.setup.map(s=>`<li>${s}</li>`).join('')}</ol></div><div><h5>Run and watch</h5><ul>${e.watch.map(s=>`<li>${s}</li>`).join('')}</ul></div></div>
  <details><summary>Answer and why</summary>${e.answer}</details></article>`).join('');
function loadExp(e){openExp(false);if(cur!==e.tab)show(e.tab);stopPlay();growChart(false);
  if(e.cells){RIG.cells.mtype=e.cells;document.querySelectorAll('#m-type button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.t===e.cells));}
  if(e.lat){RIG.lattice.types=e.lat.slice();syncLatticeSeg();RIG.lattice.bet=null;RIG.lattice.betDone=false;document.querySelectorAll('#l-bet button[data-b]').forEach(x=>x.setAttribute('aria-pressed',false));}
  for(const id in e.set)$(id).value=e.set[id];
  chartKind='test';document.querySelectorAll('#ch-pick button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.c==='test'));
  clearHist(RIG[cur]);RIG[cur].build();refresh();resetView();MIC.snap();}
function openExp(on){$('experiments').hidden=!on;if(on){$('experiments').querySelector('.box').scrollTop=0;$('exp-h').focus({preventScroll:true});}}
$('exp-list').addEventListener('click',ev=>{const b=ev.target.closest('button[data-x]');if(b)loadExp(EXPS[+b.dataset.x]);});
$('b-exp').addEventListener('click',()=>openExp(true));$('b-exp-close').addEventListener('click',()=>openExp(false));
$('experiments').addEventListener('click',ev=>{if(ev.target.id==='experiments')openExp(false);});
document.addEventListener('keydown',ev=>{if(ev.metaKey||ev.ctrlKey||ev.altKey)return;const k=ev.key.toLowerCase();
  if(k==='escape'&&!$('experiments').hidden)openExp(false);else if(k==='e'&&!(ev.target.closest&&ev.target.closest('input[type=text],textarea')))openExp($('experiments').hidden);});
if(h0==='experiments')openExp(true);
