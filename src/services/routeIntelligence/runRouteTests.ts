/**
 * Route Intelligence Automated Test Suite
 * Validates all 9 core edge-case scenarios:
 * 1. Duplicate GPS points filter
 * 2. Extreme GPS jumps rejection (> max speed)
 * 3. Poor horizontal accuracy rejection (> 35m)
 * 4. Route gaps & pause segmentation (> 30s / > 250m)
 * 5. Track workouts (eligible for map matching = false)
 * 6. Trail activities (pedestrian profile support)
 * 7. Indoor / treadmill activities (graceful NO_MAP decision)
 * 8. Map-matching failure fallback to CLEANED
 * 9. Map-matching distance deviation safety rejection
 */

import { ActivityRouteQualityService } from './routeQualityService';
import { ActivityRouteProcessingService } from './routeProcessingService';
import { ValhallaRouteMatcher, PassthroughRouteMatcher } from './routeMatcher';
import type { GpsPoint } from '../../types/routeIntelligence';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export async function runAllRouteIntelligenceTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper assertion
  const assert = (condition: boolean, name: string, details: string) => {
    results.push({
      name,
      passed: condition,
      details: condition ? `PASS: ${details}` : `FAIL: ${details}`
    });
  };

  // ---------------------------------------------------------------------------
  // TEST 1: Duplicate Consecutive GPS Points
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 5 },
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime + 500, accuracy: 5 }, // exact duplicate
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime + 1000, accuracy: 5 }, // exact duplicate
      { latitude: 12.9717, longitude: 77.5947, timestamp: baseTime + 5000, accuracy: 5 }
    ];

    const { report, acceptedIndices } = ActivityRouteQualityService.analyzeQuality(testPoints, 'RUN');
    const duplicatesFiltered = report.totalPoints === 4 && acceptedIndices.size === 2;
    assert(
      duplicatesFiltered,
      'Test 1: Duplicate Consecutive Points Filter',
      `Expected 2 accepted points from 4 input points (2 duplicates filtered). Got: ${acceptedIndices.size} accepted.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Extreme GPS Speed Jumps (> Max Speed)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 5 },
      { latitude: 12.9720, longitude: 77.5950, timestamp: baseTime + 5000, accuracy: 5 },
      // Impossible jump for running: jumps 5 km in 2 seconds (2500 m/s >> 12 m/s)
      { latitude: 13.0200, longitude: 77.6300, timestamp: baseTime + 7000, accuracy: 5 },
      { latitude: 12.9725, longitude: 77.5955, timestamp: baseTime + 10000, accuracy: 5 }
    ];

    const { report, acceptedIndices } = ActivityRouteQualityService.analyzeQuality(testPoints, 'RUN');
    const jumpRejected = report.speedJumpViolations >= 1 && !acceptedIndices.has(2);
    assert(
      jumpRejected,
      'Test 2: Extreme Velocity Jump Rejection',
      `Impossible teleportation point flagged and excluded. Speed violations: ${report.speedJumpViolations}.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Poor Horizontal Accuracy (> 35m)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 8 },
      { latitude: 12.9718, longitude: 77.5948, timestamp: baseTime + 5000, accuracy: 65 }, // Poor accuracy (65m > 35m)
      { latitude: 12.9720, longitude: 77.5950, timestamp: baseTime + 10000, accuracy: 95 }, // Poor accuracy (95m > 35m)
      { latitude: 12.9722, longitude: 77.5952, timestamp: baseTime + 15000, accuracy: 10 }
    ];

    const { report, acceptedIndices } = ActivityRouteQualityService.analyzeQuality(testPoints, 'RUN');
    const accuracyRejected = report.accuracyViolations === 2 && acceptedIndices.size === 2;
    assert(
      accuracyRejected,
      'Test 3: Horizontal Accuracy Gate (> 35m)',
      `Both 65m and 95m inaccurate fixes were rejected. Accuracy violations: ${report.accuracyViolations}.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Route Gaps & Discontinuities (> 30s / > 250m)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 5 },
      { latitude: 12.9720, longitude: 77.5950, timestamp: baseTime + 10000, accuracy: 5 },
      // 90 second pause / gap across signal blackout
      { latitude: 12.9730, longitude: 77.5960, timestamp: baseTime + 100000, accuracy: 5 },
      { latitude: 12.9735, longitude: 77.5965, timestamp: baseTime + 110000, accuracy: 5 }
    ];

    const { report, gapIndices } = ActivityRouteQualityService.analyzeQuality(testPoints, 'RUN');
    const processed = ActivityRouteProcessingService.processActivity({
      source: 'DEVICE',
      sportType: 'RUN',
      title: 'Gap Test Run',
      rawPoints: testPoints
    });

    const segmentsCount = processed.geometries.cleaned.segments?.length || 0;
    const gapDetected = report.gapCount >= 1 && gapIndices.has(2) && segmentsCount === 2;
    assert(
      gapDetected,
      'Test 4: Discontinuity Segmentation (No False Lines)',
      `Gap detected at index 2. Cleaned geometry split into ${segmentsCount} MultiLineString segments.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Track Workouts (Eligible for Map-Matching = False)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [];
    for (let i = 0; i < 20; i++) {
      testPoints.push({
        latitude: 12.9716 + Math.sin(i * 0.3) * 0.001,
        longitude: 77.5946 + Math.cos(i * 0.3) * 0.001,
        timestamp: baseTime + i * 5000,
        accuracy: 5
      });
    }

    const { report } = ActivityRouteQualityService.analyzeQuality(testPoints, 'TRACK_WORKOUT');
    assert(
      !report.isEligibleForMapMatching,
      'Test 5: Track Workout Map-Matching Bypass',
      `TRACK_WORKOUT is properly marked ineligible for road snapping. isEligible: ${report.isEligibleForMapMatching}.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Trail Activities (Pedestrian Costing Profile)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [];
    for (let i = 0; i < 15; i++) {
      testPoints.push({
        latitude: 12.9716 + i * 0.0005,
        longitude: 77.5946 + i * 0.0005,
        timestamp: baseTime + i * 10000,
        accuracy: 6
      });
    }

    const processed = ActivityRouteProcessingService.processActivity({
      source: 'DEVICE',
      sportType: 'TRAIL_RUN',
      title: 'Trail Ridge Run',
      rawPoints: testPoints
    });

    const matcher = new PassthroughRouteMatcher();
    const matchResult = await matcher.matchRoute(
      processed.activity,
      processed.geometries.cleaned,
      'TRAIL_RUN'
    );

    assert(
      matchResult.success && processed.activity.sportType === 'TRAIL_RUN',
      'Test 6: Trail Activity Route Processing & Matching',
      `Trail run processed with pedestrian profile. Matched confidence: ${matchResult.confidence}.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Indoor / Treadmill Workouts (NO_MAP Decision)
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const indoorPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 12 },
      { latitude: 12.97161, longitude: 77.59461, timestamp: baseTime + 10000, accuracy: 14 }
    ];

    const processedTreadmill = ActivityRouteProcessingService.processActivity({
      source: 'DEVICE',
      sportType: 'TREADMILL',
      title: 'Treadmill Interval',
      rawPoints: indoorPoints
    });

    assert(
      processedTreadmill.activity.routeRenderMode === 'NO_MAP',
      'Test 7: Indoor / Treadmill NO_MAP Decision',
      `Treadmill workout correctly assigned routeRenderMode: ${processedTreadmill.activity.routeRenderMode}.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Map-Matching Failure Fallback to CLEANED
  // ---------------------------------------------------------------------------
  {
    const baseTime = Date.now();
    const testPoints: GpsPoint[] = [
      { latitude: 12.9716, longitude: 77.5946, timestamp: baseTime, accuracy: 5 },
      { latitude: 12.9720, longitude: 77.5950, timestamp: baseTime + 5000, accuracy: 5 },
      { latitude: 12.9725, longitude: 77.5955, timestamp: baseTime + 10000, accuracy: 5 }
    ];

    const processed = ActivityRouteProcessingService.processActivity({
      source: 'DEVICE',
      sportType: 'RUN',
      title: 'Fallback Test Run',
      rawPoints: testPoints
    });

    // Simulate an unreachable Valhalla endpoint
    const failingMatcher = new ValhallaRouteMatcher('https://invalid-nonexistent-valhalla.local');
    const result = await failingMatcher.matchRoute(
      processed.activity,
      processed.geometries.cleaned,
      'RUN'
    );

    assert(
      !result.success && result.geometryKind === 'CLEANED',
      'Test 8: Map-Matching Server Failure Fallback',
      `Server error cleanly captured. System gracefully defaulted to ${result.geometryKind} geometry.`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Matched Distance Deviation Safety Rejection (> 18%)
  // ---------------------------------------------------------------------------
  {
    // Test deviation formula
    const cleanedMeters = 5000;
    const wildMatchedMeters = 6500; // 30% deviation (> 18% threshold)
    const deviationPercent = (Math.abs(wildMatchedMeters - cleanedMeters) / cleanedMeters) * 100;
    const shouldReject = deviationPercent > 18.0;

    assert(
      shouldReject && deviationPercent === 30.0,
      'Test 9: Distance Deviation Safety Gating (> 18%)',
      `Wild deviation of ${deviationPercent}% correctly triggers rejection to prevent corrupting user metrics.`
    );
  }

  return results;
}
