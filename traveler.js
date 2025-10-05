class Traveler {
  constructor(map, stops) {
    this.map = map;
    this.stops = stops;
    this.currentIndex = 0;
    this.marker = null;
    this.wobbleAnimation = null;
    
    this.createTravelerIcon();
    this.initializePosition();
    this.startWobbleAnimation();
  }

  createTravelerIcon() {
    const travelerSVG = `<svg width="54" height="54" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#e2b33b"/></filter></defs><g filter="url(#s)"><circle cx="32" cy="32" r="28" fill="#fff7cf" stroke="#f4cc63" stroke-width="3"/><path d="M38 28c6 0 9 5 9 10v6h-8l-2-8" fill="#f9c74f" stroke="#cc8a00" stroke-width="2"/><path d="M26 48l2-10 6-6 6 6-2 10" fill="#ffd166" stroke="#d59a15" stroke-width="2"/><circle cx="32" cy="22" r="6.5" fill="#ffe8b6" stroke="#d59a15" stroke-width="2"/><path d="M28 48l-6 6M36 48l8 6" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/><path d="M42 36l0 16" stroke="#8d6e63" stroke-width="3" stroke-linecap="round"/></g></svg>`;
    
    this.icon = L.divIcon({
      html: `<div class="hiker" style="width:54px;height:54px;transform-origin:50% 90%">${travelerSVG}</div>`,
      className: '',
      iconSize: [54, 54],
      iconAnchor: [27, 48]
    });
  }

  initializePosition() {
    if (this.stops.length > 0) {
      const initialCoords = this.stops[this.currentIndex].coords;
      this.marker = L.marker(initialCoords, {
        icon: this.icon,
        zIndexOffset: 1000
      }).addTo(this.map);
    }
  }

  startWobbleAnimation() {
    let wobble = 0;
    this.wobbleAnimation = setInterval(() => {
      wobble = (wobble + 1) % 200;
      const translateY = Math.sin((wobble / 200) * Math.PI * 2) * 2;
      const hikerElement = document.querySelector('.hiker');
      if (hikerElement) {
        hikerElement.style.transform = `translateY(${translateY}px)`;
      }
    }, 50);
  }

  animateMoveTo(fromCoords, toCoords, duration = 1200) {
    if (!this.marker) return;

    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(1, elapsed / duration);
      
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;

      const currentLat = fromCoords[0] + (toCoords[0] - fromCoords[0]) * easedProgress;
      const currentLng = fromCoords[1] + (toCoords[1] - fromCoords[1]) * easedProgress;

      this.marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  goToStop(stopId) {
    const stopIndex = this.stops.findIndex(stop => stop.id === stopId);
    if (stopIndex === -1) return false;

    const currentPosition = this.marker.getLatLng();
    const targetCoords = this.stops[stopIndex].coords;
    
    this.animateMoveTo([currentPosition.lat, currentPosition.lng], targetCoords, 1200);
    this.currentIndex = stopIndex;
    
    return true;
  }

  goToNextStop() {
    const nextIndex = (this.currentIndex + 1) % this.stops.length;
    const nextStopId = this.stops[nextIndex].id;
    return this.goToStop(nextStopId);
  }

  goToPreviousStop() {
    const prevIndex = (this.currentIndex - 1 + this.stops.length) % this.stops.length;
    const prevStopId = this.stops[prevIndex].id;
    return this.goToStop(prevStopId);
  }

  getCurrentStop() {
    return this.stops[this.currentIndex];
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  destroy() {
    if (this.wobbleAnimation) {
      clearInterval(this.wobbleAnimation);
      this.wobbleAnimation = null;
    }
    
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }
}

window.Traveler = Traveler;