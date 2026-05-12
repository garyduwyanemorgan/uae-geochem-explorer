/**
 * geochemReactions.js
 * UAE Geochemistry Explorer — Deterministic Workflow Engine
 *
 * All balanced reactions, thermodynamic constants, and UAE-specific
 * narrative text for the four analysis scenarios.
 *
 * Structure
 * ---------
 * REACTIONS   — balanced equations grouped by scenario
 * NARRATIVES  — condition-dependent text builders (pure functions)
 * runAnalysis — main entry point called by UAEGeochemExplorer.jsx
 *
 * References
 * ----------
 * Parkhurst & Appelo (2013) PHREEQC v3, USGS TM 6-A43
 * Langmuir (1997) Aqueous Environmental Geochemistry, Prentice-Hall
 * Stumm & Morgan (1996) Aquatic Chemistry, 3rd ed., Wiley
 * Al-Yamani et al. (2004) UAE Groundwater Atlas, MOEW
 * Sherif et al. (2012) Hydrogeological investigations, UAE
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ELEMENT METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const geochemElements = {
  Ca:  { symbol: 'Ca²⁺',   name: 'Calcium',      charge: '+2', radius: 0.99, category: 'hard',         color: '#8B7355' },
  Mg:  { symbol: 'Mg²⁺',   name: 'Magnesium',    charge: '+2', radius: 0.65, category: 'hard',         color: '#8B7355' },
  Na:  { symbol: 'Na⁺',    name: 'Sodium',       charge: '+1', radius: 0.95, category: 'hard',         color: '#A0826D' },
  K:   { symbol: 'K⁺',     name: 'Potassium',    charge: '+1', radius: 1.33, category: 'hard',         color: '#A0826D' },
  Al:  { symbol: 'Al³⁺',   name: 'Aluminum',     charge: '+3', radius: 0.50, category: 'hard',         color: '#6B5B4D' },
  Fe3: { symbol: 'Fe³⁺',   name: 'Ferric Iron',  charge: '+3', radius: 0.64, category: 'intermediate', color: '#B87333' },
  Mn:  { symbol: 'Mn²⁺',   name: 'Manganese',    charge: '+2', radius: 0.80, category: 'intermediate', color: '#B87333' },
  Fe2: { symbol: 'Fe²⁺',   name: 'Ferrous Iron', charge: '+2', radius: 0.76, category: 'intermediate', color: '#CD7F32' },
  Cu:  { symbol: 'Cu²⁺',   name: 'Copper',       charge: '+2', radius: 0.69, category: 'intermediate', color: '#B8860B' },
  Zn:  { symbol: 'Zn²⁺',   name: 'Zinc',         charge: '+2', radius: 0.74, category: 'intermediate', color: '#B8860B' },
  Pb:  { symbol: 'Pb²⁺',   name: 'Lead',         charge: '+2', radius: 1.20, category: 'soft',         color: '#8B8B7A' },
  Cd:  { symbol: 'Cd²⁺',   name: 'Cadmium',      charge: '+2', radius: 0.97, category: 'soft',         color: '#8B8B7A' },
  SO4: { symbol: 'SO₄²⁻',  name: 'Sulfate',      charge: '-2', category: 'anion',        color: '#DAA520' },
  CO3: { symbol: 'CO₃²⁻',  name: 'Carbonate',    charge: '-2', category: 'anion',        color: '#F5DEB3' },
  Cl:  { symbol: 'Cl⁻',    name: 'Chloride',     charge: '-1', category: 'anion',        color: '#98D8C8' },
  NO3: { symbol: 'NO₃⁻',   name: 'Nitrate',      charge: '-1', category: 'anion',        color: '#87CEEB' },
  PO4: { symbol: 'PO₄³⁻',  name: 'Phosphate',    charge: '-3', category: 'anion',        color: '#DDA0DD' }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. BALANCED REACTIONS LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

export const REACTIONS = {

  // ── SCENARIO 1: Carbonate Equilibria ──────────────────────────────────────

  carbonate_eq: {
    title: 'Carbonate Equilibria',

    primary: [
      {
        id:       'calcite_dissolution',
        name:     'Calcite Dissolution',
        equation: 'CaCO₃(s) + CO₂(aq) + H₂O ⇌ Ca²⁺ + 2 HCO₃⁻',
        logK_25:  -8.48,   // Calcite solubility product
        dH:       -8.4,    // kJ/mol (dissolution slightly exothermic)
        notes:    'Dominant reaction in UAE Cretaceous–Eocene limestone aquifers. Driven by soil CO₂ generated from organic decomposition during wadi recharge events.',
        elements: ['Ca', 'CO3']
      },
      {
        id:       'dolomite_dissolution',
        name:     'Dolomite Dissolution',
        equation: 'CaMg(CO₃)₂(s) + 2 CO₂(aq) + 2 H₂O ⇌ Ca²⁺ + Mg²⁺ + 4 HCO₃⁻',
        logK_25:  -17.09,
        dH:       -9.4,
        notes:    'Prevalent in deeply buried Jurassic carbonates and in dolomitized facies of the Musandam Peninsula. Slower kinetics than calcite — requires longer residence times.',
        elements: ['Ca', 'Mg', 'CO3']
      },
      {
        id:       'dolomitization',
        name:     'Dolomitization (Mg metasomatism)',
        equation: '2 CaCO₃(s) + Mg²⁺ ⇌ CaMg(CO₃)₂(s) + Ca²⁺',
        logK_25:  2.06,
        dH:       -6.1,
        notes:    'Common in UAE sabkha diagenesis. Seawater-derived Mg²⁺ replaces Ca²⁺ in calcite lattice. Results in elevated Ca²⁺/Mg²⁺ ratios in co-occurring groundwater.',
        elements: ['Ca', 'Mg']
      },
      {
        id:       'co2_hydration',
        name:     'CO₂ Hydration / Carbonic Acid Formation',
        equation: 'CO₂(aq) + H₂O ⇌ H₂CO₃* ⇌ H⁺ + HCO₃⁻',
        logK_25:  -6.35,
        dH:       7.7,
        notes:    'Controls pH in recharge zones. In arid UAE conditions, low organic matter limits CO₂ partial pressure (log pCO₂ ≈ −2.5 to −3.5), restricting carbonate dissolution.',
        elements: ['CO3']
      },
      {
        id:       'bicarbonate_carbonate',
        name:     'Bicarbonate–Carbonate Speciation',
        equation: 'HCO₃⁻ ⇌ H⁺ + CO₃²⁻',
        logK_25:  -10.33,
        dH:       14.9,
        notes:    'Shifts toward CO₃²⁻ above pH ~9. In high-pH UAE khors and sabkha edges, this drives spontaneous calcite precipitation ("whitings").',
        elements: ['CO3']
      },
      {
        id:       'al_gibbsite',
        name:     'Gibbsite Dissolution',
        equation: 'Al(OH)₃(s) + 3 H⁺ ⇌ Al³⁺ + 3 H₂O',
        logK_25:  7.74,
        dH:       -22.3,
        notes:    'Al mobility in carbonate systems is negligible above pH 5. In UAE soils, gibbsite controls dissolved Al, which is typically below detection unless acidic conditions prevail.',
        elements: ['Al']
      }
    ],

    elementBehavior: {
      Ca: {
        summary: 'Primary indicator of carbonate dissolution extent.',
        detail:  'Calcium concentrations in UAE carbonate groundwater typically range 80–350 mg/L. Elevated Ca²⁺ (>300 mg/L) signals active calcite dissolution under high pCO₂ — characteristic of recent wadi recharge. In discharge zones (springs, falaj outlets), supersaturation causes travertine deposition.',
        saturationNote: 'Check Saturation Index (SI_Calcite). SI > +0.3 → scaling risk. SI < −0.3 → corrosive to infrastructure.'
      },
      Mg: {
        summary: 'Proxy for dolomite involvement and water–rock interaction time.',
        detail:  'Mg/Ca molar ratios > 1 indicate prolonged contact with dolomite or marine carbonate sequences. In the Buraimi/Al Ain area, elevated Mg²⁺ (50–180 mg/L) confirms Triassic dolomitic input. Inhibits calcite precipitation kinetics at Mg/Ca > 2, leading to metastable aragonite in coastal settings.',
        saturationNote: 'SI_Dolomite typically lags SI_Calcite. Kinetic controls dominate below 40°C.'
      },
      Na: {
        summary: 'Conservative tracer; elevated Na⁺ signals saline mixing or evaporite dissolution.',
        detail:  'In pure carbonate systems, Na⁺ is conservative and indicates mixing with marine or sabkha brines. UAE coastal aquifers commonly show Na/Cl ratios near seawater (0.86 molar), confirming marine intrusion rather than halite dissolution.',
        saturationNote: 'High Na⁺ (>300 mg/L) in inland carbonate aquifers implies upward leakage from deeper saline formation waters.'
      },
      K: {
        summary: 'Minor element; indicator of silicate weathering or potash fertilizer input.',
        detail:  'K⁺ concentrations in UAE carbonate groundwater are typically low (1–10 mg/L). Anomalously high K⁺ (>20 mg/L) may indicate agricultural return flow from potash fertilizers in Al Ain–Buraimi irrigation districts.',
        saturationNote: 'K⁺ can substitute for Na⁺ in ion exchange on clays but does not directly participate in carbonate equilibria.'
      },
      Al: {
        summary: 'Trace element; indicator of pH excursion or silicate weathering in carbonate terrain.',
        detail:  'Aluminum is essentially immobile in carbonate-buffered groundwater (pH 7–9). Detection of Al³⁺ (>0.1 mg/L) at circumneutral pH indicates colloidal transport rather than true dissolved Al. Relevant in UAE wadi alluvium with mixed carbonate–silicate lithology.',
        saturationNote: 'Al concentrations are diagnostic for acidification events — monitor in areas receiving industrial emissions or acid mine drainage from legacy Cu/Cr mines in Fujairah.'
      },
      CO3: {
        summary: 'Master ligand driving the entire carbonate system.',
        detail:  'Total alkalinity (expressed as HCO₃⁻) typically ranges 150–500 mg/L in UAE carbonate groundwaters. In deep confined aquifers, elevated alkalinity (>600 mg/L) with low Ca²⁺ indicates dissolution under closed-system conditions with limited CO₂ resupply.',
        saturationNote: 'Field alkalinity titration is mandatory — alkalinity degrades rapidly on sample storage due to CO₂ outgassing.'
      },
      Cl: {
        summary: 'Conservative tracer; chloride ratio methods diagnose recharge and mixing.',
        detail:  'Cl⁻ is not involved in carbonate reactions but is a critical conservative tracer in UAE studies. The Chloride Mass Balance (CMB) method estimates wadi recharge rates at 2–15 mm/yr. Cl⁻ > 250 mg/L in a carbonate aquifer flags seawater intrusion or sabkha leakage.',
        saturationNote: 'Always report Cl⁻ alongside carbonate parameters — it anchors the ionic balance and validates TDS measurements.'
      },
      SO4: {
        summary: 'May drive dedolomitization via gypsum dissolution in mixed carbonate-evaporite sequences.',
        detail:  'In UAE Cretaceous sequences, interbedded gypsum layers dissolve when undersaturated groundwater infiltrates, releasing Ca²⁺ + SO₄²⁻. Excess Ca²⁺ suppresses calcite dissolution (common-ion effect) while driving dolomite dissolution — dedolomitization. Results in Ca–SO₄ hydrochemical facies overlying a Ca–HCO₃ carbonate signature.',
        saturationNote: 'SI_Gypsum < −1 in a carbonate system confirms active gypsum dissolution contributing to dedolomitization.'
      }
    },

    conditionNotes: {
      lowpH: (pH) => `At pH ${pH}, the system is below the typical carbonate-buffered range. Carbonate dissolution is strongly favoured — expect elevated Ca²⁺ and HCO₃⁻ in downstream groundwater. This pH is unusual for UAE carbonate aquifers and may indicate CO₂ injection from deep sources or organic acid from degrading waste.`,
      midpH: (pH) => `At pH ${pH}, the system sits near the calcite saturation boundary (SI_Calcite ≈ 0). Dissolution and precipitation are near equilibrium — characteristic of mature UAE groundwaters in well-connected aquifer systems. Minor fluctuations in pCO₂ will tip the balance.`,
      highpH: (pH) => `At pH ${pH}, the system is supersaturated with respect to calcite (SI_Calcite > 0). Calcite is actively precipitating — a risk of well screen clogging, irrigation pipe scaling, and tufa deposits in open channels. The CO₃²⁻ species becomes significant above pH 9.`,
      lowTemp: (T) => `At ${T}°C, carbonate dissolution is slightly enhanced (lower solubility product at lower temperature is offset by slower reaction kinetics). This temperature is unrealistic for UAE surface groundwater but may occur in deep confined aquifers (>300 m depth) in the Al Ain area.`,
      midTemp: (T) => `At ${T}°C — typical for UAE shallow groundwater — calcite solubility is slightly reduced compared to 25°C reference conditions. PHREEQC calculations should use a temperature-corrected log K (−8.40 at 35°C vs −8.48 at 25°C). The temperature correction is small but significant for precise saturation index calculations.`,
      highTemp: (T) => `At ${T}°C, calcite solubility decreases significantly (retrograde solubility). Spontaneous calcite precipitation is likely near wellheads and surface water features. Biological activity (algae, biofilms) is also enhanced, further elevating pH and accelerating precipitation. Sampling must occur under in-situ conditions or with immediate field-preservation.`,
      lowTDS: (tds) => `TDS of ${tds} g/L indicates dilute recharge water. In UAE, this corresponds to recent wadi flood infiltration or mountain spring discharge from ophiolite or carbonate terrain. Ionic strength effects on activity coefficients are minimal — thermodynamic equilibrium calculations are straightforward.`,
      midTDS: (tds) => `TDS of ${tds} g/L is characteristic of moderate-salinity UAE groundwater, influenced by evapotranspiration concentration along the flow path from recharge zones. Activity coefficients must be corrected (Davies or Pitzer equations). Gypsum and halite are not yet at saturation.`,
      highTDS: (tds) => `TDS of ${tds} g/L indicates highly evolved, concentrated UAE groundwater — typical of sabkha-proximal or fossil deep aquifer water. Ionic strength corrections are critical; use the Pitzer ion-interaction model. At these concentrations, calcite solubility is enhanced by the ionic strength effect and by complexation with Na⁺ and Cl⁻.`
    }
  },

  // ── SCENARIO 2: Evaporite Dissolution ────────────────────────────────────

  gypsum_eq: {
    title: 'Evaporite Dissolution (Sabkha/Gypsum)',

    primary: [
      {
        id:       'gypsum_dissolution',
        name:     'Gypsum Dissolution',
        equation: 'CaSO₄·2H₂O(s) ⇌ Ca²⁺ + SO₄²⁻ + 2 H₂O',
        logK_25:  -4.58,
        dH:       -0.59,
        notes:    'Gypsum is ubiquitous in UAE sabkhas (coastal and inland). Dissolution is rapid relative to carbonates. Controls the upper bound of SO₄²⁻ at ~1400 mg/L in equilibrium with freshwater at 25°C.',
        elements: ['Ca', 'SO4']
      },
      {
        id:       'anhydrite_dissolution',
        name:     'Anhydrite Dissolution',
        equation: 'CaSO₄(s) ⇌ Ca²⁺ + SO₄²⁻',
        logK_25:  -4.36,
        dH:       -2.09,
        notes:    'Anhydrite occurs in deeper sabkha sequences and Triassic evaporite formations. Slightly less soluble than gypsum at low temperatures but more soluble at temperatures above ~42°C (crossover point). Common in Al Khaleej Formation.',
        elements: ['Ca', 'SO4']
      },
      {
        id:       'halite_dissolution',
        name:     'Halite Dissolution',
        equation: 'NaCl(s) ⇌ Na⁺ + Cl⁻',
        logK_25:  1.58,
        dH:       3.88,
        notes:    'Halite is highly soluble and dissolves rapidly. Found as crusts in UAE coastal sabkhas (Khor al-Beidah, Bu Hasa). Near-total dissolution under any infiltrating water. Controls Na⁺ and Cl⁻ in brine pools.',
        elements: ['Na', 'Cl']
      },
      {
        id:       'mirabilite_dissolution',
        name:     'Mirabilite (Na-sulfate) Dissolution',
        equation: 'Na₂SO₄·10H₂O(s) ⇌ 2 Na⁺ + SO₄²⁻ + 10 H₂O',
        logK_25:  -1.24,
        dH:       78.2,
        notes:    'Sodium sulfate salts (mirabilite, thenardite) occur in closed-basin playas in the UAE interior. Important for salt weathering of concrete foundations and masonry — significant in Abu Dhabi infrastructure projects.',
        elements: ['Na', 'SO4']
      },
      {
        id:       'epsomite_dissolution',
        name:     'Epsomite (Mg-sulfate) Dissolution',
        equation: 'MgSO₄·7H₂O(s) ⇌ Mg²⁺ + SO₄²⁻ + 7 H₂O',
        logK_25:  -1.88,
        dH:       16.1,
        notes:    'Magnesium sulfate in sabkha sequences adds to the total sulfate load. Dissolution contributes to the Mg-SO₄ hydrochemical facies observed in inland UAE groundwaters, especially in the Liwa area.',
        elements: ['Mg', 'SO4']
      },
      {
        id:       'celestite_dissolution',
        name:     'Celestite (Sr-sulfate) Dissolution',
        equation: 'SrSO₄(s) ⇌ Sr²⁺ + SO₄²⁻',
        logK_25:  -6.63,
        dH:       -1.0,
        notes:    'Strontium is a minor evaporite mineral with geochemical significance as a proxy tracer. Sr/Ca ratios distinguish carbonate-dominated (low Sr) from evaporite-dominated (high Sr) groundwaters in UAE mixed aquifer systems.',
        elements: ['SO4']
      },
      {
        id:       'calcium_sulfate_complex',
        name:     'Calcium–Sulfate Ion Pair',
        equation: 'Ca²⁺ + SO₄²⁻ ⇌ CaSO₄°(aq)',
        logK_25:  2.30,
        dH:       5.6,
        notes:    'Significant neutral CaSO₄ ion pair forms at high ionic strength. At TDS > 10 g/L, up to 30–40% of total dissolved Ca²⁺ and SO₄²⁻ may be in this complexed form — affects speciation calculations and apparent saturation indices.',
        elements: ['Ca', 'SO4']
      }
    ],

    elementBehavior: {
      Ca: {
        summary: 'Released proportionally with sulfate during gypsum/anhydrite dissolution.',
        detail:  'Calcium in UAE sabkha groundwaters reflects simultaneous inputs from carbonate dissolution, gypsum dissolution, and cation exchange. A Ca/SO₄ molar ratio near 1.0 confirms gypsum control. Ratios > 1.0 implicate additional carbonate dissolution or cation exchange releasing stored Ca²⁺. Ranges: 200–2000 mg/L in sabkha brines.',
        saturationNote: 'Gypsum SI should be < +0.1 in most natural groundwaters; supersaturation indicates evaporation concentration or loss of free water activity.'
      },
      SO4: {
        summary: 'Master variable in evaporite systems; indicator of gypsum/anhydrite dissolution and oxidative sulfide weathering.',
        detail:  'Sulfate in UAE groundwaters has two primary sources: (1) dissolution of evaporite minerals (gypsum/anhydrite), and (2) oxidation of pyrite in ophiolite-derived sediments in eastern UAE. Source discrimination uses δ³⁴S: evaporite SO₄²⁻ is enriched (δ³⁴S ~ +14 to +20‰ VCDT); pyrite-oxidation SO₄²⁻ is depleted (δ³⁴S ~ −5 to +5‰). UAE WHO limit for SO₄²⁻ in drinking water is 250 mg/L.',
        saturationNote: 'SI_Gypsum > 0 indicates supersaturation — risk of pipe/wellscreen scaling with calcium sulfate.'
      },
      Mg: {
        summary: 'Enhanced by epsomite dissolution in inland sabkhas; dolomitization competes.',
        detail:  'Elevated Mg²⁺ in evaporite-dominated groundwaters (>150 mg/L) indicates epsomite or dolomite dissolution. In coastal UAE sabkhas, Mg²⁺ is also concentrated through seawater evaporation. The Mg/SO₄ ratio can identify whether Mg is evaporite-derived or reflects silicate weathering input from ophiolite terrain to the east.',
        saturationNote: 'Epsomite (MgSO₄·7H₂O) will precipitate when Mg·SO₄ ion activity product exceeds log K = −1.88.'
      },
      Na: {
        summary: 'Conservative halite dissolution product; dilution indicator in sabkha brines.',
        detail:  'Sodium in sabkha groundwaters reaches concentrations of 10,000–70,000 mg/L in mature brines. The Na/Cl molar ratio is diagnostic: ~0.86 for seawater origin, ~1.0 for halite dissolution alone, <0.86 for ion exchange consuming Na⁺. Deviations flag mixing sources.',
        saturationNote: 'Halite (NaCl) saturation (SI = 0) in UAE brines is reached at TDS ~270 g/L — well above the typical groundwater range except in hypersaline sabkha pans.'
      },
      Cl: {
        summary: 'Conservative tracer co-released with Na⁺ from halite; key for mass-balance calculations.',
        detail:  'Chloride is the most conservative major anion in sabkha environments — no mineral equilibrium controls its upper limit except halite. Chloride concentrations in UAE coastal sabkha porewater range 5,000–180,000 mg/L. The Br/Cl ratio (weight ratio: seawater = 0.0034) distinguishes seawater-evaporated brines from halite-dissolution waters (Br/Cl near 0 for halite dissolution).',
        saturationNote: 'High Cl⁻ increases ionic strength markedly, requiring Pitzer corrections for accurate speciation of CaSO₄, MgSO₄, and NaCl activity products.'
      },
      NO3: {
        summary: 'Not a primary evaporite mineral component, but present in agricultural sabkha soils.',
        detail:  'Nitrate in UAE evaporite environments derives from mineralization of organic-N in salt-marsh soils and from agricultural fertilizer application in Al Ain and Buraimi oasis systems. Nitrate may be reduced to N₂ under the sulfate-reducing conditions of sabkha diagenesis (DNRA pathway), mediated by Desulfovibrio-type organisms.',
        saturationNote: 'Check whether elevated NO₃⁻ correlates with agricultural land-use — if yes, conduct δ¹⁵N–NO₃ analysis to confirm anthropogenic origin.'
      }
    },

    conditionNotes: {
      lowTDS: (tds) => `At ${tds} g/L TDS, infiltrating water is strongly undersaturated with respect to gypsum (SI_Gypsum ≈ −1.5 to −2.0). Rapid gypsum dissolution will occur at the infiltration front, potentially causing catastrophic subsurface dissolution and hydro-collapse — a critical geotechnical hazard in UAE construction zones underlain by evaporite sequences. Design Foundation Investigation (DFI) must include targeted gypsum dissolution risk assessment.`,
      midTDS: (tds) => `At ${tds} g/L TDS, the system approaches partial gypsum saturation. Dissolution and re-precipitation may oscillate seasonally in the UAE vadose zone as wetting–drying cycles concentrate porewater. Sulfate concentrations will stabilise near ~1000–1500 mg/L if gypsum is the primary mineral phase.`,
      highTDS: (tds) => `At ${tds} g/L TDS, the system is a concentrated brine (sabkha type). Gypsum may be close to saturation or actively precipitating at the capillary fringe. Anhydrite becomes the stable phase above ~42°C in highly concentrated solutions. Evaporation is the dominant process concentrating the brine — mineral precipitation sequence follows Usiglio's evaporation pathway: CaCO₃ → CaSO₄ → NaCl → MgSO₄ → MgCl₂.`,
      highTemp: (T) => `At ${T}°C, anhydrite becomes thermodynamically more stable than gypsum (crossover near 42°C in pure water, lower in saline solutions). In UAE summer conditions, near-surface sabkha sediments may undergo anhydrite → gypsum conversion during cool winter rain infiltration and the reverse during summer heating — contributing to fabric disruption and repeated heaving of overlying structures.`,
      midTemp: (T) => `At ${T}°C, gypsum is the stable CaSO₄ phase in near-surface UAE environments. Standard gypsum solubility calculations apply (log K₃₅ ≈ −4.62). This temperature is representative of UAE shallow groundwater year-round.`,
      lowTemp: (T) => `At ${T}°C, gypsum solubility is slightly higher than at 35°C. This temperature would only be encountered in deep UAE aquifer systems (>300 m). Below 18°C, mirabilite (Na₂SO₄·10H₂O) becomes more stable than thenardite — relevant for sub-surface winter conditions in the northern UAE highlands.`
    }
  },

  // ── SCENARIO 3: Redox Reactions ───────────────────────────────────────────

  redox: {
    title: 'Redox Reactions (Fe/Mn/Leachate)',

    primary: [
      {
        id:       'fe2_oxidation',
        name:     'Ferrous Iron Oxidation (Abiotic)',
        equation: '4 Fe²⁺ + O₂(aq) + 8 H⁺ + 4 H₂O ⇌ 4 Fe(OH)₃(s) + 8 H⁺',
        simplified: '4 Fe²⁺ + O₂ + 10 H₂O → 4 Fe(OH)₃ + 8 H⁺',
        logK_25:  -14.9,  // per mole Fe²⁺, pH-dependent
        Eh_note:  'Controlled by pε–pH diagrams; oxidation favoured above pε ≈ 7 at pH 7',
        notes:    'Rate-limiting step in oxygenated zones. Abiotic rate is slow at pH < 5 but increases 100× per pH unit above pH 6. At pH 7–8 (typical UAE groundwater), Fe²⁺ oxidizes in minutes upon air contact — critical for field sampling.',
        elements: ['Fe2', 'Fe3']
      },
      {
        id:       'fe3_reduction',
        name:     'Ferric Iron Reduction (Anaerobic)',
        equation: 'Fe(OH)₃(s) + 3 H⁺ + e⁻ → Fe²⁺ + 3 H₂O',
        logK_25:  16.2,
        Eh_note:  'Occurs at pε < 4; common in landfill leachate and organic-rich aquifer zones',
        notes:    'Microbially-mediated (Geobacter, Shewanella spp.) in landfill leachate plumes such as Al Fagaa (Sharjah). Releases Fe²⁺ and associated sorbed trace metals (As, Cr, Pb) — a critical mobilization pathway for landfill contaminant transport.',
        elements: ['Fe2', 'Fe3']
      },
      {
        id:       'mn_oxidation',
        name:     'Manganese Oxidation',
        equation: 'Mn²⁺ + 0.5 O₂ + H₂O → MnO₂(s) + 2 H⁺',
        logK_25:  -20.7,
        Eh_note:  'Oxidation requires pε > 10 at neutral pH; often biologically catalysed',
        notes:    'Mn²⁺ oxidation is kinetically slower than Fe²⁺ oxidation and often biologically catalysed. MnO₂ is a powerful sorbent for Co²⁺, Ni²⁺, and Pb²⁺. In UAE water supply boreholes, Mn²⁺ >0.1 mg/L causes blackish precipitates on distribution system infrastructure.',
        elements: ['Mn', 'Fe3']
      },
      {
        id:       'mn_reduction',
        name:     'Manganese Reduction',
        equation: 'MnO₂(s) + 4 H⁺ + 2 e⁻ → Mn²⁺ + 2 H₂O',
        logK_25:  21.8,
        Eh_note:  'Occurs before Fe³⁺ reduction in the redox sequence (pε 8–10 at pH 7)',
        notes:    'Mn²⁺ is released ahead of Fe²⁺ as reducing conditions develop — useful for identifying incipient reducing conditions in UAE landfill monitoring wells before full iron reduction commences.',
        elements: ['Mn']
      },
      {
        id:       'sulfate_reduction',
        name:     'Sulfate Reduction (Microbial)',
        equation: 'SO₄²⁻ + 2 CH₂O → H₂S(g) + 2 HCO₃⁻',
        logK_25:  -5.1,
        Eh_note:  'Occurs at pε < −2 to −3 in the deepest anoxic zones',
        notes:    'Sulfate-reducing bacteria (SRB) are active in UAE landfill leachate plumes and mangrove sediments. H₂S generation creates significant gas hazard (TLV-C = 1 ppm) in enclosed structures and depresses groundwater pH. Biogenic pyrite precipitates, immobilizing Fe²⁺ and trace metals.',
        elements: ['SO4', 'Fe2']
      },
      {
        id:       'nitrate_reduction',
        name:     'Denitrification',
        equation: '2 NO₃⁻ + 10 e⁻ + 12 H⁺ → N₂(g) + 6 H₂O',
        logK_25:  21.0,
        Eh_note:  'Occurs at pε 5–8 in the redox sequence, before Fe³⁺ reduction',
        notes:    'Denitrification occurs in the suboxic transition zone of UAE landfill leachate plumes. Elevated HCO₃⁻ is a by-product. Isotopic fractionation (¹⁵N enrichment in residual NO₃⁻) is a diagnostic tool used in Al Ain agricultural contamination studies.',
        elements: ['NO3', 'Fe2']
      },
      {
        id:       'pyrite_oxidation',
        name:     'Pyrite Oxidation',
        equation: 'FeS₂(s) + 15/4 O₂ + 7/2 H₂O → Fe(OH)₃(s) + 2 SO₄²⁻ + 4 H⁺',
        logK_25:  -217,   // approximate
        notes:    'Critical reaction in UAE eastern ophiolite terrain (Wadi Fizh, Wadi Ham). Produces acid mine drainage with pH < 3 and elevated Fe²⁺, SO₄²⁻, Ni²⁺, Cr³⁺, and Co²⁺. Affects groundwater downstream of ophiolite-hosted legacy mine sites.',
        elements: ['Fe2', 'Fe3', 'SO4']
      },
      {
        id:       'arsenate_arsenite',
        name:     'Arsenic Redox Speciation',
        equation: 'H₂AsO₄⁻ + 2 H⁺ + 2 e⁻ ⇌ H₃AsO₃(aq) + H₂O',
        logK_25:  9.2,
        Eh_note:  'Transition around pε 4–6 at pH 7–8; arsenite more mobile and more toxic',
        notes:    'Arsenic mobility is tightly coupled to Fe oxyhydroxide redox cycling. As Fe(OH)₃ dissolves under reducing conditions, sorbed arsenate is released and reduced to arsenite. UAE WHO drinking water standard for As is 10 μg/L — a concern near legacy mining and industrial sites.',
        elements: ['Fe2', 'Fe3']
      }
    ],

    redoxSequence: [
      { zone: 'Aerobic',             pE_range: [7, 15],  Eh_mV: [+415, +900], dominant: 'O₂ reduction',      indicator: 'Dissolved O₂ > 1 mg/L' },
      { zone: 'Nitrate-reducing',    pE_range: [5, 7],   Eh_mV: [+295, +415], dominant: 'NO₃⁻ → N₂',        indicator: 'NO₃⁻ declining, N₂/N₂O detected' },
      { zone: 'Mn-reducing',         pE_range: [3, 5],   Eh_mV: [+177, +295], dominant: 'MnO₂ → Mn²⁺',     indicator: 'Mn²⁺ > 0.05 mg/L, O₂ = 0' },
      { zone: 'Fe-reducing',         pE_range: [0, 3],   Eh_mV: [0,   +177],  dominant: 'Fe(OH)₃ → Fe²⁺',  indicator: 'Fe²⁺ > 0.2 mg/L, black precipitates' },
      { zone: 'Sulfate-reducing',    pE_range: [-4, 0],  Eh_mV: [-237, 0],    dominant: 'SO₄²⁻ → H₂S',     indicator: 'H₂S odour, SO₄²⁻ depletion' },
      { zone: 'Methanogenic',        pE_range: [-8, -4], Eh_mV: [-474, -237], dominant: 'CO₂ → CH₄',        indicator: 'CH₄ gas, DIC elevated as HCO₃⁻' }
    ],

    elementBehavior: {
      Fe2: {
        summary: 'Mobile in reducing conditions; rapidly oxidizes on exposure to air.',
        detail:  'Ferrous iron (Fe²⁺) in UAE landfill leachate plumes (Al Fagaa, Al Dhaid) typically ranges 1–50 mg/L in monitoring wells within the anaerobic plume core. At the aerobic plume fringe, Fe²⁺ oxidizes within hours, precipitating amorphous Fe(OH)₃ that stains well casings and borehole casings orange–red. Field measurement using a flow-through cell (Mn-ZnO redox electrode) is essential — Fe²⁺ is completely oxidized in < 2 minutes of air exposure at pH 7.5.',
        saturationNote: 'Log SI_Siderite (FeCO₃) and SI_Vivianite (Fe₃(PO₄)₂) — both can precipitate in reducing zones, sequestering Fe²⁺ and PO₄³⁻.'
      },
      Fe3: {
        summary: 'Stable as iron oxyhydroxide precipitates in oxic zones; a powerful sorbent.',
        detail:  'Ferrihydrite (amorphous Fe(OH)₃), goethite (α-FeOOH), and lepidocrocite (γ-FeOOH) accumulate in the aeration zone of UAE boreholes and at the oxic–anoxic interface of landfill plumes. Their high surface area (200–800 m²/g) adsorbs As, Cr, Pb, Cd, and Zn. Reductive dissolution during plume expansion releases these metals — a key risk in Al Fagaa landfill expansion scenarios.',
        saturationNote: 'Use ferrihydrite SI (log K = 3.19) as the reactive phase. Goethite is the stable long-term form (log K = 0.50) but forms slowly.'
      },
      Mn: {
        summary: 'Reduced ahead of iron in the redox sequence; indicator of incipient anoxia.',
        detail:  'Manganese (Mn²⁺) is the first dissolved metal to appear as reducing conditions develop, providing an early-warning indicator for redox deterioration in UAE production wells adjacent to contaminated sites. UAE SEWA/DEWA water quality standards require Mn < 0.1 mg/L. Mn is particularly problematic in coastal desalination plant intake zones — even trace Mn²⁺ oxidises to MnO₂ in distribution chlorination and coats pipes black.',
        saturationNote: 'MnCO₃ (rhodochrosite) can precipitate in carbonate-rich anoxic zones — log K = −11.13.'
      },
      SO4: {
        summary: 'Terminal electron acceptor in deeply anoxic zones; precursor to H₂S generation.',
        detail:  'Sulfate reduction in UAE landfill and sabkha sediments produces H₂S, which lowers redox potential further, precipitates metal sulfides (FeS, ZnS, PbS), and can severely impair groundwater quality. The odour threshold for H₂S is 0.5 ppb — far below the 10 ppm OSHA permissible exposure limit. Dissolved sulfide in groundwater monitoring wells is a critical health and safety issue during UAE site investigation.',
        saturationNote: 'Track SO₄²⁻ concentration through the redox sequence — depletion from upgradient to downgradient confirms active sulfate reduction.'
      },
      NO3: {
        summary: 'First electron acceptor consumed after O₂; indicator of organic carbon oxidation.',
        detail:  'Nitrate in UAE groundwaters originates from agricultural fertilizers (Al Ain, Buraimi, Dibba oases), septic systems, and atmospheric deposition. In landfill leachate plumes, indigenous NO₃⁻ is rapidly consumed in the suboxic front. Residual NO₃⁻ > 50 mg/L is a WHO health guideline trigger. ¹⁵N–NO₃ isotope analysis distinguishes fertilizer NO₃⁻ (δ¹⁵N = +2 to +5‰) from sewage (δ¹⁵N = +10 to +20‰).',
        saturationNote: 'No mineral equilibrium controls NO₃⁻ — it is conservative in oxic conditions and consumed microbially under suboxic/anoxic conditions.'
      },
      Cu: {
        summary: 'Strongly sorbed on Fe/Mn oxides under oxic conditions; mobilized by reductive dissolution.',
        detail:  'Copper is a trace contaminant in UAE landfill and industrial runoff. Under oxidizing conditions, Cu²⁺ is efficiently retarded by Fe(OH)₃ and clay sorption. Reduction of Fe oxyhydroxides releases sorbed Cu²⁺ to solution, creating a secondary contamination pulse. UAE WHO drinking water guideline for Cu is 2 mg/L; corrosion of Cu plumbing is the primary source in distribution systems.',
        saturationNote: 'Log SI_Malachite (Cu₂(OH)₂CO₃) — may precipitate in alkaline conditions and limit dissolved Cu²⁺.'
      },
      Zn: {
        summary: 'Mobilized by low pH or reducing conditions; forms insoluble ZnS under sulfate-reducing conditions.',
        detail:  'Zinc is a common contaminant from UAE construction runoff, galvanised pipes, and tyre-leachate landfill waste. It is mobile at pH < 7 but precipitates as Zn(OH)₂ or ZnCO₃ at higher pH. Under sulfate-reducing conditions, ZnS (sphalerite) precipitates with very low solubility (log K = −17.5), effectively immobilising Zn. UAE groundwater standard: 3 mg/L (aesthetic) / 5 mg/L (health-based).',
        saturationNote: 'SI_Smithsonite (ZnCO₃) > 0 is common in carbonate aquifers — the dominant control on dissolved Zn in UAE limestone terrain.'
      },
      Pb: {
        summary: 'Most strongly retarded heavy metal in the vadose zone; mobilized by acidification or organic complexation.',
        detail:  'Lead is nearly immobile in UAE carbonate-rich groundwaters due to precipitation as PbCO₃ (cerussite, log K = −13.13) and strong sorption to Fe/Mn oxyhydroxides. The primary risk of Pb mobilization is pH depression below 6 (unlikely in carbonate terrains) or formation of organic complexes in landfill leachate. UAE WHO drinking water standard for Pb is 0.01 mg/L (post-2017 revision).',
        saturationNote: 'SI_Cerussite (PbCO₃) and SI_Anglesite (PbSO₄) — both near zero in UAE carbonate/sulfate groundwaters, indicating precipitation control on dissolved Pb.'
      },
      Cd: {
        summary: 'Highly toxic at trace concentrations; co-precipitates with calcite and adsorbs strongly.',
        detail:  'Cadmium is found at trace levels (< 5 μg/L) in UAE industrial runoff and phosphate fertilizer inputs. Co-precipitation with calcite (Cd substituting for Ca in the crystal lattice) is a critical immobilization mechanism in UAE carbonate aquifers. Under reducing conditions, CdS precipitates (log K = −27.0) provide further sequestration in sulfate-reducing zones.',
        saturationNote: 'UAE WHO standard for Cd is 0.003 mg/L. Cd²⁺ speciation should include CdCl⁺ and CdSO₄° complexes, which are significant in high-salinity UAE groundwaters and may increase apparent mobility.'
      }
    },

    conditionNotes: {
      deepReducing: (pe) => `At pε = ${pe}, the system is in the methanogenic or deep sulfate-reducing zone. This is the most reducing environment found in UAE landfill cores and ancient fossil groundwaters. All mobile redox-sensitive elements (Fe, Mn, As, Cr, Ni) are in their reduced, soluble forms. H₂S generation is active. Gas monitoring (CH₄, H₂S, CO₂) is mandatory during borehole installation and groundwater sampling.`,
      ironReducing: (pe) => `At pε = ${pe}, conditions fall within the Fe-reducing zone. Fe²⁺ and Mn²⁺ are fully mobilized. This is characteristic of the leachate plume core at UAE landfill sites such as Al Fagaa and Al Dhaid. Heavy metals previously sorbed to Fe oxyhydroxides are being released. ORP field measurements should be <+100 mV; dissolved O₂ = 0 mg/L.`,
      suboxic: (pe) => `At pε = ${pe}, conditions are suboxic to mildly reducing — the nitrate-reducing and Mn-reducing zones. Dissolved O₂ < 0.5 mg/L; Mn²⁺ may be present; Fe²⁺ is absent or < 0.5 mg/L. This is typical of the distal landfill plume fringe and of deeper confined UAE aquifer sections receiving organic carbon inputs.`,
      oxic: (pe) => `At pε = ${pe}, conditions are clearly oxidizing. O₂ is present; Fe²⁺ and Mn²⁺ are absent or rapidly oxidized. Heavy metals are immobilized by Fe/Mn oxyhydroxide sorption. This condition is typical of UAE recharge-zone groundwaters and well-aerated wadi gravels. However, sampling must still be done carefully to prevent in-situ oxidation of any trace reduced species before analysis.`,
      lowpH: (pH) => `At pH ${pH}, the system is mildly acidic — unusual for UAE carbonate-buffered groundwaters but possible in ophiolite-terrain AMD zones or in CO₂-rich deep formations. Iron and manganese solubility is greatly increased; carbonate-phase sequestration of heavy metals is reduced. All sorption capacities of Fe oxyhydroxides diminish significantly.`,
      midpH: (pH) => `At pH ${pH}, the system is within the optimal buffered range for UAE groundwaters. Iron and manganese cycling are sensitive to small Eh changes. Carbonate-phase coprecipitation effectively retards Pb, Cd, and Zn. This is the most common pH range in UAE monitoring wells proximal to carbonate terrain.`,
      highpH: (pH) => `At pH ${pH}, elevated alkalinity assists in precipitating many heavy metals as carbonates or hydroxides. However, amphoteric species such as Al(OH)₄⁻ and HAsO₄²⁻ can become more soluble. Mn²⁺ is rapidly oxidized abiotically at this pH. Biologically-active systems may show algal CO₂ uptake driving pH even higher (pH 9+) — monitor in open UAE irrigation canals and falaj channels.`,
      highTemp: (T) => `At ${T}°C, microbial redox reaction rates are significantly accelerated. Sulfate reduction rates increase approximately 2× per 10°C rise — microbiological activity is highly active in summer UAE vadose zones and shallow aquifers. Dissolved oxygen solubility decreases to approximately 6.5 mg/L at 35°C vs 9 mg/L at 20°C, predisposing summer groundwaters to redox deterioration at lower organic matter inputs than in temperate climates.`
    }
  },

  // ── SCENARIO 4: Surface Complexation / Sorption ───────────────────────────

  sorption: {
    title: 'Surface Complexation & Heavy Metal Sorption',

    primary: [
      {
        id:       'feoh_pb_sorption',
        name:     'Pb²⁺ Sorption on Ferrihydrite',
        equation: '≡FeOH + Pb²⁺ ⇌ ≡FeOPb⁺ + H⁺',
        logK_int: 4.65,
        notes:    'Strong inner-sphere complex. Lead is one of the most strongly sorbed divalent metals on Fe oxyhydroxides. At pH > 6, Pb²⁺ is essentially completely removed from solution by Fe(OH)₃ at natural loading levels (< 1 mg/L). Desorption occurs below pH 5.',
        elements: ['Pb', 'Fe3']
      },
      {
        id:       'feoh_cd_sorption',
        name:     'Cd²⁺ Sorption on Ferrihydrite',
        equation: '≡FeOH + Cd²⁺ ⇌ ≡FeOCd⁺ + H⁺',
        logK_int: 0.47,
        notes:    'Weaker sorption than Pb²⁺ or Cu²⁺. Cd²⁺ is more mobile in natural systems and less completely removed. High Cl⁻ concentrations (UAE coastal groundwater) form CdCl⁺ ion pairs, reducing the free Cd²⁺ fraction available for sorption and increasing effective mobility.',
        elements: ['Cd', 'Fe3']
      },
      {
        id:       'feoh_cu_sorption',
        name:     'Cu²⁺ Sorption on Ferrihydrite',
        equation: '≡FeOH + Cu²⁺ ⇌ ≡FeOCu⁺ + H⁺',
        logK_int: 2.89,
        notes:    'Strong inner-sphere complex, particularly significant at pH > 6.5. In UAE copper-processing waste and construction demolition leachate, ferrihydrite coatings on gravel particles provide key attenuation. Organic matter complexation competes with Fe surface sites for Cu²⁺.',
        elements: ['Cu', 'Fe3']
      },
      {
        id:       'feoh_zn_sorption',
        name:     'Zn²⁺ Sorption on Ferrihydrite',
        equation: '≡FeOH + Zn²⁺ ⇌ ≡FeOZn⁺ + H⁺',
        logK_int: 1.99,
        notes:    'Intermediate sorption strength. ZnSO₄° ion pairs in high-sulfate UAE evaporite groundwaters reduce sorption efficiency. In UAE ophiolite-derived soils with elevated natural Zn backgrounds (50–200 mg/kg), Fe oxide sorption is critical for limiting dissolved Zn mobility.',
        elements: ['Zn', 'Fe3']
      },
      {
        id:       'clay_pb_cation_exchange',
        name:     'Pb²⁺ Cation Exchange on Montmorillonite',
        equation: 'Pb²⁺ + 2 NaX ⇌ PbX₂ + 2 Na⁺',
        logK_25:  2.4,
        notes:    'Cation exchange (outer-sphere) in contrast to inner-sphere complexation on Fe oxides. Selectivity series on smectite clays: Pb²⁺ > Cu²⁺ > Zn²⁺ > Cd²⁺ > Ca²⁺ > Mg²⁺ > Na⁺. Displacement of Pb²⁺ by Ca²⁺ is possible when Ca²⁺ concentrations are very high — relevant in UAE calcareous soils.',
        elements: ['Pb', 'Ca']
      },
      {
        id:       'calcite_surface_sorption',
        name:     'Cd²⁺ Co-precipitation / Sorption on Calcite',
        equation: 'CaCO₃(s) + Cd²⁺ ⇌ CdCO₃(s) + Ca²⁺',
        logK_25:  3.5,
        notes:    'In UAE carbonate terrains, calcite surfaces act as a major sorbent for Cd²⁺. Cadmium substitutes for Ca²⁺ in the calcite lattice. This co-precipitation mechanism is irreversible on geological timescales but can be partially reversed under acidic conditions. Critical for UAE agricultural soil remediation.',
        elements: ['Cd', 'Ca', 'CO3']
      },
      {
        id:       'phosphate_sorption_fe',
        name:     'Phosphate Sorption on Ferrihydrite',
        equation: '≡FeOH + H₂PO₄⁻ ⇌ ≡FePO₄H₂ + OH⁻',
        logK_int: 7.8,
        notes:    'Phosphate forms very strong inner-sphere complexes on Fe oxyhydroxides, competing with arsenate for the same surface sites. In UAE sabkha soils enriched with phosphate from bird guano or agricultural inputs, phosphate competition can mobilize arsenic — a risk pathway in coastal UAE wetland remediation.',
        elements: ['PO4', 'Fe3']
      },
      {
        id:       'al_clay_sorption',
        name:     'Al³⁺ Surface Complexation and Gibbsite Precipitation',
        equation: '≡SiOH + Al³⁺ → ≡SiOAl²⁺ + H⁺  (then gibbsite nucleation)',
        logK_int: 3.2,
        notes:    'Aluminum mobility in UAE silicate-bearing sediments is controlled by pH-dependent sorption on silica and clay surfaces, followed by secondary gibbsite precipitation at pH > 6. Al³⁺ hydrolysis products (AlOH²⁺, Al(OH)₂⁺) are toxic to aquatic organisms at μg/L levels.',
        elements: ['Al', 'SO4']
      }
    ],

    sorbentProperties: {
      ferrihydrite: {
        name:      'Ferrihydrite (amorphous Fe(OH)₃)',
        surfArea:  '200–800 m²/g',
        pointOfZeroCharge: 'pH_PZC ≈ 8.1',
        notes:     'Dominant reactive Fe phase in UAE oxidized zone and at landfill leachate fringe. Strong sorbent for As, Cr, Pb, Cu, Zn. Surface becomes net positive below pH 8.1, net negative above — explains why heavy metal sorption maximises above pH 7.'
      },
      goethite: {
        name:      'Goethite (α-FeOOH)',
        surfArea:  '30–100 m²/g',
        pointOfZeroCharge: 'pH_PZC ≈ 7.5',
        notes:     'Crystalline, lower surface area than ferrihydrite. More stable long-term sorbent — Fe(OH)₃ converts to goethite over months to years. Dominant Fe phase in UAE red-brown desert soils. Lower sorption capacity per gram than ferrihydrite but greater persistence.'
      },
      montmorillonite: {
        name:      'Montmorillonite (smectite clay)',
        CEC:       '80–120 meq/100g',
        notes:     'High-swelling 2:1 clay. Limited in UAE desert sands but present in wadi alluvium fines (< 2 μm fraction). Provides cation exchange capacity for Pb²⁺, Cu²⁺, Zn²⁺ but is pH-independent for the permanent charge sites — unlike Fe oxides.'
      },
      calcite: {
        name:      'Calcite (CaCO₃)',
        surfArea:  '1–10 m²/g',
        pointOfZeroCharge: 'pH_PZC ≈ 8–9',
        notes:     'Ubiquitous in UAE vadose zone. Though lower surface area, its abundance means it contributes significantly to total Cd and Pb removal. Calcite dissolution/recrystallisation cycles renew sorption sites. Also buffers pH, maintaining conditions favourable for Fe oxide sorption.'
      }
    },

    elementBehavior: {
      Pb: {
        summary: 'Strongest sorption of the common heavy metals; essentially immobile at near-neutral pH.',
        detail:  'Lead is retarded by factors of 100–10,000 relative to groundwater velocity in UAE carbonate terrains (high Rf). Field sampling at a Pb contamination site in Abu Dhabi consistently shows dissolved Pb < detection limit while soil Pb in the vadose zone reads 500–2000 mg/kg — confirming effective Fe oxide and calcite sorption.',
        mobilityIndex: 'Very Low (UAE carbonate context)',
        criticalThreshold: 'pH < 5.5 for significant mobilization from Fe oxyhydroxides'
      },
      Cd: {
        summary: 'Moderately sorbed; elevated Cl⁻ and low pH increase mobility significantly.',
        detail:  'Cadmium is more mobile than Pb in UAE coastal groundwaters due to CdCl⁺ complexation reducing the free Cd²⁺ available for sorption. Retardation factors typically 10–200. In high-sulfate environments, CdSO₄° also reduces sorption. UAE WHO standard: 0.003 mg/L — achieved at even moderate Fe oxide content if pH > 7.',
        mobilityIndex: 'Low to Moderate',
        criticalThreshold: 'pH < 6.5 or Cl⁻ > 1000 mg/L for notable mobilization'
      },
      Cu: {
        summary: 'Strong sorption on Fe oxides; organic matter complexation competes and increases mobility.',
        detail:  'Copper forms very stable inner-sphere complexes with Fe oxyhydroxides and also bonds strongly to soil organic matter (SOM). In UAE soils with low SOM (< 0.5%), Fe oxides dominate — Cu is immobile at pH > 6.5. In landfill leachate with high dissolved organic carbon (DOC > 50 mg/L), Cu–fulvate complexes dramatically increase dissolved Cu mobility.',
        mobilityIndex: 'Low (inorganic systems) to Moderate (high DOC landfill context)',
        criticalThreshold: 'DOC > 20 mg/L or pH < 6 increases effective mobility'
      },
      Zn: {
        summary: 'Intermediate mobility; ZnCO₃ precipitation limits dissolved Zn in carbonate aquifers.',
        detail:  'Zinc is more mobile than Pb or Cu under typical UAE conditions. However, the abundance of carbonate minerals means smithsonite (ZnCO₃) precipitation also operates as a secondary retardation mechanism. In alkaline UAE sabkha soils (pH 8–9), Zn is effectively immobilised. In oxidizing-to-reducing transition zones, ZnS precipitation in the reducing zone provides a secondary trap.',
        mobilityIndex: 'Moderate',
        criticalThreshold: 'pH < 6.5 or reductive dissolution of Fe oxyhydroxides'
      },
      Ca: {
        summary: 'Competes with heavy metal cations for sorption sites; high Ca²⁺ reduces heavy metal retardation.',
        detail:  'The high Ca²⁺ concentrations in UAE carbonate groundwaters (100–500 mg/L) compete with trace metal cations for sorption sites on Fe oxides and clay exchange sites. This "competitive inhibition" of heavy metal sorption is quantifiable using multi-component SCM models. In practice, high Ca²⁺ slightly reduces Cd²⁺ and Zn²⁺ retardation factors by 20–40%.',
        mobilityIndex: 'N/A (major ion)',
        criticalThreshold: 'Ca²⁺ > 300 mg/L → begin correcting heavy metal Kd values downward'
      },
      Al: {
        summary: 'pH-dependent mobility; sorbed on silica surfaces and precipitates as gibbsite above pH 6.',
        detail:  'Aluminum speciation in UAE groundwaters is highly pH-dependent: Al³⁺ dominates below pH 5, AlOH²⁺ near pH 5–6, Al(OH)₂⁺ near pH 6–7, and Al(OH)₄⁻ above pH 8. At UAE groundwater pH 7–9, Al is effectively immobilized. Detection of dissolved Al in UAE wells indicates either pH excursion, colloidal transport, or silicate weathering in the eastern ophiolite terrain.',
        mobilityIndex: 'Very Low (neutral to alkaline UAE groundwaters)',
        criticalThreshold: 'pH < 5 (acidification) or pH > 9.5 (strong alkalinity dissolving Al(OH)₄⁻)'
      },
      Fe3: {
        summary: 'The primary sorbent phase — its dissolution or formation controls the sorption capacity of the system.',
        detail:  'Ferrihydrite content in UAE vadose zone soils typically ranges 0.01–2% by weight. Even 0.1% ferrihydrite (surface area 500 m²/g) provides ~500 m²/kg of sorption area — enormous capacity relative to typical trace metal loadings from contamination events. Quantification of reactive Fe (dithionite-bicarbonate extraction) is essential for any UAE environmental site assessment.',
        mobilityIndex: 'N/A (sorbent phase)',
        criticalThreshold: 'Reductive dissolution (pε < 3) destroys Fe oxyhydroxide sorbent capacity, releasing all sorbed metals simultaneously.'
      },
      SO4: {
        summary: 'Forms ion pairs with Cd²⁺ and Zn²⁺, reducing available free metal for sorption.',
        detail:  'In high-sulfate UAE evaporite groundwaters (SO₄²⁻ > 500 mg/L), CdSO₄° and ZnSO₄° neutral ion pairs reduce the fraction of free divalent metal available for Fe oxide sorption. This effect increases effective metal mobility by 15–40% relative to low-sulfate systems. Include sulfate complexation in all Kd calculations for sites in sabkha-proximal environments.',
        mobilityIndex: 'N/A (ligand affecting metal speciation)',
        criticalThreshold: 'SO₄²⁻ > 300 mg/L → adjust speciation calculations for CdSO₄° and ZnSO₄° pair formation'
      },
      CO3: {
        summary: 'Drives carbonate precipitation of heavy metals; critical secondary immobilisation in UAE carbonate terrain.',
        detail:  'Elevated alkalinity (HCO₃⁻ 200–600 mg/L) in UAE groundwaters promotes coprecipitation of Cd²⁺ with calcite and precipitation of PbCO₃ (cerussite), CuCO₃ (malachite), and ZnCO₃ (smithsonite). These carbonate solubility controls operate in addition to and independent of surface sorption, providing effective redundancy in contaminant attenuation.',
        mobilityIndex: 'N/A (ligand driving precipitation)',
        criticalThreshold: 'Alkalinity < 100 mg/L (as CaCO₃) reduces carbonate coprecipitation control — relevant in acidic AMD-affected UAE ophiolite groundwaters'
      },
      PO4: {
        summary: 'Competes with arsenate for Fe oxide sorption sites; can mobilize As if applied at high concentrations.',
        detail:  'Phosphate is a strong competitor for Fe oxide surface sites and can displace sorbed arsenate and arsenite, increasing dissolved arsenic. In UAE agricultural areas with heavy phosphate fertilizer application (Al Ain, Fujairah horticulture), this competition may be significant near ophiolite-sourced As backgrounds. Conversely, PO₄³⁻ may immobilize some heavy metals by direct precipitation (Pb₅(PO₄)₃OH = pyromorphite, log K = −76.5).',
        mobilityIndex: 'Variable — depends on As loading and PO₄ concentration',
        criticalThreshold: 'PO₄³⁻ > 1 mg/L (as P) near As-enriched soils warrants dedicated As speciation modelling'
      }
    },

    conditionNotes: {
      lowpH: (pH) => `At pH ${pH}, nearly all surface sorption capacities are severely diminished. Fe oxide surfaces carry a positive charge (below pH_PZC ≈ 8.1 for ferrihydrite), but strong H⁺ competition for sorption sites and partial dissolution of Fe oxyhydroxides occur below pH 6. This pH level is below the typical UAE carbonate-buffered range — if observed, suspect acid mine drainage from ophiolite terrain or industrial acidic waste disposal. Immediate neutralisation treatment is required before natural attenuation can operate.`,
      midpH: (pH) => `At pH ${pH}, Fe oxide and clay sorption is operating effectively for most UAE heavy metals. Retardation factors for Pb, Cu, and Zn are high. Cd retardation is somewhat lower due to CdCl⁺ and CdSO₄° complexation in UAE saline groundwaters. The carbonate coprecipitation mechanism is also active. This pH range is the most common in UAE carbonate aquifers and represents the condition for which most regulatory screening criteria (EMAP, USEPA RSLs) are calibrated.`,
      highpH: (pH) => `At pH ${pH}, maximum cation sorption on negatively-charged Fe oxide and clay surfaces. Pb, Cu, and Zn are near-completely immobilized. However, Al and As undergo anionic speciation (Al(OH)₄⁻, HAsO₄²⁻, H₂AsO₄⁻) at this pH range — surface sorption of anionic species is actually reduced above pH_PZC. Chromate (CrO₄²⁻) also increases in mobility at high pH. Oxyanionic contaminant mobility must be evaluated separately from cationic metals.`,
      highSalinity: (tds) => `At ${tds} g/L TDS (high salinity), ionic strength is very high. Diffuse double-layer compression on clay minerals reduces apparent sorption capacity. CdCl⁺, ZnCl⁺, and PbCl⁺ ion pairs all reduce free metal ion activity. Kd values measured in fresh water can overestimate sorption efficiency in UAE coastal/sabkha groundwaters by a factor of 2–10 for Cd and Zn. Site-specific batch sorption experiments under site-representative ionic strength are essential for any UAE coastal contaminated land assessment.`,
      lowSalinity: (tds) => `At ${tds} g/L TDS, ionic strength is low and free metal ion activities are high. Sorption is maximally effective. Conservative retardation factors can be used for initial risk screening. This condition is representative of UAE highland wadi recharge zones and ophiolite spring discharge areas.`,
      highTemp: (T) => `At ${T}°C, sorption equilibria shift slightly as adsorption is generally exothermic (Kd decreases modestly with temperature). More significantly, microbial activity at elevated UAE temperatures can alter the redox balance of the Fe oxide system, shifting between Fe(OH)₃ and Fe²⁺ more rapidly. Ensure sorption experiments for site risk assessment are conducted at representative in-situ temperatures — do not use default 20–25°C laboratory results for UAE summer groundwater conditions.`
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. SAMPLING & FIELD PROTOCOL GUIDANCE
// ─────────────────────────────────────────────────────────────────────────────

export const FIELD_PROTOCOLS = {
  general: [
    'Purge a minimum of 3 well volumes before sampling, or until field parameters (pH, EC, T, DO, ORP) have stabilized to within ±0.1 units for 5 consecutive minutes.',
    'Measure pH, EC, temperature, dissolved oxygen (DO), and oxidation-reduction potential (ORP/Eh) in a sealed flow-through cell to prevent atmospheric contamination.',
    'Filter samples for dissolved metals through 0.45 μm membrane filter in-line during pumping; do not filter in an open container.',
    'Acidify cation samples (metals, major cations) to pH < 2 with concentrated trace-metal-grade HNO₃ immediately after filtration.',
    'Collect anion and alkalinity samples unacidified in polyethylene bottles; keep on ice at 4°C; analyze alkalinity within 24 hours.',
    'Record GPS coordinates, water table depth, pumping rate, and purge volumes for all samples.',
    'Use dedicated non-purge low-flow sampling (0.1–0.5 L/min) for redox-sensitive analytes (Fe²⁺, Mn²⁺, As, Cr) to minimize borehole disturbance.'
  ],
  redox: [
    'Measure Fe²⁺ in the field using colorimetric test kit (ferrozine method) — do not rely on laboratory results for Fe²⁺ due to rapid oxidation during transport.',
    'Collect H₂S in ZnAc/NaOH preservative immediately upon sampling if sulfate-reducing conditions are suspected.',
    'Use anoxic sampling containers (evacuated, N₂-purged bottles) for highly reducing samples to prevent oxidation artefacts.',
    'Measure turbidity — if >1 NTU after 0.45 μm filtration, suspect colloidal transport; consider 0.1 μm ultrafiltration for dissolved fraction.',
    'Monitor for H₂S gas with a calibrated personal gas detector before entering any enclosed sampling structure near landfill or reducing aquifer environments.'
  ],
  evaporite: [
    'Measure specific gravity (hydrometer) or EC (mS/cm) in the field for highly saline UAE sabkha samples — laboratory dilution may be required.',
    'Collect sufficient volume for Br/Cl, δ³⁴S–SO₄, and δ¹⁸O–SO₄ isotope analysis if source attribution is required.',
    'Preserve sulfide-containing samples for sulfate analysis with ZnAc — sulfide oxidation to sulfate during transport is a common sampling artefact.',
    'Sample sabkha porewater with a MacroRhizon sampler or drive-point piezometer — bulk sampling of open pits mixes different salinity layers.'
  ],
  carbonate: [
    'Collect alkalinity sample with minimum headspace and analyze immediately or within 24 hours — CO₂ outgassing elevates pH and falsely reduces apparent alkalinity.',
    'Measure CO₂ partial pressure (pCO₂) in the field using a portable IR sensor if carbonate saturation state calculations are required for injection-well scaling assessments.',
    'Take temperature-corrected calcite saturation index in the field — temperature change between borehole and laboratory shifts SI by ~0.1 units per 5°C.',
    'For isotope analysis (δ¹³C–DIC), fill 40 mL amber glass vials with no headspace and add 100 μL H₃PO₄; cap immediately.'
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. UAE REGULATORY REFERENCE VALUES
// ─────────────────────────────────────────────────────────────────────────────

export const UAE_STANDARDS = {
  drinkingWater: {
    source: 'UAE Federal Standard 444-2009 / WHO Guidelines 4th Ed.',
    parameters: {
      pH:    { limit: '6.5–8.5', unit: '' },
      TDS:   { limit: 1000,      unit: 'mg/L' },
      SO4:   { limit: 250,       unit: 'mg/L' },
      NO3:   { limit: 50,        unit: 'mg/L (as NO₃⁻)' },
      Fe:    { limit: 0.3,       unit: 'mg/L' },
      Mn:    { limit: 0.1,       unit: 'mg/L' },
      Pb:    { limit: 0.01,      unit: 'mg/L' },
      Cd:    { limit: 0.003,     unit: 'mg/L' },
      Cu:    { limit: 2.0,       unit: 'mg/L' },
      Zn:    { limit: 3.0,       unit: 'mg/L' },
      As:    { limit: 0.01,      unit: 'mg/L' },
      Cl:    { limit: 250,       unit: 'mg/L' }
    }
  },
  irrigation: {
    source: 'UAE Ministry of Environment and Water — Irrigation Water Quality Guidelines',
    parameters: {
      pH:    { limit: '6.0–9.0', unit: '' },
      TDS:   { limit: 3000,      unit: 'mg/L' },
      SO4:   { limit: 960,       unit: 'mg/L' },
      NO3:   { limit: 30,        unit: 'mg/L (as N)' },
      Cl:    { limit: 350,       unit: 'mg/L' }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. TEMPERATURE CORRECTION UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Van't Hoff temperature correction for equilibrium constant
 * ln(K_T2 / K_T1) = -ΔH/R × (1/T2 - 1/T1)
 * @param {number} logK25  - log K at 25°C
 * @param {number} dH_kJ   - ΔH° in kJ/mol
 * @param {number} T_C     - target temperature in °C
 * @returns {number} - corrected log K at T_C
 */
export function logKatT(logK25, dH_kJ, T_C) {
  const R = 8.314e-3;   // kJ/(mol·K)
  const T1 = 298.15;    // K (25°C)
  const T2 = T_C + 273.15;
  const correction = -(dH_kJ / R) * (1 / T2 - 1 / T1) / Math.LN10;
  return +(logK25 + correction).toFixed(2);
}

/**
 * Estimate Saturation Index direction based on conditions
 */
export function estimateSI(scenario, element, conditions) {
  const { pH, temperature, salinity, pe } = conditions;

  if (scenario === 'carbonate_eq') {
    if (element === 'Ca') {
      const base = (pH - 7.8) * 0.7 + (temperature - 35) * (-0.02) + (salinity - 5) * 0.01;
      return base > 0.3 ? 'supersaturated' : base < -0.3 ? 'undersaturated' : 'near equilibrium';
    }
    if (element === 'Mg') {
      const base = (pH - 7.8) * 0.5 + (salinity - 5) * 0.015;
      return base > 0.3 ? 'supersaturated' : base < -0.5 ? 'undersaturated' : 'near equilibrium';
    }
  }
  if (scenario === 'gypsum_eq') {
    const gypsumSI = (salinity - 15) / 20;
    return gypsumSI > 0.1 ? 'near saturation or precipitating' : 'dissolving (undersaturated)';
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN WORKFLOW ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runAnalysis
 * -----------
 * Generates a full markdown analysis string for display in the explorer.
 *
 * @param {string[]}  selectedElements - array of element keys (e.g. ['Ca','Mg','SO4'])
 * @param {string}    scenarioId       - one of: 'carbonate_eq', 'gypsum_eq', 'redox', 'sorption'
 * @param {object}    conditions       - { pH, temperature, salinity, pe }
 * @returns {string}  markdown-formatted analysis
 */
export function runAnalysis(selectedElements, scenarioId, conditions) {
  const scenario = REACTIONS[scenarioId];
  if (!scenario) return '> ⚠️ Unknown scenario selected.';

  const { pH, temperature, salinity, pe } = conditions;
  const elSet = new Set(selectedElements);
  const elData = geochemElements;

  let md = '';

  // ── Header ──────────────────────────────────────────────────────────────
  md += `## ${scenario.title}\n`;
  md += `*UAE Geochemical Analysis — ${new Date().toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}*\n\n`;
  md += `**Conditions:** pH ${pH} · T = ${temperature}°C · TDS ≈ ${salinity} g/L · pε = ${pe}\n\n`;
  md += `**Selected species:** ${selectedElements.map(k => elData[k]?.symbol || k).join(', ')}\n\n`;
  md += `---\n\n`;

  // ── Section 1: Applicable Reactions ────────────────────────────────────
  const applicableReactions = scenario.primary.filter(rxn =>
    rxn.elements.some(e => elSet.has(e))
  );

  md += `### 1. Relevant Reactions in UAE Context\n\n`;

  if (applicableReactions.length === 0) {
    md += `> No primary reactions directly involve the selected elements for this scenario. Consider adding Ca, SO₄, Fe, or Mn to see specific reaction chains.\n\n`;
  } else {
    applicableReactions.forEach(rxn => {
      const correctedLogK = logKatT(rxn.logK_25, rxn.dH || 0, temperature);
      md += `**${rxn.name}**\n\n`;
      md += `> \`${rxn.equation}\`\n\n`;
      md += `log K₂₅ = ${rxn.logK_25}`;
      if (Math.abs(correctedLogK - rxn.logK_25) > 0.05) {
        md += ` → log K${temperature}°C ≈ **${correctedLogK}** (temp-corrected)`;
      }
      md += `\n\n${rxn.notes}\n\n`;
    });
  }

  // ── Section 2: Condition-dependent narrative ────────────────────────────
  md += `### 2. Condition Assessment\n\n`;

  const notes = scenario.conditionNotes;

  // pH interpretation
  if (scenarioId === 'carbonate_eq') {
    md += pH < 7.5   ? notes.lowpH(pH)  + '\n\n'
        : pH < 8.2   ? notes.midpH(pH)  + '\n\n'
        :              notes.highpH(pH) + '\n\n';
  } else if (scenarioId === 'gypsum_eq') {
    md += salinity < 5  ? notes.lowTDS(salinity)  + '\n\n'
        : salinity < 20 ? notes.midTDS(salinity)  + '\n\n'
        :                 notes.highTDS(salinity) + '\n\n';
    md += temperature > 42 ? notes.highTemp(temperature) + '\n\n'
        : temperature > 30 ? notes.midTemp(temperature)  + '\n\n'
        :                    notes.lowTemp(temperature)  + '\n\n';
  } else if (scenarioId === 'redox') {
    md += pe < -2   ? notes.deepReducing(pe) + '\n\n'
        : pe < 2    ? notes.ironReducing(pe) + '\n\n'
        : pe < 5    ? notes.suboxic(pe)      + '\n\n'
        :             notes.oxic(pe)         + '\n\n';
    md += pH < 7    ? notes.lowpH(pH)  + '\n\n'
        : pH < 8    ? notes.midpH(pH)  + '\n\n'
        :             notes.highpH(pH) + '\n\n';
    if (temperature > 35) md += notes.highTemp(temperature) + '\n\n';
  } else if (scenarioId === 'sorption') {
    md += pH < 7    ? notes.lowpH(pH)      + '\n\n'
        : pH < 8.5  ? notes.midpH(pH)      + '\n\n'
        :             notes.highpH(pH)     + '\n\n';
    md += salinity > 15 ? notes.highSalinity(salinity) + '\n\n'
        :                 notes.lowSalinity(salinity)  + '\n\n';
    if (temperature > 35) md += notes.highTemp(temperature) + '\n\n';
  }

  // ── Section 3: Element-by-element behaviour ─────────────────────────────
  md += `### 3. Element-Specific Behaviour\n\n`;

  selectedElements.forEach(key => {
    const behavior = scenario.elementBehavior?.[key];
    const el = elData[key];
    if (!el) return;

    if (behavior) {
      md += `**${el.symbol} — ${el.name}**\n\n`;
      md += `*${behavior.summary}*\n\n`;
      md += `${behavior.detail}\n\n`;
      if (behavior.saturationNote)   md += `> 📐 **SI Note:** ${behavior.saturationNote}\n\n`;
      if (behavior.mobilityIndex)    md += `> 🚦 **Mobility:** ${behavior.mobilityIndex}\n\n`;
      if (behavior.criticalThreshold) md += `> ⚠️ **Critical threshold:** ${behavior.criticalThreshold}\n\n`;
    } else {
      // Generic fallback for elements with no scenario-specific behaviour defined
      md += `**${el.symbol} — ${el.name}**\n\n`;
      if (el.category === 'hard') {
        md += `Hard cation (charge ${el.charge}, radius ${el.radius} Å). In this scenario, ${el.name} plays a supporting role as a major structural cation or conservative tracer. Monitor its concentration as part of the overall ionic balance.\n\n`;
      } else if (el.category === 'intermediate') {
        md += `Redox-active transition metal (charge ${el.charge}). Its oxidation state and mobility are sensitive to the pε and pH conditions described above. Measure Fe²⁺/Fe³⁺ split in the field whenever possible.\n\n`;
      } else if (el.category === 'soft') {
        md += `Toxic heavy metal (charge ${el.charge}). Even at trace concentrations, mobility and fate must be assessed. Sorption and precipitation equilibria above govern its retardation factor in UAE aquifer materials.\n\n`;
      } else if (el.category === 'anion') {
        md += `Major anion (charge ${el.charge}). Acts as a conservative tracer or participates as a ligand in complexation reactions. Include in the complete ionic balance calculation to validate analytical quality (CB error < 5%).\n\n`;
      }
    }
  });

  // ── Section 4: Redox Sequence Table (redox scenario only) ──────────────
  if (scenarioId === 'redox') {
    md += `### 4. UAE Redox Sequence Reference\n\n`;
    md += `| Zone | pε Range | Eh (mV) | Dominant Process | Field Indicator |\n`;
    md += `|------|---------|---------|-----------------|----------------|\n`;
    REACTIONS.redox.redoxSequence.forEach(zone => {
      const isActive = pe >= zone.pE_range[0] && pe <= zone.pE_range[1];
      md += `| ${isActive ? '**▶ ' : ''}${zone.zone}${isActive ? '**' : ''} | ${zone.pE_range[0]} to ${zone.pE_range[1]} | ${zone.Eh_mV[0]} to ${zone.Eh_mV[1]} | ${zone.dominant} | ${zone.indicator} |\n`;
    });
    md += `\n*▶ = current pε zone based on entered conditions*\n\n`;
  }

  // ── Section 5: Sorbent properties (sorption scenario only) ─────────────
  if (scenarioId === 'sorption') {
    const relevantSorbents = [];
    if (elSet.has('Fe3') || elSet.has('Fe2') || selectedElements.some(e => ['Pb','Cd','Cu','Zn','As','PO4'].includes(e))) {
      relevantSorbents.push(REACTIONS.sorption.sorbentProperties.ferrihydrite);
      relevantSorbents.push(REACTIONS.sorption.sorbentProperties.goethite);
    }
    if (selectedElements.some(e => ['Pb','Cd','Cu','Zn'].includes(e))) {
      relevantSorbents.push(REACTIONS.sorption.sorbentProperties.montmorillonite);
    }
    if (elSet.has('Ca') || elSet.has('CO3') || selectedElements.some(e => ['Cd','Pb'].includes(e))) {
      relevantSorbents.push(REACTIONS.sorption.sorbentProperties.calcite);
    }

    if (relevantSorbents.length > 0) {
      md += `### 4. Relevant Sorbent Phases in UAE Materials\n\n`;
      relevantSorbents.forEach(s => {
        md += `**${s.name}**`;
        if (s.surfArea) md += `  |  Surface area: ${s.surfArea}`;
        if (s.CEC)      md += `  |  CEC: ${s.CEC}`;
        if (s.pointOfZeroCharge) md += `  |  ${s.pointOfZeroCharge}`;
        md += `\n\n${s.notes}\n\n`;
      });
    }
  }

  // ── Section 6: Regulatory screening ────────────────────────────────────
  const dw = UAE_STANDARDS.drinkingWater.parameters;
  const applicableStandards = selectedElements.filter(e => {
    const sym = e.replace('2','').replace('3','').toLowerCase();
    return dw[e] || dw[e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()];
  });

  const stdSection = [];
  selectedElements.forEach(key => {
    const k = key.replace('Fe2','Fe').replace('Fe3','Fe');
    const upperKey = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
    const std = dw[upperKey] || dw[k];
    if (std) {
      stdSection.push(`- **${geochemElements[key]?.symbol || key}**: ≤ ${std.limit} ${std.unit} *(${UAE_STANDARDS.drinkingWater.source})*`);
    }
  });

  if (stdSection.length > 0) {
    const sectionNum = (scenarioId === 'redox' || scenarioId === 'sorption') ? 5 : 4;
    md += `### ${sectionNum}. UAE Regulatory Screening Values\n\n`;
    md += stdSection.join('\n') + '\n\n';
  }

  // ── Section 7: Field Protocols ──────────────────────────────────────────
  const lastSection = stdSection.length > 0
    ? ((scenarioId === 'redox' || scenarioId === 'sorption') ? 6 : 5)
    : ((scenarioId === 'redox' || scenarioId === 'sorption') ? 5 : 4);

  md += `### ${lastSection}. Recommended Field & Laboratory Protocols\n\n`;

  const protocolSets = [FIELD_PROTOCOLS.general];
  if (scenarioId === 'redox')       protocolSets.push(FIELD_PROTOCOLS.redox);
  if (scenarioId === 'gypsum_eq')   protocolSets.push(FIELD_PROTOCOLS.evaporite);
  if (scenarioId === 'carbonate_eq') protocolSets.push(FIELD_PROTOCOLS.carbonate);
  if (scenarioId === 'sorption')    protocolSets.push(FIELD_PROTOCOLS.redox); // redox overlap

  const allProtocols = protocolSets.flat();
  allProtocols.forEach(p => { md += `- ${p}\n`; });
  md += '\n';

  // ── Footer disclaimer ────────────────────────────────────────────────────
  md += `---\n\n`;
  md += `> *This analysis is qualitative and based on established geochemical principles calibrated to UAE hydrogeological conditions. It is not a substitute for site-specific PHREEQC or Visual MINTEQ speciation modelling using measured field data. All regulatory decisions must be verified against current UAE Federal and Emirate-level standards.*\n`;

  return md;
}
