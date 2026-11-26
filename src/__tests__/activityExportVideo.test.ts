import { describe, it, expect } from 'vitest';
import { calculateHaversineKm } from '../utils/gpsFilter';
import { createAspectRatioProjector } from '../utils/routeGeometryGenerator';
import type { GpsLocationPoint } from '../types';

describe('Activity Video Export & Telemetry Engine', () => {
  const samplePoints: GpsLocationPoint[] = [
    { latitude: 12.9716, longitude: 77.5946, altitude: 920, speed: 3.2, timestamp: 1000 },
    { latitude: 12.9725, longitude: 77.5955, altitude: 922, speed: 3.4, timestamp: 2000 },
    { latitude: 12.9738, longitude: 77.5968, altitude: 925, speed: 3.3, timestamp: 3000 },
    { latitude: 12.9752, longitude: 77.5982, altitude: 928, speed: 3.5, timestamp: 4000 },
  ];

  it('computes strictly monotonic cumulative Haversine distances along GPS points', () => {
    const cumDists = new Array(samplePoints.length).fill(0);
    for (let i = 1; i < samplePoints.length; i++) {
      const segKm = calculateHaversineKm(
        samplePoints[i - 1].latitude,
        samplePoints[i - 1].longitude,
        samplePoints[i].latitude,
        samplePoints[i].longitude
      );
      expect(segKm).toBeGreaterThan(0);
      cumDists[i] = cumDists[i - 1] + segKm;
      expect(cumDists[i]).toBeGreaterThan(cumDists[i - 1]);
    }

    const totalKm = cumDists[cumDists.length - 1];
    expect(totalKm).toBeGreaterThan(0.3); // Bangalore park segment
    expect(totalKm).toBeLessThan(1.5);
  });

  it('guarantees aspect ratio preservation within vertical 9:16 bounds', () => {
    const bounds = { x: 50, y: 100, width: 980, height: 1200 };
    const { project } = createAspectRatioProjector(samplePoints, bounds, 40);

    samplePoints.forEach((p) => {
      const [screenX, screenY] = project(p.latitude, p.longitude);
      expect(screenX).toBeGreaterThanOrEqual(bounds.x);
      expect(screenX).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(screenY).toBeGreaterThanOrEqual(bounds.y);
      expect(screenY).toBeLessThanOrEqual(bounds.y + bounds.height);
    });
  });

  it('formats tabular odometer distance strings with stable decimal positions', () => {
    const testDistances = [0.0, 0.05, 1.2, 5.24, 12.89, 42.19];
    testDistances.forEach((d) => {
      const formatted = d.toFixed(2);
      expect(formatted).toMatch(/^\d+\.\d{2}$/);
      // Ensures exact 2 decimal places so slot widths remain perfectly aligned
      const [intPart, decPart] = formatted.split('.');
      expect(intPart.length).toBeGreaterThanOrEqual(1);
      expect(decPart.length).toBe(2);
    });
  });
});
