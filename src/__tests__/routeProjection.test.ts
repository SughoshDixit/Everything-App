import { describe, it, expect } from 'vitest';
import { createAspectRatioProjector } from '../utils/routeGeometryGenerator';
import { computeOptimalZoom, latLngToWorld } from '../utils/googleMapsRenderer';

describe('Route Projection & Aspect-Ratio Preservation', () => {
  it('correctly preserves aspect ratio and prevents route stretching', () => {
    // An East-West wide route: 0.04 deg lng, 0.01 deg lat (e.g. 4:1 width:height)
    const widePoints = [
      { latitude: 12.9700, longitude: 77.5600 },
      { latitude: 12.9750, longitude: 77.5800 },
      { latitude: 12.9800, longitude: 77.6000 }
    ];

    const viewBox = { x: 50, y: 100, width: 600, height: 900 };
    const result = createAspectRatioProjector(widePoints, viewBox, 20);

    // Because geoWidth is much larger than geoHeight, drawWidth should approach usableWidth
    // while drawHeight should be scaled down proportionally (not stretched to 900px)
    expect(result.drawWidth).toBeLessThanOrEqual(viewBox.width);
    expect(result.drawHeight).toBeLessThan(viewBox.height);

    // Test projection output
    const [p0x, p0y] = result.project(12.9700, 77.5600);
    const [p2x, p2y] = result.project(12.9800, 77.6000);

    expect(Number.isFinite(p0x)).toBe(true);
    expect(Number.isFinite(p0y)).toBe(true);
    expect(p2x).toBeGreaterThan(p0x); // East is to the right
    expect(p2y).toBeLessThan(p0y); // North is higher up on canvas (smaller y)
  });

  it('handles vertical North-South routes without horizontal squishing', () => {
    const tallPoints = [
      { latitude: 12.9000, longitude: 77.5900 },
      { latitude: 12.9500, longitude: 77.5910 },
      { latitude: 13.0000, longitude: 77.5905 }
    ];

    const viewBox = { x: 0, y: 0, width: 720, height: 1280 };
    const result = createAspectRatioProjector(tallPoints, viewBox, 40);

    expect(result.drawHeight).toBeLessThanOrEqual(viewBox.height);
    expect(result.drawWidth).toBeLessThan(viewBox.width);
  });

  it('computes optimal zoom level appropriately without defaulting to 13 on wide boundaries', () => {
    // 100km ride bounding box
    const wideBounds = {
      minLat: 12.5000,
      maxLat: 13.5000,
      minLng: 77.0000,
      maxLng: 78.0000
    };

    const zoom = computeOptimalZoom(wideBounds, 720, 1280, 80);
    // Should choose a zoomed-out level (<= 9), never default to 13
    expect(zoom).toBeLessThanOrEqual(10);
    expect(zoom).toBeGreaterThanOrEqual(2);
  });

  it('calculates Mercator world coordinates consistently', () => {
    const world1 = latLngToWorld(12.9716, 77.5946, 12);
    const world2 = latLngToWorld(12.9716, 77.6046, 12);

    expect(world2.x).toBeGreaterThan(world1.x);
    expect(world1.y).toBeCloseTo(world2.y, 4);
  });
});
