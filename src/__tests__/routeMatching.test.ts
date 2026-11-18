import { describe, it, expect } from 'vitest';
import {
  getRoutePointsForWorkout,
  NANDI_HILLS_POINTS,
  TURAHALLI_FOREST_POINTS,
  SOUTH_UNITED_PITCH_POINTS
} from '../utils/routeGeometryGenerator';
import type { Workout } from '../types';

describe('Route Matching & Geometry Resolution', () => {
  it('resolves Nandi Hills landmarks correctly', () => {
    const workout: Workout = {
      id: 1,
      title: 'Hill Climb Session',
      sport: 'Cycling',
      date: 'Aug 20, 2026',
      distance: '24.5',
      time: '1h 15m',
      pace: '19.6',
      color: '#fc4c02',
      route: '',
      location: 'Nandi Hills Climb'
    };

    const points = getRoutePointsForWorkout(workout);
    expect(points).toEqual(NANDI_HILLS_POINTS);
    expect(points.length).toBeGreaterThan(5);
  });

  it('resolves Turahalli Forest landmark correctly', () => {
    const workout: Workout = {
      id: 2,
      title: 'Trail Run',
      sport: 'Running',
      date: 'Aug 21, 2026',
      distance: '6.2',
      time: '32m',
      pace: '5:10',
      color: '#fc4c02',
      route: '',
      location: 'Turahalli Forest Singletrack'
    };

    const points = getRoutePointsForWorkout(workout);
    expect(points).toEqual(TURAHALLI_FOREST_POINTS);
  });

  it('resolves Football matches to South United Pitch coordinates', () => {
    const workout: Workout = {
      id: 3,
      title: 'South United Friendly 90m',
      sport: 'Football',
      date: 'Aug 22, 2026',
      distance: '8.4',
      time: '90m',
      pace: '5.6',
      color: '#CCFF00',
      route: '',
      location: 'South United Football Arena'
    };

    const points = getRoutePointsForWorkout(workout);
    expect(points).toEqual(SOUTH_UNITED_PITCH_POINTS);
  });

  it('falls back to valid realistic points when workout has no specific match', () => {
    const workout: Workout = {
      id: 4,
      title: 'Generic Recovery Jog',
      sport: 'Running',
      date: 'Aug 23, 2026',
      distance: '5.0',
      time: '25m',
      pace: '5:00',
      color: '#fc4c02',
      route: '',
      location: 'Bengaluru'
    };

    const points = getRoutePointsForWorkout(workout);
    expect(points.length).toBeGreaterThan(0);
    // Every point must have finite lat and lng
    points.forEach((p) => {
      expect(Number.isFinite(p.latitude)).toBe(true);
      expect(Number.isFinite(p.longitude)).toBe(true);
    });
  });
});
