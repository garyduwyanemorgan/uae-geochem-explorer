import React, { useState } from 'react';
import { Beaker, Droplet, Mountain, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { geochemElements, runAnalysis } from './geochemReactions.js';

const reactionScenarios = [
  {
    id: 'carbonate_eq',
    name: 'Carbonate Equilibria',
    icon: Mountain,
    description: 'Calcite/dolomite dissolution and precipitation in UAE carbonate aquifers',
    context: 'Critical for understanding limestone aquifer behavior, cave formation, and secondary porosity development'
  },
  {
    id: 'gypsum_eq',
    name: 'Evaporite Dissolution',
    icon: Droplet,
    description: 'Gypsum/anhydrite equilibria in sabkha environments',
    context: 'Common in UAE coastal and inland sabkhas; affects groundwater salinity and sulfate levels'
  },
  {
    id: 'redox',
    name: 'Redox Reactions',
    icon: Zap,
    description: 'Iron and manganese oxidation/reduction in landfill leachate',
    context: 'Key for Al Fagaa landfill assessment; controls contaminant mobility and geochemical evolution'
  },
  {
    id: 'sorption',
    name: 'Surface Complexation',
    icon: Beaker,
    description: 'Heavy metal sorption onto clays and iron oxides',
    context: 'Controls contaminant attenuation in vadose zone and aquifer materials'
  }
];

const uaeConditions = {
  temperature: { min: 25, max: 50, default: 35, unit: '°C' },
  pH: { min: 6.5, max: 9.5, default: 7.8, unit: '' },
  salinity: { min: 0.5, max: 50, default: 5, unit: 'g/L TDS' },
  pe: { min: -8, max: 15, default: 4, unit: '' }
};

export default function UAEGeochemExplorer({ onOpenBuffering }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [conditions, setConditions] = useState({
    temperature: 35,
    pH: 7.8,
    salinity: 5,
    pe: 4
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleElement = (elementKey) => {
    setSelectedElements(prev =>
      prev.includes(elementKey)
        ? prev.filter(e => e !== elementKey)
        : [...prev, elementKey]
    );
  };

  const handleRunAnalysis = async () => {
    if (!selectedScenario || selectedElements.length === 0) return;

    setLoading(true);
    setAnalysis(null);

    // Brief artificial delay so the spinner is visible
    await new Promise(resolve => setTimeout(resolve, 500));

    const analysisText = runAnalysis(selectedElements, selectedScenario, conditions);

    setAnalysis(analysisText);
    setLoading(false);
  };

  // Group elements by category
  const elementsByCategory = {
    hard: Object.entries(geochemElements).filter(([_, e]) => e.category === 'hard'),
    intermediate: Object.entries(geochemElements).filter(([_, e]) => e.category === 'intermediate'),
    soft: Object.entries(geochemElements).filter(([_, e]) => e.category === 'soft'),
    anion: Object.entries(geochemElements).filter(([_, e]) => e.category === 'anion')
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c2416 0%, #1a1410 100%)',
      color: '#f5e6d3',
      fontFamily: '"IBM Plex Sans", sans-serif',
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{
        maxWidth: '1400px',
        margin: '0 auto 3rem',
        borderBottom: '2px solid #8B7355',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{
          fontFamily: '"Crimson Pro", serif',
          fontSize: '2.5rem',
          fontWeight: 600,
          margin: 0,
          letterSpacing: '-0.02em',
          color: '#f5e6d3'
        }}>
          UAE Geochemistry Explorer
        </h1>
        <p style={{
          margin: '0.5rem 0 0',
          fontSize: '1rem',
          color: '#c9b998',
          fontWeight: 300
        }}>
          AI-Powered Reaction Analysis for Hydrogeological Consulting
        </p>

        {/* Buffering & Release navigation button */}
        {onOpenBuffering && (
          <button
            onClick={onOpenBuffering}
            style={{
              marginTop: '1rem',
              background: 'rgba(218,165,32,0.12)',
              border: '1.5px solid rgba(218,165,32,0.5)',
              color: '#daa520',
              borderRadius: '8px',
              padding: '0.55rem 1.1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,165,32,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,165,32,0.12)'}
          >
            🔒 Buffering &amp; Contaminant Release →
          </button>
        )}
      </header>

      <section style={{
        maxWidth: '1400px',
        margin: '0 auto 2rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(139, 115, 85, 0.3)',
        padding: '1.25rem 1.5rem'
      }}>
        <button
          onClick={() => setShowAbout(s => !s)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#daa520',
            fontFamily: '"Crimson Pro", serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <span style={{ transform: showAbout ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>
            <ChevronRight size={18} />
          </span>
          About this Tool
        </button>
        {showAbout && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: 1.7, color: '#c9b998' }}>
            <p style={{ margin: '0 0 0.75rem' }}>
              Interactive geochemistry explorer for UAE hydrogeological consulting. Pick aqueous species, a reaction scenario, and field conditions; AI produces a qualitative reaction analysis tuned to UAE settings (carbonate aquifers, sabkha evaporites, arid recharge).
            </p>
            <h4 style={{ color: '#daa520', margin: '1rem 0 0.5rem', fontFamily: '"Crimson Pro", serif', fontSize: '1.05rem' }}>Element Categories</h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong style={{ color: '#f5e6d3' }}>Hard cations</strong> — Ca, Mg, Na, K, Al. Bind oxygen donors. Drive carbonate, silicate, and clay equilibria.</li>
              <li><strong style={{ color: '#f5e6d3' }}>Heavy metals & redox-active</strong> — Fe, Mn, Cu, Zn, Pb, Cd. Mobility depend on pε, pH, sorbent surfaces.</li>
              <li><strong style={{ color: '#f5e6d3' }}>Anions</strong> — SO₄, CO₃, Cl, NO₃, PO₄. Set salinity, alkalinity, complexation, nutrient load.</li>
            </ul>
            <h4 style={{ color: '#daa520', margin: '1rem 0 0.5rem', fontFamily: '"Crimson Pro", serif', fontSize: '1.05rem' }}>Scenarios</h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong style={{ color: '#f5e6d3' }}>Carbonate Equilibria</strong> — calcite/dolomite dissolution, CO₂ partial pressure controls.</li>
              <li><strong style={{ color: '#f5e6d3' }}>Evaporite Dissolution</strong> — gypsum/anhydrite in sabkha; sulfate and TDS evolution.</li>
              <li><strong style={{ color: '#f5e6d3' }}>Redox Reactions</strong> — Fe/Mn cycling in landfill leachate plumes.</li>
              <li><strong style={{ color: '#f5e6d3' }}>Surface Complexation</strong> — heavy-metal sorption on clays and Fe/Mn oxides.</li>
            </ul>
            <h4 style={{ color: '#daa520', margin: '1rem 0 0.5rem', fontFamily: '"Crimson Pro", serif', fontSize: '1.05rem' }}>Conditions</h4>
            <p style={{ margin: 0 }}>
              Sliders set temperature (25–50 °C), pH (6.5–9.5), salinity (0.5–50 g/L TDS), and pε (−8 to +15). Defaults reflect typical UAE shallow groundwater.
            </p>
            <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#8B7355', fontStyle: 'italic' }}>
              Note: output is qualitative AI analysis, not a substitute for PHREEQC / equilibrium speciation modeling. Verify field decisions with measured data and thermodynamic codes.
            </p>
          </div>
        )}
      </section>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        {/* Left Panel - Element Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '1.5rem',
              margin: '0 0 1rem',
              color: '#daa520'
            }}>
              Select Elements
            </h2>

            {/* Hard Cations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8B7355',
                margin: '0 0 0.75rem',
                fontWeight: 600
              }}>
                Hard Cations (Carbonate Formers)
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.5rem'
              }}>
                {elementsByCategory.hard.map(([key, element]) => (
                  <button
                    key={key}
                    onClick={() => toggleElement(key)}
                    style={{
                      background: selectedElements.includes(key)
                        ? element.color
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${selectedElements.includes(key) ? element.color : 'rgba(139, 115, 85, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '0.75rem 0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: selectedElements.includes(key) ? '#1a1410' : '#f5e6d3'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{element.symbol}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {element.charge}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intermediate/Soft Cations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#B87333',
                margin: '0 0 0.75rem',
                fontWeight: 600
              }}>
                Heavy Metals & Redox-Active
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.5rem'
              }}>
                {[...elementsByCategory.intermediate, ...elementsByCategory.soft].map(([key, element]) => (
                  <button
                    key={key}
                    onClick={() => toggleElement(key)}
                    style={{
                      background: selectedElements.includes(key)
                        ? element.color
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${selectedElements.includes(key) ? element.color : 'rgba(139, 115, 85, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '0.75rem 0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: selectedElements.includes(key) ? '#1a1410' : '#f5e6d3'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{element.symbol}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {element.charge}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Anions */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#87CEEB',
                margin: '0 0 0.75rem',
                fontWeight: 600
              }}>
                Anions & Complexes
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.5rem'
              }}>
                {elementsByCategory.anion.map(([key, element]) => (
                  <button
                    key={key}
                    onClick={() => toggleElement(key)}
                    style={{
                      background: selectedElements.includes(key)
                        ? element.color
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${selectedElements.includes(key) ? element.color : 'rgba(139, 115, 85, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '0.75rem 0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: selectedElements.includes(key) ? '#1a1410' : '#f5e6d3'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedElements.includes(key)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{element.symbol}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {element.charge}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Reaction Scenarios */}
          <section style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '1.5rem',
              margin: '0 0 1rem',
              color: '#daa520'
            }}>
              Reaction Scenario
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reactionScenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  style={{
                    background: selectedScenario === scenario.id
                      ? 'rgba(218, 165, 32, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${selectedScenario === scenario.id ? '#daa520' : 'rgba(139, 115, 85, 0.3)'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    color: '#f5e6d3'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedScenario !== scenario.id) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedScenario !== scenario.id) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <scenario.icon size={20} color="#daa520" />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{scenario.name}</span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: '#c9b998'
                  }}>
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Panel - Conditions and Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Environmental Conditions */}
          <section style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '1.5rem',
              margin: '0 0 1rem',
              color: '#daa520'
            }}>
              UAE Environmental Conditions
            </h2>

            {Object.entries(uaeConditions).map(([key, config]) => (
              <div key={key} style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#c9b998'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>
                    {key === 'pe' ? 'pε (Redox)' : key}
                  </span>
                  <span style={{ color: '#daa520', fontWeight: 600 }}>
                    {conditions[key]} {config.unit}
                  </span>
                </label>
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={key === 'pH' || key === 'pe' ? 0.1 : 1}
                  value={conditions[key]}
                  onChange={(e) => setConditions(prev => ({
                    ...prev,
                    [key]: parseFloat(e.target.value)
                  }))}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(139, 115, 85, 0.3)',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            ))}
          </section>

          {/* Run Analysis Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={!selectedScenario || selectedElements.length === 0 || loading}
            style={{
              background: (!selectedScenario || selectedElements.length === 0 || loading)
                ? 'rgba(139, 115, 85, 0.3)'
                : 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: (!selectedScenario || selectedElements.length === 0 || loading) ? '#6B5B4D' : '#1a1410',
              cursor: (!selectedScenario || selectedElements.length === 0 || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing...
              </>
            ) : (
              <>
                Run Geochemical Analysis
                <ChevronRight size={20} />
              </>
            )}
          </button>

          {/* Analysis Results */}
          {analysis && (
            <section style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(139, 115, 85, 0.3)',
              padding: '1.5rem',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontFamily: '"Crimson Pro", serif',
                fontSize: '1.5rem',
                margin: '0 0 1rem',
                color: '#daa520'
              }}>
                Analysis Results
              </h2>
              <div
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: '#e0d4c3'
                }}
                dangerouslySetInnerHTML={{
                  __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #daa520;">$1</strong>')
                    .replace(/^## (.*?)$/gm, '<h3 style="font-family: \'Crimson Pro\', serif; font-size: 1.25rem; color: #daa520; margin: 1.5rem 0 0.75rem; border-bottom: 1px solid rgba(139, 115, 85, 0.3); padding-bottom: 0.5rem;">$1</h3>')
                    .replace(/^### (.*?)$/gm, '<h4 style="font-size: 1rem; color: #c9b998; margin: 1rem 0 0.5rem; font-weight: 600;">$1</h4>')
                    .replace(/^- (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>')
                    .replace(/\n\n/g, '</p><p style="margin: 1rem 0;">')
                    .replace(/^(.+?)$/gm, '<p style="margin: 0.5rem 0;">$1</p>')
                }}
              />
            </section>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #daa520;
          cursor: pointer;
          border-radius: 50%;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #daa520;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }

        *::-webkit-scrollbar {
          width: 8px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(139, 115, 85, 0.1);
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(139, 115, 85, 0.5);
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 115, 85, 0.7);
        }
      `}</style>
    </div>
  );
}
