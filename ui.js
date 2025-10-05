class UIManager {
  constructor(storage, onStopSelect) {
    this.storage = storage;
    this.onStopSelect = onStopSelect;
    this.stops = [];
    
    this.stampGridElement = document.getElementById('stampGrid');
    this.progressBarElement = document.getElementById('progressBar');
    this.listElement = document.getElementById('list');
    
    this.bindControlEvents();
  }

  bindControlEvents() {
    window.nextStop = () => {
      if (this.onNextStop) this.onNextStop();
    };
    
    window.prevStop = () => {
      if (this.onPrevStop) this.onPrevStop();
    };
    
    window.goToStop = (stopId) => {
      if (this.onStopSelect) this.onStopSelect(stopId);
    };
    
    window.collect = (stopId, buttonElement) => {
      this.collectStamp(stopId, buttonElement);
    };
  }

  setNavigationCallbacks(onNext, onPrev) {
    this.onNextStop = onNext;
    this.onPrevStop = onPrev;
  }

  setStops(stops) {
    this.stops = stops;
  }

  collectStamp(stopId, buttonElement = null) {
    const collected = this.storage.getCollectedStamps();
    
    if (collected.has(stopId)) {
      return false;
    }

    const success = this.storage.addStamp(stopId);
    
    if (success) {
      if (buttonElement) {
        buttonElement.textContent = 'Печать получена ✔';
        buttonElement.disabled = true;
      }
      
      this.updateAllUI();
      return true;
    }
    
    return false;
  }

  updateAllUI() {
    this.updateStampGrid();
    this.updateProgressBar();
    this.updateStopsList();
  }

  updateStampGrid() {
    if (!this.stampGridElement) return;
    
    const collected = this.storage.getCollectedStamps();
    
    this.stampGridElement.innerHTML = this.stops.map(stop => {
      const isCollected = collected.has(stop.id);
      const stampClass = isCollected ? 'stamp collected' : 'stamp';
      return `<div class="${stampClass}" title="${stop.title}">${stop.title[0]}</div>`;
    }).join('');
  }

  updateProgressBar() {
    if (!this.progressBarElement) return;
    
    const collected = this.storage.getCollectedStamps();
    const progressPercentage = (collected.size / this.stops.length) * 100;
    
    this.progressBarElement.style.width = `${progressPercentage}%`;
  }

  updateStopsList() {
    if (!this.listElement) return;
    
    const collected = this.storage.getCollectedStamps();
    
    this.listElement.innerHTML = this.stops.map(stop => {
      const isCollected = collected.has(stop.id);
      const checkmark = isCollected ? '✅' : '';
      
      return `
        <div class="card" onclick="goToStop('${stop.id}')">
          <img src="${stop.img}" alt="${stop.title}">
          <div>
            <h3>${stop.title} ${checkmark}</h3>
            <p>${stop.desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  getCollectedStamps() {
    return this.storage.getCollectedStamps();
  }

  getProgressData() {
    const collected = this.storage.getCollectedStamps();
    return {
      collected: collected.size,
      total: this.stops.length,
      percentage: (collected.size / this.stops.length) * 100
    };
  }

  clearProgress() {
    const success = this.storage.clearAllStamps();
    if (success) {
      this.updateAllUI();
    }
    return success;
  }

  exportProgress() {
    const collected = this.storage.getCollectedStamps();
    const progressData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collected: [...collected],
      total: this.stops.length
    };
    
    return JSON.stringify(progressData, null, 2);
  }

  importProgress(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.collected || !Array.isArray(data.collected)) {
        throw new Error('Invalid progress data format');
      }

      this.storage.clearAllStamps();
      
      data.collected.forEach(stampId => {
        this.storage.addStamp(stampId);
      });
      
      this.updateAllUI();
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return false;
    }
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' && this.onPrevStop) {
        event.preventDefault();
        this.onPrevStop();
      } else if (event.key === 'ArrowRight' && this.onNextStop) {
        event.preventDefault();
        this.onNextStop();
      }
    });

    window.addEventListener('resize', () => {
      if (this.onResize) this.onResize();
    });
  }

  setResizeCallback(callback) {
    this.onResize = callback;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: inherit;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  destroy() {
    window.nextStop = null;
    window.prevStop = null;
    window.goToStop = null;
    window.collect = null;
  }
}

window.UIManager = UIManager;