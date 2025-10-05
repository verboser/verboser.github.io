# Секреты Енисея - Interactive Travel Map

## Project Overview

This is an interactive web application for exploring tourist attractions along the Yenisei River in Krasnoyarsk Krai, Russia. The project presents a guided journey from south to north, featuring 12 significant locations with a gamified stamp collection system.

## Project Structure

```
/
├── index.html              # Main application with guided journey system
├── index_new.html          # Legacy modular version (unused)
├── styles.css              # Complete stylesheet for main application
├── data.json              # Location data for stops
├── map.js                 # Map management class
├── landscape.js           # Landscape visualization class
├── traveler.js           # Traveler character animation class
├── ui.js                 # UI management class
├── storage.js            # LocalStorage management class
├── .vscode/              # VS Code configuration
│   └── settings.json     # Git limit warning disabled
└── venv/                 # Python virtual environment (unused for this JS project)
```

## Architecture

### Two Implementations

1. **Monolithic Version** (`index.html`)
   - Self-contained HTML with embedded JavaScript
   - Traditional sidebar layout
   - Complete implementation with all features

2. **Modular Version** (`index_new.html`)
   - Uses separate JavaScript class files
   - Fullscreen map with overlay slider
   - More modern UI approach

### Core Components

#### 1. MapManager (`map.js`)
- **Purpose**: Manages Leaflet map instance and marker interactions
- **Key Features**:
  - Dynamic boundary loading from GeoBoundaries API
  - Spiderfy clustering for overlapping markers
  - Custom marker icons with emoji styling
  - Zoom restrictions and boundary enforcement

#### 2. Landscape (`landscape.js`)
- **Purpose**: Adds visual landscape elements to the map
- **Features**:
  - SVG pattern definitions for terrain types
  - Layered pane system for depth rendering
  - Currently contains framework but no active landscape elements

#### 3. Traveler (`traveler.js`)
- **Purpose**: Manages the animated traveler character
- **Features**:
  - Smooth movement animations between locations
  - Wobble animation for character liveliness
  - Position tracking and navigation methods

#### 4. UIManager (`ui.js`)
- **Purpose**: Handles all user interface interactions
- **Features**:
  - Stamp collection system
  - Progress tracking and visualization
  - Navigation controls
  - Import/export functionality
  - Notification system

#### 5. Storage (`storage.js`)
- **Purpose**: Manages data persistence via localStorage
- **Features**:
  - Stamp collection persistence
  - Error handling for storage failures
  - Clean API for data operations

## Data Structure

### Location Data (`data.json`)
Each stop contains:
- `id`: Unique identifier
- `title`: Display name with emoji
- `coords`: [latitude, longitude]
- `desc`: Description text
- `img`: Placeholder image URL

### Travel Route (South to North)
1. 🏡 Шушенское - Ethnographic village
2. 🏔️ Столбы - Nature reserve with rock formations
3. ⚡ Красноярская ГЭС - Hydroelectric dam
4. ⛪ Караульная гора - Lookout mountain with chapel
5. 🖼️ Дом-музей Сурикова - Surikov house museum
6. 🏘️ Канск - Historic city
7. 🏛️ Енисейск - Merchant city
8. 📍 Озеро Виви - Geographic center of Russia
9. 🌋 Плато Путорана - Volcanic plateau
10. ⚓ Дудинка - Arctic port
11. 🏭 Норильск - Arctic industrial city
12. 🦌 Таймырский заповедник - Taimyr nature reserve

## Technical Features

### Map Technology
- **Leaflet.js**: Primary mapping library
- **OpenStreetMap**: Tile provider with custom sepia filter
- **GeoBoundaries API**: Dynamic region boundary loading
- **Custom SVG Renderer**: For landscape patterns and effects

### Game Mechanics
- **Sequential Progression**: Guided journey system
- **Stamp Collection**: Gamified achievement tracking
- **Progress Visualization**: Real-time progress indicators
- **Local Persistence**: Progress saved between sessions

### UI/UX Features
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: CSS and JavaScript transitions
- **Welcome Screen**: Onboarding experience
- **Visual Feedback**: Hover states and interactive elements

## Development Notes

### Code Quality
- **Modular Architecture**: Separated concerns into classes
- **Error Handling**: Graceful fallbacks for API failures
- **Performance**: Efficient marker clustering and animation
- **Accessibility**: Keyboard navigation support

### Browser Compatibility
- **Modern Browsers**: Uses ES6+ features
- **LocalStorage**: Required for progress saving
- **CSS Grid/Flexbox**: Modern layout techniques

### External Dependencies
- Leaflet.js (v1.9.4)
- Google Fonts (Nunito, Fredoka)
- GeoBoundaries API (with fallback data)

## Usage Instructions

### For Development
1. Serve files via HTTP server (required for API calls)
2. Open `index.html` for monolithic version
3. Open `index_new.html` for modular version

### For Users
1. Click "Начать путешествие" to begin
2. Navigate using sidebar buttons or map markers
3. Collect stamps at each location
4. Progress is automatically saved

## Configuration

### Map Settings
- Initial view: Krasnoyarsk Krai region
- Zoom restrictions: Prevents excessive zoom out
- Boundary enforcement: Keeps view within region

### Visual Customization
- Color scheme defined in CSS custom properties
- Easily modifiable via `--sand`, `--paper`, `--ink` variables
- Icon styling customizable in marker creation functions

## Future Enhancement Opportunities

1. **Landscape Activation**: Enable the landscape visualization system
2. **Mobile Optimization**: Touch gesture improvements
3. **Content Management**: Admin interface for location data
4. **Social Features**: Progress sharing capabilities
5. **Multilingual Support**: Translation system
6. **Audio Guides**: Voice narration for locations
7. **Offline Support**: Service worker implementation

## Browser Requirements

- Modern browser with ES6+ support
- JavaScript enabled
- LocalStorage support
- Internet connection for map tiles and boundaries

## License and Attribution

- Map data: © OpenStreetMap contributors
- Boundaries: GeoBoundaries.org
- Fonts: Google Fonts (Open Font License)