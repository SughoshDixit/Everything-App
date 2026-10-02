/**
 * Google Maps Photorealistic Video & Canvas Rendering Engine
 * Implements:
 * 1. True Web Mercator (EPSG:3857) projection math matching Google Maps pixel-for-pixel.
 * 2. High-resolution Google Maps Hybrid (satellite + streets), Pure Satellite, Roadmap, and Terrain tiles.
 * 3. Preloader & Memory Cache for smooth 60 FPS video recording without blank tile pop-in.
 * 4. Dynamic Camera Follow-Cam (Drone tracking) and Overview framing.
 * 5. Google Maps Navigation Puck (pulsing radar beacon + directional navigation arrow).
 * 6. High-voltage glowing neon trajectory path with multi-tier Gaussian bloom.
 */

export type GoogleMapLayerType = 'hybrid' | 'satellite' | 'roadmap' | 'terrain' | 'dark';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Global in-memory cache for decoded tile images
const globalTileCache = new Map<string, HTMLImageElement>();

/**
 * Converts WGS84 Latitude and Longitude to Web Mercator World Coordinates (pixels at zoom level)
 */
export function latLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.min(Math.max(sinLat, -0.9999), 0.9999);
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

/**
 * Converts Web Mercator World Coordinates back to WGS84 Latitude and Longitude
 */
export function worldToLatLng(x: number, y: number, zoom: number): LatLng {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

/**
 * Returns the tile indices { tileX, tileY } for a given lat/lng and zoom level
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { tileX: number; tileY: number } {
  const world = latLngToWorld(lat, lng, zoom);
  return {
    tileX: Math.floor(world.x / 256),
    tileY: Math.floor(world.y / 256)
  };
}

/**
 * Returns Google Maps tile URL for a given tile coordinate and layer type
 */
export function getGoogleTileUrl(tileX: number, tileY: number, zoom: number, layer: GoogleMapLayerType): string {
  const maxTile = Math.pow(2, zoom);
  const normalizedX = ((tileX % maxTile) + maxTile) % maxTile;
  const normalizedY = Math.max(0, Math.min(maxTile - 1, tileY));
  const server = Math.abs((normalizedX + normalizedY) % 4);

  switch (layer) {
    case 'hybrid':
      // Google Hybrid: photorealistic satellite imagery + roads + street names
      return `https://mt${server}.google.com/vt/lyrs=y&x=${normalizedX}&y=${normalizedY}&z=${zoom}`;
    case 'satellite':
      // Google Pure Satellite: crisp aerial photography
      return `https://mt${server}.google.com/vt/lyrs=s&x=${normalizedX}&y=${normalizedY}&z=${zoom}`;
    case 'roadmap':
      // Google Clean Vector Roadmap
      return `https://mt${server}.google.com/vt/lyrs=m&x=${normalizedX}&y=${normalizedY}&z=${zoom}`;
    case 'terrain':
      // Google Shaded Relief Terrain with contour elevation
      return `https://mt${server}.google.com/vt/lyrs=p&x=${normalizedX}&y=${normalizedY}&z=${zoom}`;
    case 'dark':
      // CartoDB Dark Matter for OLED dark athletic theme
      return `https://cartodb-basemaps-${['a', 'b', 'c', 'd'][server]}.global.ssl.fastly.net/dark_all/${zoom}/${normalizedX}/${normalizedY}.png`;
    default:
      return `https://mt${server}.google.com/vt/lyrs=y&x=${normalizedX}&y=${normalizedY}&z=${zoom}`;
  }
}

/**
 * Computes optimal zoom level to fit a bounding box within canvas dimensions
 */
export function computeOptimalZoom(
  bounds: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 80
): number {
  const usableWidth = Math.max(100, canvasWidth - padding * 2);
  const usableHeight = Math.max(100, canvasHeight - padding * 2);

  for (let z = 19; z >= 10; z--) {
    const sw = latLngToWorld(bounds.minLat, bounds.minLng, z);
    const ne = latLngToWorld(bounds.maxLat, bounds.maxLng, z);
    const pixelWidth = Math.abs(ne.x - sw.x);
    const pixelHeight = Math.abs(sw.y - ne.y);

    if (pixelWidth <= usableWidth && pixelHeight <= usableHeight) {
      return z;
    }
  }
  return 13;
}

/**
 * Preloads Google Maps tiles covering a bounding box or center radius into memory
 */
export async function preloadGoogleMapTiles(
  bounds: BoundingBox,
  zoom: number,
  layer: GoogleMapLayerType,
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, HTMLImageElement>> {
  const minTile = latLngToTile(bounds.maxLat, bounds.minLng, zoom);
  const maxTile = latLngToTile(bounds.minLat, bounds.maxLng, zoom);

  const startX = minTile.tileX - 1;
  const endX = maxTile.tileX + 1;
  const startY = minTile.tileY - 1;
  const endY = maxTile.tileY + 1;

  const total = (endX - startX + 1) * (endY - startY + 1);
  let loaded = 0;

  const promises: Promise<void>[] = [];

  for (let tx = startX; tx <= endX; tx++) {
    for (let ty = startY; ty <= endY; ty++) {
      const key = `${layer}_${zoom}_${tx}_${ty}`;
      if (globalTileCache.has(key)) {
        loaded++;
        onProgress?.(loaded, total);
        continue;
      }

      const url = getGoogleTileUrl(tx, ty, zoom, layer);
      const p = new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          globalTileCache.set(key, img);
          loaded++;
          onProgress?.(loaded, total);
          resolve();
        };
        img.onerror = () => {
          // If a tile errors, resolve anyway to avoid hanging
          loaded++;
          onProgress?.(loaded, total);
          resolve();
        };
        img.src = url;
      });
      promises.push(p);
    }
  }

  await Promise.all(promises);
  return globalTileCache;
}

/**
 * Renders Google Maps tiles onto a Canvas with pixel-perfect Web Mercator projection.
 * Supports follow-cam (centered on runner) or overview framing.
 */
export function renderGoogleMapToCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number;
    height: number;
    centerLat: number;
    centerLng: number;
    zoom: number;
    layer: GoogleMapLayerType;
    scrimIntensity?: number; // 0.0 to 0.8
  }
): void {
  const { width, height, centerLat, centerLng, zoom, layer, scrimIntensity = 0.15 } = options;

  // Center point in world coordinates
  const centerWorld = latLngToWorld(centerLat, centerLng, zoom);

  // Top-left corner of canvas in world coordinates
  const canvasOriginX = centerWorld.x - width / 2;
  const canvasOriginY = centerWorld.y - height / 2;

  // Tile index bounds intersecting the canvas
  const startTileX = Math.floor(canvasOriginX / 256);
  const endTileX = Math.floor((canvasOriginX + width) / 256);
  const startTileY = Math.floor(canvasOriginY / 256);
  const endTileY = Math.floor((canvasOriginY + height) / 256);

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  // Clear background with deep Google Dark or Satellite tone
  ctx.fillStyle = layer === 'dark' ? '#090d16' : '#0a1420';
  ctx.fillRect(0, 0, width, height);

  // Draw tiles
  for (let tx = startTileX; tx <= endTileX; tx++) {
    for (let ty = startTileY; ty <= endTileY; ty++) {
      const tileWorldX = tx * 256;
      const tileWorldY = ty * 256;

      const screenX = tileWorldX - canvasOriginX;
      const screenY = tileWorldY - canvasOriginY;

      const key = `${layer}_${zoom}_${tx}_${ty}`;
      let img = globalTileCache.get(key);

      if (!img) {
        // Trigger background load for future frames
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        newImg.src = getGoogleTileUrl(tx, ty, zoom, layer);
        newImg.onload = () => {
          globalTileCache.set(key, newImg);
        };
        globalTileCache.set(key, newImg);
        img = newImg;
      }

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, screenX, screenY, 256, 256);
      }
    }
  }

  // Atmospheric dark scrim / contrast enhancer so glowing routes and HUD pop
  if (scrimIntensity > 0) {
    ctx.fillStyle = `rgba(8, 11, 17, ${scrimIntensity})`;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Projects a GPS coordinate into canvas screen space (pixels) given the camera center & zoom
 */
export function projectLatLngToScreen(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const pointWorld = latLngToWorld(lat, lng, zoom);
  const centerWorld = latLngToWorld(centerLat, centerLng, zoom);
  return {
    x: pointWorld.x - centerWorld.x + canvasWidth / 2,
    y: pointWorld.y - centerWorld.y + canvasHeight / 2
  };
}

/**
 * Draws the authentic Google Maps Navigation Puck:
 * Pulsing concentric radar rings + Directional Navigation Chevron Arrow
 */
export function drawGoogleNavigationPuck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  headingRad: number,
  scale: number = 1.0,
  accentColor: string = '#00f5d4'
): void {
  ctx.save();
  ctx.translate(x, y);

  // 1. Radar pulse ring
  const pulsePhase = (Date.now() % 1400) / 1400;
  const pulseRadius = (16 + pulsePhase * 18) * scale;
  const pulseAlpha = Math.max(0, 1 - pulsePhase) * 0.45;

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5 * scale;
  ctx.globalAlpha = pulseAlpha;
  ctx.beginPath();
  ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Translucent outer beacon halo
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(0, 0, 18 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 3. Crisp white beacon puck with drop shadow
  ctx.globalAlpha = 1.0;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 2 * scale;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 11 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Directional Chevron / Arrow pointing in travel heading
  ctx.rotate(headingRad);
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(0, -9 * scale);      // Tip
  ctx.lineTo(6 * scale, 6 * scale);   // Bottom right
  ctx.lineTo(0, 3 * scale);       // Inner notch
  ctx.lineTo(-6 * scale, 6 * scale);  // Bottom left
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws Google Maps Brand Mark / Navigation Badge in the corner
 */
export function drawGoogleMapsBrandBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  layerName: string = 'Hybrid Satellite'
): void {
  ctx.save();
  ctx.translate(x, y);

  // Glassmorphic pill container
  const w = 180 * scale;
  const h = 34 * scale;
  ctx.fillStyle = 'rgba(8, 11, 17, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 10 * scale);
  ctx.fill();
  ctx.stroke();

  // Google Maps pin icon
  ctx.font = `bold ${Math.round(13 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#4285F4'; // Google Blue
  ctx.fillText('G', 12 * scale, 22 * scale);
  ctx.fillStyle = '#EA4335'; // Google Red
  ctx.fillText('o', 23 * scale, 22 * scale);
  ctx.fillStyle = '#FBBC05'; // Google Yellow
  ctx.fillText('o', 31 * scale, 22 * scale);
  ctx.fillStyle = '#4285F4'; // Google Blue
  ctx.fillText('g', 39 * scale, 22 * scale);
  ctx.fillStyle = '#34A853'; // Google Green
  ctx.fillText('l', 48 * scale, 22 * scale);
  ctx.fillStyle = '#EA4335'; // Google Red
  ctx.fillText('e', 53 * scale, 22 * scale);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${Math.round(10 * scale)}px "Montserrat", sans-serif`;
  ctx.fillText(`Maps · ${layerName}`, 64 * scale, 22 * scale);

  ctx.restore();
}
