/**
 * Map Provider Abstraction
 * Decouples map visualization logic from the underlying rendering engine (Leaflet / MapLibre).
 * Enforces premium dark aesthetic: obsidian tiles, glowing energetic polyline,
 * start/finish beacons, and zero default clutter.
 */

import L from 'leaflet';
import { ROUTE_INTELLIGENCE_CONFIG } from './routeConfig';
import { PerfMonitor } from './performanceMonitoring';
import type { RouteRenderMode } from '../../types/routeIntelligence';

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapProviderOptions {
  theme?: 'dark_matter' | 'alidade_smooth_dark' | 'midnight_carto';
  accentColor?: string;
  glowColor?: string;
  interactive?: boolean;
  padding?: number;
}

export interface IMapProvider {
  initialize(container: HTMLElement, options?: MapProviderOptions): void;
  renderRoute(
    coordinates: [number, number][], // [latitude, longitude] for Leaflet
    segments?: [number, number][][], // MultiLineString segments for gaps
    mode?: RouteRenderMode
  ): void;
  fitBounds(bounds?: MapBounds): void;
  destroy(): void;
}

export class LeafletMapProvider implements IMapProvider {
  private map: L.Map | null = null;
  private glowLayer: L.FeatureGroup | null = null;
  private lineLayer: L.FeatureGroup | null = null;
  private markerLayer: L.FeatureGroup | null = null;
  private options: MapProviderOptions;
  private lastRenderedKey: string | null = null;
  private boundsFitted: boolean = false;

  constructor(options?: MapProviderOptions) {
    this.options = {
      theme: 'dark_matter',
      accentColor: ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_COLOR_PRIMARY,
      glowColor: ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_COLOR_GLOW,
      interactive: true,
      padding: ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.MAP_PADDING_PIXELS,
      ...options
    };
  }

  public initialize(container: HTMLElement, customOptions?: MapProviderOptions): void {
    if (this.map) {
      this.destroy();
    }

    if (customOptions) {
      this.options = { ...this.options, ...customOptions };
    }

    // Initialize Leaflet map with all default browser zoom and attribution controls removed for pure minimal presentation
    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      dragging: this.options.interactive ?? true,
      touchZoom: this.options.interactive ?? true,
      scrollWheelZoom: false,
      doubleClickZoom: this.options.interactive ?? true,
      boxZoom: false,
      keyboard: false
    });

    // Dark Matter high-contrast tile layer (crisp vector look on high-DPI mobile screens)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.95
      }
    ).addTo(this.map);

    this.glowLayer = L.featureGroup().addTo(this.map);
    this.lineLayer = L.featureGroup().addTo(this.map);
    this.markerLayer = L.featureGroup().addTo(this.map);
  }

  public renderRoute(
    coordinates: [number, number][],
    segments?: [number, number][][],
    mode: RouteRenderMode = 'CLEANED'
  ): void {
    if (!this.map || !this.glowLayer || !this.lineLayer || !this.markerLayer) return;
    if (coordinates.length < 2) return;

    // Cache key to avoid redundant layer thrashing
    const routeKey = `${mode}_${coordinates.length}_${coordinates[0][0]}_${coordinates[coordinates.length - 1][0]}`;
    if (this.lastRenderedKey === routeKey) {
      return;
    }

    PerfMonitor.start('leaflet_render_route');
    this.lastRenderedKey = routeKey;

    this.glowLayer.clearLayers();
    this.lineLayer.clearLayers();
    this.markerLayer.clearLayers();

    const accentColor =
      mode === 'RAW'
        ? '#38BDF8' // Sky blue for raw GPS track inspection
        : mode === 'MATCHED'
        ? '#10B981' // Emerald for snapped road match
        : this.options.accentColor || ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_COLOR_PRIMARY;

    const glowColor =
      mode === 'RAW'
        ? 'rgba(56, 189, 248, 0.3)'
        : mode === 'MATCHED'
        ? 'rgba(16, 185, 129, 0.3)'
        : this.options.glowColor || ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_COLOR_GLOW;

    // Render segments to honor gaps and avoid false straight lines
    const activeSegments: [number, number][][] =
      segments && segments.length > 0 ? segments : [coordinates];

    for (const seg of activeSegments) {
      if (seg.length < 2) continue;

      // 1. Subtle Outer Glow Layer
      const glowLine = L.polyline(seg, {
        color: glowColor,
        weight: ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_GLOW_WIDTH_PIXELS,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 0.8
      });
      this.glowLayer.addLayer(glowLine);

      // 2. Crisp, Bold Primary Polyline
      const mainLine = L.polyline(seg, {
        color: accentColor,
        weight: ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.ROUTE_WIDTH_PIXELS,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 1.0
      });
      this.lineLayer.addLayer(mainLine);
    }

    // 3. Elegant Start & Finish Beacons
    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

    const startIcon = L.divIcon({
      className: 'custom-beacon-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; border: 2.5px solid #0E131B; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const finishIcon = L.divIcon({
      className: 'custom-beacon-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(245, 158, 11, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B; border: 2.5px solid #0E131B; box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker(startPoint, { icon: startIcon, interactive: false }).addTo(this.markerLayer);
    L.marker(endPoint, { icon: finishIcon, interactive: false }).addTo(this.markerLayer);

    // Auto-fit bounds once with padding
    if (!this.boundsFitted) {
      const bounds = L.latLngBounds(coordinates);
      const pad = this.options.padding || ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.MAP_PADDING_PIXELS;
      this.map.fitBounds(bounds, {
        padding: [pad, pad],
        animate: false
      });
      this.boundsFitted = true;
    }

    PerfMonitor.end('leaflet_render_route', { pointCount: coordinates.length });
  }

  public fitBounds(bounds?: MapBounds): void {
    if (!this.map) return;
    const pad = this.options.padding || ROUTE_INTELLIGENCE_CONFIG.DISPLAY_STYLING.MAP_PADDING_PIXELS;
    if (bounds) {
      const latLngBounds = L.latLngBounds(
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng]
      );
      this.map.fitBounds(latLngBounds, { padding: [pad, pad], animate: true });
    } else if (this.lineLayer && this.lineLayer.getLayers().length > 0) {
      this.map.fitBounds(this.lineLayer.getBounds(), { padding: [pad, pad], animate: true });
    }
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.glowLayer = null;
      this.lineLayer = null;
      this.markerLayer = null;
      this.lastRenderedKey = null;
      this.boundsFitted = false;
    }
  }
}

/**
 * MapLibre Map Provider Stub
 * Ready for vector tile / 3D terrain rendering in Phase 2 & Phase 3.
 */
export class MapLibreMapProvider implements IMapProvider {
  private options: MapProviderOptions;

  constructor(options?: MapProviderOptions) {
    this.options = options || {};
  }

  public initialize(_container: HTMLElement, options?: MapProviderOptions): void {
    if (options) this.options = { ...this.options, ...options };
    // MapLibre GL JS engine adapter will instantiate here when maplibre-gl is active
  }

  public renderRoute(
    _coordinates: [number, number][],
    _segments?: [number, number][][],
    _mode: RouteRenderMode = 'CLEANED'
  ): void {
    // Vector polyline layer insertion
  }

  public fitBounds(_bounds?: MapBounds): void {}

  public destroy(): void {}
}

/**
 * Factory to create preferred map provider
 */
export function createMapProvider(
  type: 'leaflet' | 'maplibre' = 'leaflet',
  options?: MapProviderOptions
): IMapProvider {
  if (type === 'leaflet') {
    return new LeafletMapProvider(options);
  }
  return new MapLibreMapProvider(options);
}
