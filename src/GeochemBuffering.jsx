/**
 * GeochemBuffering.jsx
 * UAE Geochemistry Explorer — Geochemical Buffering & Contaminant Release Module
 *
 * Illustrates how geochemical environments (carbonate, Fe-oxide, redox, evaporite)
 * act as natural "locks" that immobilise contaminants under normal UAE conditions,
 * and how crossing specific thresholds breaks those bonds and releases metals
 * into groundwater.
 *
 * Scientific basis: HSAB theory (Hard-Soft Acid-Base), Stumm & Morgan (1996),
 * Langmuir (1997), Parkhurst & Appelo (2013).
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Unlock, AlertTriangle, CheckCircle, Info, Zap, Mountain, Droplet, Beaker, ChevronDown, ChevronUp } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BUFFER ZONE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const BUFFER_ZONES = [
  {
    id: 'carbonate',
    name: 'Carbonate Buffer',
    subtitle: 'Calcite · Dolomite · Alkalinity',
    icon: Mountain,
    color: '#8B7355',
    lightColor: 'rgba(139,115,85,0.15)',
    borderColor: 'rgba(139,115,85,0.5)',
    lockedMetals: ['Pb²⁺', 'Zn²⁺', 'Cd²⁺', 'Cu²⁺', 'Ca²⁺', 'Mg²⁺'],
    lockedMetalKeys: ['Pb', 'Zn', 'Cd', 'Cu', 'Ca', 'Mg'],
    bonds: [
      { equation: 'Pb²⁺ + CO₃²⁻ → PbCO₃(s)', mineral: 'Cerussite', logK: '−13.1' },
      { equation: 'Zn²⁺ + CO₃²⁻ → ZnCO₃(s)', mineral: 'Smithsonite', logK: '−10.0' },
      { equation: 'Cd²⁺ → CaCO₃ lattice',     mineral: 'Calcite (co-ppt)', logK: '−12.1' },
    ],
    hsabNote: 'Hard carbonate anion (CO₃²⁻) bonds with borderline/soft metal cations. Under UAE alkaline conditions (pH 7–9), carbonate activity is high enough to force precipitation despite the preference of Pb/Cd for softer ligands.',
    thresholds: [
      { label: 'pH < 6.5',           severity: 'critical', trigger: 'pH',         value: 6.5,  direction: 'below', description: 'Carbonate minerals dissolve; CO₃²⁻ activity collapses; all carbonate-locked metals released.' },
      { label: 'TDS > 35 g/L',       severity: 'warning',  trigger: 'salinity',   value: 35,   direction: 'above', description: 'Ionic strength suppresses carbonate mineral saturation index; coprecipitation efficiency drops.' },
      { label: 'Temperature > 45°C', severity: 'warning',  trigger: 'temperature',value: 45,   direction: 'above', description: 'Retrograde calcite solubility shifts; aqueous complexes stabilise at elevated temperature.' },
    ],
    capacityFn: ({ pH, temperature, salinity }) => {
      const phFactor   = Math.max(0, Math.min(1, (pH - 6.0) / 2.5));
      const tempFactor = Math.max(0, 1 - Math.max(0, temperature - 42) * 0.04);
      const salFactor  = Math.max(0, 1 - Math.max(0, salinity - 20) * 0.02);
      return phFactor * tempFactor * salFactor;
    },
    uaeContext: 'UAE carbonate aquifers (Cretaceous–Eocene limestones, Musandam dolomite) maintain high alkalinity (HCO₃⁻ 150–500 mg/L) and pH 7.5–8.5, providing robust carbonate buffering across the northern and eastern Emirates.',
  },
  {
    id: 'feoxide',
    name: 'Fe-Oxide Sorption Buffer',
    subtitle: 'Ferrihydrite · Goethite · Surface Complexation',
    icon: Beaker,
    color: '#B87333',
    lightColor: 'rgba(184,115,51,0.15)',
    borderColor: 'rgba(184,115,51,0.5)',
    lockedMetals: ['Pb²⁺', 'Cu²⁺', 'Cd²⁺', 'Zn²⁺', 'As(V)', 'Cr(VI)'],
    lockedMetalKeys: ['Pb', 'Cu', 'Cd', 'Zn', 'As', 'Cr'],
    bonds: [
      { equation: '≡FeOH + Pb²⁺ → ≡FeOPb⁺ + H⁺',  mineral: 'Ferrihydrite surface', logK: '+4.65' },
      { equation: '≡FeOH + Cu²⁺ → ≡FeOCu⁺ + H⁺',  mineral: 'Ferrihydrite surface', logK: '+2.89' },
      { equation: '≡FeOH + Cd²⁺ → ≡FeOCd⁺ + H⁺',  mineral: 'Ferrihydrite surface', logK: '+0.47' },
    ],
    hsabNote: 'Fe-oxide surface hydroxyl groups (≡FeOH) are hard Lewis bases — they bind hard and borderline metal cations via inner-sphere complexation. The surface charge turns negative above pH 8.1 (point of zero charge), maximising cation attraction. This is the dominant attenuation mechanism in UAE vadose zones.',
    thresholds: [
      { label: 'pε < 2 (Fe-reducing)',  severity: 'critical', trigger: 'pe',       value: 2,   direction: 'below', description: 'Fe(OH)₃ reductively dissolves. ALL sorbed metals are released simultaneously — the most catastrophic release mechanism in contaminated UAE sites.' },
      { label: 'pH < 5.5',              severity: 'critical', trigger: 'pH',       value: 5.5, direction: 'below', description: 'H⁺ outcompetes metal cations for surface sites. Surface dissolution begins. Fe-oxide sorption capacity collapses.' },
      { label: 'TDS > 20 g/L',          severity: 'warning',  trigger: 'salinity', value: 20,  direction: 'above', description: 'CdCl⁺, ZnCl⁺ ion pairs reduce free metal activity available for sorption. Effective Kd values drop 2–10×.' },
    ],
    capacityFn: ({ pH, pe, salinity }) => {
      const phFactor  = Math.max(0, Math.min(1, (pH - 5.0) / 4.0));
      const peFactor  = Math.max(0, Math.min(1, (pe - 1.0) / 9.0));
      const salFactor = Math.max(0, 1 - Math.max(0, salinity - 15) * 0.025);
      return Math.min(phFactor, peFactor) * salFactor;
    },
    uaeContext: 'Even 0.1% ferrihydrite by weight in UAE alluvial gravels provides ~500 m²/kg sorption area — enormous retardation capacity. Reductive dissolution during landfill plume expansion (e.g. Al Fagaa, Sharjah) is the primary mechanism for simultaneous multi-metal release.',
  },
  {
    id: 'redox',
    name: 'Redox Buffer',
    subtitle: 'O₂ · NO₃⁻ · MnO₂ · Fe(OH)₃ · SO₄²⁻',
    icon: Zap,
    color: '#DAA520',
    lightColor: 'rgba(218,165,32,0.15)',
    borderColor: 'rgba(218,165,32,0.5)',
    lockedMetals: ['Fe²⁺', 'Mn²⁺', 'H₂S', 'CH₄', 'NH₄⁺'],
    lockedMetalKeys: ['Fe2', 'Mn', 'S', 'C', 'N'],
    bonds: [
      { equation: 'Fe²⁺ + 3H₂O → Fe(OH)₃(s) + 3H⁺ + e⁻',  mineral: 'Ferrihydrite',  logK: '—' },
      { equation: 'Mn²⁺ + 2H₂O → MnO₂(s) + 4H⁺ + 2e⁻',    mineral: 'Birnessite',    logK: '—' },
      { equation: 'SO₄²⁻ + 8H⁺ + 8e⁻ → S²⁻ + 4H₂O',       mineral: 'Sulfide phase', logK: '—' },
    ],
    hsabNote: 'The redox buffer is a sequential cascade — each electron acceptor (O₂, NO₃⁻, MnO₂, Fe(OH)₃, SO₄²⁻) must be consumed before the next step activates. This staircase structure means the system has multiple layers of buffering. Fe²⁺ and Mn²⁺ are only released when the Fe(OH)₃ redox step is reached.',
    thresholds: [
      { label: 'pε < 3 (Fe-reduction)',  severity: 'critical', trigger: 'pe',         value: 3,    direction: 'below', description: 'Fe³⁺ → Fe²⁺ reduction commences. Fe(OH)₃ dissolves. Fe²⁺ and Mn²⁺ become mobile. Sorbed metals co-released.' },
      { label: 'pε < −2 (SO₄-reducing)', severity: 'critical', trigger: 'pe',         value: -2,   direction: 'below', description: 'Sulfate reduction produces H₂S(g). Methanogenesis active. Health and safety risk in enclosed structures.' },
      { label: 'Temperature > 38°C',      severity: 'warning',  trigger: 'temperature',value: 38,   direction: 'above', description: 'Microbial redox reaction rates double per 10°C. O₂ solubility drops to 6.5 mg/L. Reducing conditions develop faster.' },
    ],
    capacityFn: ({ pe, temperature }) => {
      const peFactor   = Math.max(0, Math.min(1, (pe + 3) / 11));
      const tempFactor = Math.max(0, 1 - Math.max(0, temperature - 35) * 0.025);
      return peFactor * tempFactor;
    },
    uaeContext: 'UAE landfill leachate plumes (Al Fagaa, Al Dhaid) create strong reducing conditions within metres of the waste body. The redox buffer capacity of native aquifer material determines how far Fe²⁺ and Mn²⁺ — and co-released heavy metals — travel before re-oxidation immobilises them.',
  },
  {
    id: 'evaporite',
    name: 'Evaporite / Sulfide Buffer',
    subtitle: 'Gypsum · Halite · Sabkha Brine · Biogenic Sulfide',
    icon: Droplet,
    color: '#87CEEB',
    lightColor: 'rgba(135,206,235,0.12)',
    borderColor: 'rgba(135,206,235,0.4)',
    lockedMetals: ['Pb²⁺', 'Zn²⁺', 'Cd²⁺', 'Cu²⁺', 'Fe²⁺', 'Ba²⁺'],
    lockedMetalKeys: ['Pb', 'Zn', 'Cd', 'Cu', 'Fe2', 'Ba'],
    bonds: [
      { equation: 'Pb²⁺ + S²⁻ → PbS(s)',   mineral: 'Galena',     logK: '−27.5' },
      { equation: 'Zn²⁺ + S²⁻ → ZnS(s)',   mineral: 'Sphalerite', logK: '−17.5' },
      { equation: 'Cd²⁺ + S²⁻ → CdS(s)',   mineral: 'Greenockite', logK: '−27.0' },
    ],
    hsabNote: 'Soft metal cations (Pb²⁺, Cd²⁺) and intermediate cations (Cu²⁺, Zn²⁺) have strong affinity for the soft sulfide ligand (S²⁻) — HSAB theory predicts extremely stable metal sulfide bonds (very negative log Ksp). Under reducing UAE sabkha/landfill conditions, biogenic sulfide from SO₄-reducing bacteria provides a powerful secondary trap for soft metals.',
    thresholds: [
      { label: 'pε > 0 (re-oxidation)',    severity: 'critical', trigger: 'pe',       value: 0,    direction: 'above', description: 'Sulfide minerals oxidise back to sulfate. Metal sulfides dissolve, releasing all trapped soft metals. Common at the aerobic fringe of a re-wetting–drying cycle.' },
      { label: 'pH < 6.0',                 severity: 'critical', trigger: 'pH',       value: 6.0,  direction: 'below', description: 'Acid dissolves metal sulfides and carbonates. H₂S(g) degasses. All soft metals mobilised.' },
      { label: 'TDS < 1 g/L (dilution)',   severity: 'warning',  trigger: 'salinity', value: 1,    direction: 'below', description: 'Infiltrating fresh water under-saturates gypsum, triggering rapid dissolution. Sulfide-bearing porewater diluted — reducing buffering capacity.' },
    ],
    capacityFn: ({ pe, pH, salinity }) => {
      // Two mechanisms: (1) sulfide precipitation (active when reducing + SO4 present)
      // (2) gypsum/sabkha buffering (salinity-driven)
      const sulfide_active = pe < 0 ? Math.min(0.6, Math.min(salinity / 5, 1) * (-pe) * 0.15) : 0;
      const gypsum_base    = Math.min(1, salinity / 30);
      const pH_factor      = Math.max(0, Math.min(1, (pH - 5.5) / 3.0));
      // Re-oxidation destroys sulfides
      const oxidation_penalty = pe > 2 ? Math.min(0.5, (pe - 2) * 0.1) : 0;
      return Math.max(0, Math.min(1, (gypsum_base + sulfide_active) * pH_factor - oxidation_penalty));
    },
    uaeContext: 'UAE coastal sabkhas (Abu Dhabi coast, Khor al-Beidah) host active sulfate-reducing bacteria in their organic-rich sediments. Biogenic H₂S reacts with infiltrating metal-bearing groundwater to precipitate metal sulfides in the capillary fringe — a natural biogeochemical trap for industrial runoff metals.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// METAL RELEASE LOGIC — which metals escape which buffers at what capacity
// ─────────────────────────────────────────────────────────────────────────────

const METAL_COLORS = {
  locked:   { bg: 'rgba(34,197,94,0.2)',  border: '#22c55e', text: '#86efac', icon: '🔒' },
  stressed: { bg: 'rgba(251,191,36,0.2)', border: '#fbbf24', text: '#fde68a', icon: '⚠️' },
  released: { bg: 'rgba(239,68,68,0.2)',  border: '#ef4444', text: '#fca5a5', icon: '☠️' },
};

function getMetalState(capacity) {
  if (capacity > 0.45) return 'locked';
  if (capacity > 0.15) return 'stressed';
  return 'released';
}

function getCapacityColor(pct) {
  if (pct > 0.55) return '#22c55e';
  if (pct > 0.25) return '#fbbf24';
  return '#ef4444';
}

function getStatusLabel(pct) {
  if (pct > 0.55) return { text: 'ACTIVE — contaminants locked', color: '#22c55e' };
  if (pct > 0.25) return { text: 'STRESSED — approaching threshold', color: '#fbbf24' };
  return { text: 'BREACHED — contaminants released', color: '#ef4444' };
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERALL SYSTEM HEALTH
// ─────────────────────────────────────────────────────────────────────────────

function SystemHealthBar({ capacities }) {
  const avg = Object.values(capacities).reduce((a, b) => a + b, 0) / Object.keys(capacities).length;
  const color = getCapacityColor(avg);
  const label = avg > 0.55 ? 'All buffers active — contaminants immobilised'
    : avg > 0.25 ? 'System under stress — some contaminants mobilising'
    : 'Critical — multiple buffers breached, significant contaminant release';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}40`,
      borderRadius: 12,
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: '1.1rem', color: '#daa520', fontWeight: 600 }}>
          Overall System Buffering Health
        </span>
        <span style={{ fontSize: '0.85rem', color, fontWeight: 600 }}>
          {Math.round(avg * 100)}%
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${avg * 100}%`,
          height: '100%',
          background: color,
          borderRadius: 6,
          transition: 'width 0.4s ease, background 0.4s ease',
        }} />
      </div>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#c9b998' }}>{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUFFER ZONE CARD
// ─────────────────────────────────────────────────────────────────────────────

function BufferCard({ zone, capacity, conditions, expanded, onToggle }) {
  const metalState = getMetalState(capacity);
  const statusInfo = getStatusLabel(capacity);
  const capColor   = getCapacityColor(capacity);
  const Icon       = zone.icon;

  // Identify which specific threshold is being approached or breached
  const activeThresholds = zone.thresholds.map(t => {
    const current = conditions[t.trigger];
    const breached = t.direction === 'below' ? current < t.value : current > t.value;
    const stressed = t.direction === 'below'
      ? current < (t.value + (t.severity === 'critical' ? 0.8 : 5))
      : current > (t.value - (t.severity === 'critical' ? 0.8 : 5));
    return { ...t, breached, stressed };
  });

  const releasedMetals   = zone.lockedMetals.filter((_, i) => capacity < 0.15);
  const stressedMetals   = zone.lockedMetals.filter((_, i) => capacity >= 0.15 && capacity < 0.45);
  const immobileMetals   = zone.lockedMetals.filter((_, i) => capacity >= 0.45);

  return (
    <div style={{
      background: metalState === 'released' ? 'rgba(239,68,68,0.06)' : zone.lightColor,
      border: `1.5px solid ${metalState === 'released' ? '#ef444460' : zone.borderColor}`,
      borderRadius: 14,
      padding: '1.25rem',
      transition: 'all 0.4s ease',
    }}>
      {/* Card header */}
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.75rem' }}
      >
        <div style={{
          background: zone.lightColor,
          border: `1px solid ${zone.borderColor}`,
          borderRadius: 8,
          padding: '0.4rem',
          flexShrink: 0,
        }}>
          <Icon size={18} color={zone.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: '"Crimson Pro", serif', color: '#f5e6d3', fontWeight: 600 }}>
              {zone.name}
            </h3>
            {expanded ? <ChevronUp size={14} color="#8B7355" /> : <ChevronDown size={14} color="#8B7355" />}
          </div>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#8B7355' }}>{zone.subtitle}</p>
        </div>
      </div>

      {/* Buffer capacity bar */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.72rem', color: '#c9b998' }}>Buffer capacity</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: capColor }}>
            {Math.round(capacity * 100)}%
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${capacity * 100}%`,
            height: '100%',
            background: capColor,
            borderRadius: 4,
            transition: 'width 0.35s ease, background 0.35s ease',
          }} />
        </div>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: statusInfo.color, fontWeight: 600 }}>
          {metalState === 'locked'   ? '🔒 ' : metalState === 'stressed' ? '⚠️ ' : '☠️ '}
          {statusInfo.text}
        </p>
      </div>

      {/* Metal chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
        {zone.lockedMetals.map((metal, i) => {
          const state = capacity >= 0.45 ? 'locked' : capacity >= 0.15 ? 'stressed' : 'released';
          const style = METAL_COLORS[state];
          return (
            <span key={i} style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: style.text,
              borderRadius: 6,
              padding: '0.2rem 0.5rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'all 0.35s ease',
            }}>
              {style.icon} {metal}
            </span>
          );
        })}
      </div>

      {/* Active threshold warnings */}
      {activeThresholds.filter(t => t.breached || t.stressed).map((t, i) => (
        <div key={i} style={{
          background: t.breached ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.10)',
          border: `1px solid ${t.breached ? '#ef444450' : '#fbbf2450'}`,
          borderRadius: 6,
          padding: '0.4rem 0.6rem',
          marginBottom: '0.35rem',
          fontSize: '0.72rem',
        }}>
          <span style={{ color: t.breached ? '#fca5a5' : '#fde68a', fontWeight: 700 }}>
            {t.breached ? '🚨 BREACHED' : '⚠️ APPROACHING'}: {t.label}
          </span>
          {t.breached && (
            <p style={{ margin: '0.2rem 0 0', color: '#d1a0a0', lineHeight: 1.4 }}>{t.description}</p>
          )}
        </div>
      ))}

      {/* Expandable detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${zone.borderColor}`, marginTop: '0.75rem', paddingTop: '0.75rem' }}>

          {/* Bond equations */}
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', color: '#daa520', fontWeight: 600 }}>
            Active immobilisation bonds:
          </p>
          {zone.bonds.map((b, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 6,
              padding: '0.35rem 0.6rem',
              marginBottom: '0.25rem',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: '#c9b998',
            }}>
              <span style={{ color: '#f5e6d3' }}>{b.equation}</span>
              {'  '}
              <span style={{ color: '#8B7355' }}>log K = {b.logK} ({b.mineral})</span>
            </div>
          ))}

          {/* HSAB explanation */}
          <div style={{
            background: 'rgba(218,165,32,0.07)',
            border: '1px solid rgba(218,165,32,0.2)',
            borderRadius: 6,
            padding: '0.5rem 0.7rem',
            marginTop: '0.6rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#c9b998', lineHeight: 1.55 }}>
              <span style={{ color: '#daa520', fontWeight: 600 }}>Why this bond forms (HSAB): </span>
              {zone.hsabNote}
            </p>
          </div>

          {/* UAE context */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            padding: '0.5rem 0.7rem',
            marginTop: '0.4rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#c9b998', lineHeight: 1.55 }}>
              <span style={{ color: '#f5e6d3', fontWeight: 600 }}>UAE context: </span>
              {zone.uaeContext}
            </p>
          </div>

          {/* All thresholds table */}
          <p style={{ margin: '0.75rem 0 0.35rem', fontSize: '0.75rem', color: '#daa520', fontWeight: 600 }}>
            Release thresholds:
          </p>
          {zone.thresholds.map((t, i) => {
            const current = conditions[t.trigger];
            const breached = t.direction === 'below' ? current < t.value : current > t.value;
            return (
              <div key={i} style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                marginBottom: '0.35rem',
                fontSize: '0.72rem',
              }}>
                <span style={{
                  flexShrink: 0,
                  background: breached
                    ? (t.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.25)')
                    : 'rgba(34,197,94,0.15)',
                  border: `1px solid ${breached ? (t.severity === 'critical' ? '#ef4444' : '#fbbf24') : '#22c55e'}`,
                  color: breached ? (t.severity === 'critical' ? '#fca5a5' : '#fde68a') : '#86efac',
                  borderRadius: 4,
                  padding: '0.1rem 0.4rem',
                  fontWeight: 700,
                }}>
                  {breached ? (t.severity === 'critical' ? '🚨' : '⚠️') : '✓'} {t.label}
                </span>
                <span style={{ color: '#8B7355', lineHeight: 1.4 }}>{t.description}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITION SLIDERS
// ─────────────────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit, onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#c9b998' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color || '#daa520' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: color || '#daa520',
          cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#8B7355', marginTop: 2 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELEASE SUMMARY TABLE
// ─────────────────────────────────────────────────────────────────────────────

function ReleaseSummary({ conditions, capacities }) {
  const contaminants = [
    { symbol: 'Pb²⁺',  name: 'Lead',     zones: ['carbonate','feoxide','evaporite'], who: '0.01 mg/L' },
    { symbol: 'Cd²⁺',  name: 'Cadmium',  zones: ['carbonate','feoxide','evaporite'], who: '0.003 mg/L' },
    { symbol: 'Cu²⁺',  name: 'Copper',   zones: ['feoxide','evaporite'],             who: '2 mg/L' },
    { symbol: 'Zn²⁺',  name: 'Zinc',     zones: ['carbonate','feoxide','evaporite'], who: '3 mg/L' },
    { symbol: 'Fe²⁺',  name: 'Ferrous Fe', zones: ['redox','evaporite'],             who: '0.3 mg/L' },
    { symbol: 'Mn²⁺',  name: 'Manganese', zones: ['redox'],                          who: '0.1 mg/L' },
    { symbol: 'As(V)', name: 'Arsenic',   zones: ['feoxide'],                        who: '0.01 mg/L' },
  ];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(139,115,85,0.3)',
      borderRadius: 12,
      padding: '1.25rem',
      marginTop: '1.5rem',
    }}>
      <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '1.2rem', color: '#daa520', margin: '0 0 0.75rem' }}>
        Contaminant Mobility Summary
      </h3>
      <p style={{ fontSize: '0.78rem', color: '#8B7355', margin: '0 0 0.75rem' }}>
        Under the current conditions, each contaminant's mobility is determined by whether ALL of its retaining buffer zones are still active.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(139,115,85,0.3)' }}>
              <th style={{ textAlign: 'left',  padding: '0.4rem 0.6rem', color: '#c9b998', fontWeight: 600 }}>Species</th>
              <th style={{ textAlign: 'left',  padding: '0.4rem 0.6rem', color: '#c9b998', fontWeight: 600 }}>Retaining buffers</th>
              <th style={{ textAlign: 'center',padding: '0.4rem 0.6rem', color: '#c9b998', fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#c9b998', fontWeight: 600 }}>UAE standard</th>
            </tr>
          </thead>
          <tbody>
            {contaminants.map((c, i) => {
              const maxCap = Math.max(...c.zones.map(z => capacities[z] || 0));
              const state  = getMetalState(maxCap);
              const stateStyle = METAL_COLORS[state];
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(139,115,85,0.15)' }}>
                  <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: '#f5e6d3' }}>
                    {c.symbol}
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#8B7355', fontWeight: 400 }}>{c.name}</span>
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {c.zones.map(z => {
                        const cap = capacities[z] || 0;
                        const zState = getMetalState(cap);
                        const zStyle = METAL_COLORS[zState];
                        const zName = BUFFER_ZONES.find(b => b.id === z)?.name.split(' ')[0] || z;
                        return (
                          <span key={z} style={{
                            background: zStyle.bg,
                            border: `1px solid ${zStyle.border}`,
                            color: zStyle.text,
                            borderRadius: 4,
                            padding: '0.1rem 0.35rem',
                            fontSize: '0.65rem',
                          }}>{zName}</span>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    <span style={{
                      background: stateStyle.bg,
                      border: `1px solid ${stateStyle.border}`,
                      color: stateStyle.text,
                      borderRadius: 6,
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}>
                      {state === 'locked' ? '🔒 Immobile' : state === 'stressed' ? '⚠️ At risk' : '☠️ Mobile'}
                    </span>
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#8B7355', fontSize: '0.72rem' }}>
                    {c.who}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function GeochemBuffering({ onBack }) {
  const [conditions, setConditions] = useState({ pH: 7.8, temperature: 35, salinity: 5, pe: 4 });
  const [expandedCard, setExpandedCard] = useState(null);
  const [capacities, setCapacities] = useState({});

  // Recalculate all buffer capacities whenever conditions change
  useEffect(() => {
    const newCaps = {};
    BUFFER_ZONES.forEach(zone => {
      newCaps[zone.id] = Math.max(0, Math.min(1, zone.capacityFn(conditions)));
    });
    setCapacities(newCaps);
  }, [conditions]);

  const set = (key) => (val) => setConditions(prev => ({ ...prev, [key]: val }));

  const toggleCard = (id) => setExpandedCard(prev => prev === id ? null : id);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c2416 0%, #1a1410 100%)',
      color: '#f5e6d3',
      fontFamily: '"IBM Plex Sans", sans-serif',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '2rem', borderBottom: '2px solid #8B7355', paddingBottom: '1.25rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(139,115,85,0.4)',
              color: '#c9b998',
              borderRadius: 8,
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Explorer
          </button>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '2.2rem', fontWeight: 600, margin: 0, color: '#f5e6d3', letterSpacing: '-0.02em' }}>
            Geochemical Buffering &amp; Contaminant Release
          </h1>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#c9b998', fontWeight: 300 }}>
            How UAE geochemical environments bond and buffer contaminants — and what conditions break those bonds
          </p>
        </header>

        {/* Concept explanation */}
        <div style={{
          background: 'rgba(218,165,32,0.06)',
          border: '1px solid rgba(218,165,32,0.25)',
          borderRadius: 12,
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          lineHeight: 1.65,
          color: '#c9b998',
        }}>
          <span style={{ color: '#daa520', fontWeight: 700, fontSize: '0.9rem' }}>Core principle: </span>
          UAE geochemical environments do not destroy contaminants — they <em>bond</em> them into immobile mineral phases or surface complexes.
          Each environment has a <strong style={{ color: '#f5e6d3' }}>buffering capacity</strong> — the quantity of bonding sites and mineral stability margins available.
          Contaminants are only released when a specific <strong style={{ color: '#f5e6d3' }}>threshold condition</strong> is crossed and that bonding capacity is exhausted.
          The periodic table classification (Hard / Intermediate / Soft) determines <em>which</em> metal bonds <em>where</em> and <em>how strongly</em>.
          Adjust the sliders below to see exactly which buffers are active and which are failing under your field conditions.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: sliders + health bar */}
          <div style={{ position: 'sticky', top: '1rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,115,85,0.3)',
              borderRadius: 12,
              padding: '1.25rem',
              marginBottom: '1rem',
            }}>
              <h2 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '1.15rem', color: '#daa520', margin: '0 0 1rem' }}>
                Field Conditions
              </h2>
              <Slider label="pH" value={conditions.pH} min={5} max={10} step={0.1} unit="" onChange={set('pH')} color="#87CEEB" />
              <Slider label="pε (redox)" value={conditions.pe} min={-8} max={15} step={0.5} unit="" onChange={set('pe')} color="#fbbf24" />
              <Slider label="TDS" value={conditions.salinity} min={0.5} max={50} step={0.5} unit=" g/L" onChange={set('salinity')} color="#DAA520" />
              <Slider label="Temperature" value={conditions.temperature} min={20} max={55} step={1} unit="°C" onChange={set('temperature')} color="#B87333" />
            </div>

            {/* Mini redox ladder */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,115,85,0.3)',
              borderRadius: 12,
              padding: '1rem 1.25rem',
            }}>
              <p style={{ margin: '0 0 0.6rem', fontSize: '0.78rem', color: '#daa520', fontWeight: 600 }}>Redox ladder (current pε = {conditions.pe})</p>
              {[
                { label: 'O₂ reduction',    range: [7,15],  color: '#87CEEB' },
                { label: 'Nitrate reduction', range: [5,7],  color: '#86efac' },
                { label: 'Mn reduction',     range: [3,5],  color: '#fde68a' },
                { label: 'Fe reduction',     range: [0,3],  color: '#fbbf24' },
                { label: 'SO₄ reduction',    range: [-4,0], color: '#fca5a5' },
                { label: 'Methanogenesis',   range: [-8,-4],color: '#d8b4fe' },
              ].map((step, i) => {
                const active = conditions.pe >= step.range[0] && conditions.pe <= step.range[1];
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.4rem',
                    borderRadius: 5,
                    marginBottom: 2,
                    background: active ? `${step.color}20` : 'transparent',
                    border: `1px solid ${active ? step.color + '60' : 'transparent'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? step.color : '#444', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', color: active ? '#f5e6d3' : '#6b5b4d', fontWeight: active ? 600 : 400 }}>
                      {step.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#6b5b4d', marginLeft: 'auto' }}>
                      pε {step.range[0]}–{step.range[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: buffer zone cards + summary */}
          <div>
            <SystemHealthBar capacities={capacities} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0' }}>
              {BUFFER_ZONES.map(zone => (
                <BufferCard
                  key={zone.id}
                  zone={zone}
                  capacity={capacities[zone.id] ?? 1}
                  conditions={conditions}
                  expanded={expandedCard === zone.id}
                  onToggle={() => toggleCard(zone.id)}
                />
              ))}
            </div>

            <ReleaseSummary conditions={conditions} capacities={capacities} />
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid rgba(139,115,85,0.25)', fontSize: '0.75rem', color: '#6b5b4d', lineHeight: 1.6 }}>
          Buffer capacity percentages are qualitative indicators derived from geochemical threshold relationships. They are not a substitute for PHREEQC/Visual MINTEQ speciation modelling using measured field data. HSAB bond strengths and mineral solubility constants follow Shannon (1976), Stumm &amp; Morgan (1996), and Parkhurst &amp; Appelo (2013).
        </div>
      </div>
    </div>
  );
}
