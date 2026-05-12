import React, { useState } from 'react';
import UAEGeochemExplorer from './UAEGeochemExplorer';
import GeochemBuffering from './GeochemBuffering';
import './App.css';

function App() {
  const [view, setView] = useState('explorer'); // 'explorer' | 'buffering'

  return (
    <div className="App">
      {view === 'explorer' && (
        <UAEGeochemExplorer onOpenBuffering={() => setView('buffering')} />
      )}
      {view === 'buffering' && (
        <GeochemBuffering onBack={() => setView('explorer')} />
      )}
    </div>
  );
}

export default App;
