class Landscape {
  constructor(map) {
    this.map = map;
    this.svgRenderer = null;
    this.layers = {};
    
    this.initializeSVGRenderer();
    this.createMapPanes();
    this.initializeLayers();
  }

  initializeSVGRenderer() {
    this.svgRenderer = L.svg({ padding: 0 }).addTo(this.map);
    this.addSVGDefinitions();
  }

  addSVGDefinitions() {
    const addDefs = () => {
      const svg = this.svgRenderer._container;
      if (!svg) {
        this.map.once('layeradd', addDefs);
        return;
      }
      
      if (svg.querySelector('#landscape-defs')) return;

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.setAttribute('id', 'landscape-defs');
      defs.innerHTML = `
        <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5dade2" stop-opacity="1"/>
          <stop offset="50%" stop-color="#3498db" stop-opacity="1"/>
          <stop offset="100%" stop-color="#2980b9" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="lakeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#85c1e9" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#2980b9" stop-opacity="0.9"/>
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dropShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="#34495e" flood-opacity="0.3"/>
        </filter>
        
        <!-- Cartoon-style patterns -->
        <pattern id="meadowPattern" patternUnits="userSpaceOnUse" width="25" height="25">
          <rect width="25" height="25" fill="#a8e6cf"/>
          <!-- Cartoon flowers -->
          <circle cx="8" cy="8" r="2" fill="#f8c471"/>
          <circle cx="8" cy="8" r="1" fill="#f39c12"/>
          <circle cx="17" cy="15" r="1.5" fill="#e74c3c"/>
          <circle cx="17" cy="15" r="0.8" fill="#c0392b"/>
          <circle cx="5" cy="20" r="1.8" fill="#9b59b6"/>
          <circle cx="5" cy="20" r="0.9" fill="#8e44ad"/>
          <!-- Grass blades -->
          <path d="M12 22 Q13 20 12 18" stroke="#27ae60" stroke-width="1" fill="none"/>
          <path d="M20 10 Q21 8 20 6" stroke="#27ae60" stroke-width="1" fill="none"/>
          <path d="M3 12 Q4 10 3 8" stroke="#27ae60" stroke-width="1" fill="none"/>
        </pattern>
        
        <pattern id="forestPattern" patternUnits="userSpaceOnUse" width="30" height="30">
          <rect width="30" height="30" fill="#52c4a0"/>
          <!-- Cartoon trees -->
          <g transform="translate(8,8)">
            <rect x="5" y="10" width="2" height="6" fill="#8b4513"/>
            <circle cx="6" cy="8" r="4" fill="#27ae60"/>
            <circle cx="4" cy="6" r="2.5" fill="#2ecc71"/>
            <circle cx="8" cy="6" r="2.5" fill="#2ecc71"/>
          </g>
          <g transform="translate(20,15)">
            <rect x="4" y="8" width="1.5" height="4" fill="#8b4513"/>
            <circle cx="4.75" cy="6" r="3" fill="#27ae60"/>
            <circle cx="3" cy="4" r="2" fill="#2ecc71"/>
            <circle cx="6.5" cy="4" r="2" fill="#2ecc71"/>
          </g>
        </pattern>
        
        <pattern id="taigaPattern" patternUnits="userSpaceOnUse" width="35" height="35">
          <rect width="35" height="35" fill="#7fb3d3"/>
          <!-- Conifer trees -->
          <g transform="translate(10,10)">
            <rect x="6" y="12" width="1.5" height="4" fill="#654321"/>
            <polygon points="6.75,3 3,12 10.5,12" fill="#1e8449"/>
            <polygon points="6.75,6 4,13 9.5,13" fill="#229954"/>
          </g>
          <g transform="translate(25,20)">
            <rect x="5" y="10" width="1" height="3" fill="#654321"/>
            <polygon points="5.5,2 2.5,10 8.5,10" fill="#1e8449"/>
            <polygon points="5.5,5 3.5,11 7.5,11" fill="#229954"/>
          </g>
          <!-- Snow patches -->
          <circle cx="5" cy="5" r="1.5" fill="#ecf0f1" opacity="0.7"/>
          <circle cx="30" cy="8" r="1" fill="#ecf0f1" opacity="0.7"/>
        </pattern>
        
        <pattern id="fieldsPattern" patternUnits="userSpaceOnUse" width="40" height="40">
          <rect width="40" height="40" fill="#f4d03f"/>
          <!-- Field rows -->
          <rect x="0" y="5" width="40" height="3" fill="#f1c40f"/>
          <rect x="0" y="12" width="40" height="3" fill="#f39c12"/>
          <rect x="0" y="19" width="40" height="3" fill="#f1c40f"/>
          <rect x="0" y="26" width="40" height="3" fill="#f39c12"/>
          <rect x="0" y="33" width="40" height="3" fill="#f1c40f"/>
          <!-- Crop details -->
          <circle cx="8" cy="8" r="1" fill="#e67e22"/>
          <circle cx="15" cy="15" r="1" fill="#e67e22"/>
          <circle cx="25" cy="22" r="1" fill="#e67e22"/>
          <circle cx="32" cy="29" r="1" fill="#e67e22"/>
        </pattern>
        
        <pattern id="mountainPattern" patternUnits="userSpaceOnUse" width="50" height="50">
          <rect width="50" height="50" fill="#85929e"/>
          <!-- Rock texture -->
          <circle cx="10" cy="15" r="3" fill="#5d6d7e" opacity="0.6"/>
          <circle cx="35" cy="25" r="4" fill="#5d6d7e" opacity="0.6"/>
          <circle cx="20" cy="35" r="2.5" fill="#5d6d7e" opacity="0.6"/>
          <!-- Snow caps -->
          <polygon points="15,5 10,15 20,15" fill="#ecf0f1"/>
          <polygon points="40,8 35,18 45,18" fill="#ecf0f1"/>
        </pattern>
      `;
      svg.insertBefore(defs, svg.firstChild);
    };
    
    addDefs();
  }

  createMapPanes() {
    const panes = [
      { name: 'pane-fields', zIndex: 190 },
      { name: 'pane-taiga', zIndex: 200 },
      { name: 'pane-meadows', zIndex: 210 },
      { name: 'pane-forests', zIndex: 220 },
      { name: 'pane-lakes', zIndex: 225 },
      { name: 'pane-mountains', zIndex: 230 },
      { name: 'pane-rivers-back', zIndex: 240 },
      { name: 'pane-rivers', zIndex: 241 }
    ];

    panes.forEach(pane => {
      this.map.createPane(pane.name);
      this.map.getPane(pane.name).style.zIndex = pane.zIndex;
    });
  }

  initializeLayers() {
    this.layers = {
      fields: L.layerGroup({ pane: 'pane-fields' }).addTo(this.map),
      taiga: L.layerGroup({ pane: 'pane-taiga' }).addTo(this.map),
      meadows: L.layerGroup({ pane: 'pane-meadows' }).addTo(this.map),
      forests: L.layerGroup({ pane: 'pane-forests' }).addTo(this.map),
      lakes: L.layerGroup({ pane: 'pane-lakes' }).addTo(this.map),
      mountains: L.layerGroup({ pane: 'pane-mountains' }).addTo(this.map),
      riversBack: L.layerGroup({ pane: 'pane-rivers-back' }).addTo(this.map),
      rivers: L.layerGroup({ pane: 'pane-rivers' }).addTo(this.map)
    };

    this.addFields();
    this.addTaigaRegions();
    this.addMeadows();
    this.addForests();
    this.addLakes();
    this.addMountains();
    this.addRivers();
  }

  addFields() {
    // No fields
  }

  addTaigaRegions() {
    // No taiga
  }

  addMeadows() {
    // No meadows
  }

  addForests() {
    // No forests
  }

  addLakes() {
    // No lakes
  }

  addMountains() {
    // No mountains
  }

  addRivers() {
    // No rivers
  }

  destroy() {
    Object.values(this.layers).forEach(layer => {
      if (layer) this.map.removeLayer(layer);
    });
    
    if (this.svgRenderer) {
      this.map.removeLayer(this.svgRenderer);
    }
  }
}

window.Landscape = Landscape;