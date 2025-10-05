class MapManager {
  constructor(elementId) {
    this.elementId = elementId;
    this.map = null;
    this.markers = null;
    this.spiderLayer = null;
    this.allMarkers = [];
    this.spiderState = null;
    this.borderLayer = null;
    
    this.initializeMap();
    this.initializeMarkerLayers();
  }

  initializeMap() {
    this.map = L.map(this.elementId, {
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      touchZoom: true,
      zoomControl: true
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    setTimeout(() => {
      if (tileLayer.getContainer()) {
        tileLayer.getContainer().style.filter = 'sepia(.6) saturate(1.25) contrast(1.05) hue-rotate(340deg) brightness(1.06)';
      }
    }, 100);

    this.map.on('zoomstart', () => this.unspiderfy());
    this.map.on('click', () => this.unspiderfy());
  }

  initializeMarkerLayers() {
    this.markers = L.layerGroup().addTo(this.map);
    this.spiderLayer = L.layerGroup().addTo(this.map);
  }

  async loadBoundary() {
    const krasnoyarskFallback = {
      "type": "Feature",
      "properties": { "name": "Красноярский край" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[82.50,73.20],[83.20,73.50],[84.50,73.80],[86.00,74.00],[87.30,74.10],[88.50,74.30],
            [90.00,74.60],[92.00,75.00],[94.00,75.40],[95.00,75.80],[96.50,76.00],[98.00,76.20],
            [100.00,76.80],[102.50,77.00],[104.30,77.72],[106.00,77.20],[108.00,76.50],[109.20,75.50],
            [110.00,74.50],[111.00,73.00],[112.00,71.50],[113.00,70.00],[113.00,68.00],[112.80,66.00],
            [112.50,64.00],[112.00,62.00],[111.50,60.50],[111.00,59.00],[110.20,57.50],[109.50,56.00],
            [108.80,54.50],[108.00,53.00],[107.00,52.00],[106.00,51.50],[105.00,51.30],[104.00,51.20],
            [102.50,51.00],[100.50,50.80],[98.50,50.60],[96.50,50.50],[94.50,50.40],[93.25,50.75],
            [92.00,51.20],[90.50,51.80],[89.00,52.50],[87.50,53.20],[86.00,53.80],[84.50,54.50],
            [83.00,55.50],[82.00,57.00],[81.20,58.50],[80.50,60.00],[80.00,61.50],[79.50,63.00],
            [79.20,64.50],[79.00,66.00],[78.80,67.50],[78.50,69.00],[78.30,70.50],[78.00,72.00],
            [78.20,73.00],[79.00,73.50],[80.50,73.30],[82.50,73.20]]]
        ]
      }
    };

    try {
      const response = await fetch('https://www.geoboundaries.org/api/current/gbOpen/RUS/ADM1/');
      if (!response.ok) throw new Error();
      
      const index = await response.json();
      const item = index.find(i => (i.shapeName || '').toLowerCase().includes('krasnoyar'));
      if (!item) throw new Error();
      
      const url = item.gjDownloadURL || item.gjDownload || item.downloadURL;
      const geoJson = await (await fetch(url)).json();
      
      return geoJson.type === 'Feature' 
        ? geoJson 
        : (geoJson.features?.find(f => (f.properties?.shapeName || '').toLowerCase().includes('krasnoyar')) || geoJson.features[0]);
    } catch {
      return krasnoyarskFallback;
    }
  }

  filterNorthernIslands(feature, cutoffLat = 78) {
    const centroid = (coords) => {
      const flat = Array.isArray(coords[0][0]) ? coords.flat() : coords;
      let sumLat = 0, sumLng = 0;
      flat.forEach(([lng, lat]) => { sumLat += lat; sumLng += lng; });
      const n = flat.length || 1;
      return [sumLng / n, sumLat / n];
    };

    const keepPolygon = (poly) => {
      const [, lat] = centroid(poly[0]);
      return lat < cutoffLat;
    };

    const f = feature.type === 'Feature' ? feature : { type: 'Feature', properties: {}, geometry: feature };
    
    if (f.geometry.type === 'MultiPolygon') {
      const kept = f.geometry.coordinates.filter(keepPolygon);
      return kept.length ? { ...f, geometry: { type: 'MultiPolygon', coordinates: kept } } : null;
    }
    
    if (f.geometry.type === 'Polygon') {
      return keepPolygon(f.geometry.coordinates) ? f : null;
    }
    
    return f;
  }

  async addBoundary() {
    let feature;
    try {
      feature = await this.loadBoundary();
    } catch (e) {
      feature = await this.loadBoundary();
    }
    
    const mainland = this.filterNorthernIslands(feature, 78.0) || feature;
    
    this.borderLayer = L.geoJSON(mainland, {
      style: {
        color: '#cc8a00',
        weight: 2.5,
        opacity: 0.85,
        dashArray: '10 6',
        fill: true,
        fillColor: '#ffe89e',
        fillOpacity: 0.12,
        lineJoin: 'round'
      }
    }).addTo(this.map);

    const bounds = this.borderLayer.getBounds().pad(0.05);
    this.map.fitBounds(bounds);
    
    // Store the initial zoom level and prevent zoom out
    setTimeout(() => {
      const initialZoom = this.map.getZoom();
      this.initialZoom = initialZoom;
      this.map.setMinZoom(initialZoom);
      this.map.setMaxZoom(18);
      this.map.setMaxBounds(bounds);
      
      // Force zoom back if user tries to zoom out
      this.map.on('zoom', () => {
        if (this.map.getZoom() < this.initialZoom) {
          this.map.setZoom(this.initialZoom);
        }
      });
    }, 100);
  }

  createMarkerIcon(emoji) {
    const iconHTML = `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;background:linear-gradient(#ffe07a,#ffd14a);border:2px solid #f4cc63;box-shadow:2px 2px 0 #e2b33b;font-size:20px">${emoji}</div>`;
    return L.divIcon({
      html: iconHTML,
      className: '',
      iconSize: [38, 38],
      iconAnchor: [19, 34],
      popupAnchor: [0, -18]
    });
  }

  addMarkers(stops, collected, onMarkerClick, onCollect) {
    this.clearMarkers();
    
    stops.forEach(stop => {
      const isCollected = collected.has(stop.id);
      const popupHTML = `<div class="popup">
        <h3>${stop.title}</h3>
        <img src="${stop.img}" alt="${stop.title}">
        <p>${stop.desc}</p>
        <div style="height:2px;background:#f4cc63;margin:8px 0"></div>
        <button class="btn" onclick="window.collect('${stop.id}',this)" ${isCollected ? 'disabled' : ''}>${isCollected ? 'Печать получена ✔' : 'Забрать печать'}</button>
        <small>Клик по маркеру или карточке — путник пойдёт сюда.</small>
      </div>`;

      const marker = L.marker(stop.coords, {
        icon: this.createMarkerIcon(stop.title[0])
      }).bindPopup(popupHTML, { maxWidth: 260 });

      marker.stopId = stop.id;
      marker.on('click', () => this.handleMarkerClick(marker, onMarkerClick));
      
      this.markers.addLayer(marker);
      this.allMarkers.push(marker);
    });

    window.collect = onCollect;
  }

  handleMarkerClick(marker, onMarkerClick) {
    onMarkerClick(marker.stopId);
    marker.openPopup();
  }

  getOverlappingGroup(refMarker, tolerancePixels) {
    const refPoint = this.map.latLngToLayerPoint(refMarker.getLatLng());
    
    return this.allMarkers.filter(marker => {
      const point = this.map.latLngToLayerPoint(marker.getLatLng());
      return Math.hypot(point.x - refPoint.x, point.y - refPoint.y) <= tolerancePixels;
    });
  }

  spiderfy(group, center, onMarkerClick) {
    this.unspiderfy();
    
    const centerPoint = this.map.latLngToLayerPoint(center);
    const groupSize = group.length;
    const radius = Math.max(50, Math.min(90, 35 + 8 * groupSize));
    const angleStep = (2 * Math.PI) / groupSize;

    const tempMarkers = [];
    const legs = [];

    group.forEach((marker, index) => {
      const angle = index * angleStep;
      const spiderPoint = L.point(
        centerPoint.x + radius * Math.cos(angle),
        centerPoint.y + radius * Math.sin(angle)
      );
      const spiderLatLng = this.map.layerPointToLatLng(spiderPoint);

      const leg = L.polyline([center, spiderLatLng], {
        weight: 3,
        color: '#f4cc63',
        opacity: 0.9,
        dashArray: '5, 5'
      });

      const tempMarker = L.marker(spiderLatLng, {
        icon: marker.options.icon,
        zIndexOffset: 3000
      });

      tempMarker.on('click', () => {
        this.unspiderfy();
        onMarkerClick(marker.stopId);
        marker.openPopup();
      });

      this.spiderLayer.addLayer(leg);
      this.spiderLayer.addLayer(tempMarker);
      
      legs.push(leg);
      tempMarkers.push(tempMarker);
      marker.setOpacity(0);
    });

    this.spiderState = {
      originals: group,
      tempMarkers: tempMarkers,
      legs: legs
    };
  }

  unspiderfy() {
    if (!this.spiderState) return;

    this.spiderLayer.clearLayers();
    this.spiderState.originals.forEach(marker => marker.setOpacity(1));
    this.spiderState = null;
  }

  clearMarkers() {
    this.markers.clearLayers();
    this.spiderLayer.clearLayers();
    this.allMarkers.length = 0;
    this.unspiderfy();
  }

  getMap() {
    return this.map;
  }

  invalidateSize() {
    this.map.invalidateSize();
  }

  destroy() {
    if (this.borderLayer) {
      this.map.removeLayer(this.borderLayer);
    }
    
    this.clearMarkers();
    
    if (this.markers) {
      this.map.removeLayer(this.markers);
    }
    
    if (this.spiderLayer) {
      this.map.removeLayer(this.spiderLayer);
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

window.MapManager = MapManager;