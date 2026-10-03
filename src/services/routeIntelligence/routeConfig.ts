/**
 * Activity Route Intelligence Configuration
 * Centralized, configurable thresholds for GPS Quality Filtering, Speed Gating,
 * Segmentation, Simplification, and Privacy Trimming.
 */

import type { RouteSportType } from '../../types/routeIntelligence';

export const ROUTE_INTELLIGENCE_CONFIG = {
  // Current processing pipeline version
  PROCESSING_VERSION: 'v1.0.0',

  // GPS Accuracy Gate (meters)
  // Fixes with reported horizontal accuracy worse than this threshold are rejected from derived geometries
  ACCURACY_THRESHOLD_METERS: 35.0,
  ACCURACY_EXCELLENT_METERS: 12.0,

  // Plausible Physical Velocity Limits by Sport (m/s)
  // 1 m/s = 3.6 km/h
  MAX_SPEED_MPS: {
    RUN: 12.0,         // ~43.2 km/h (Usain Bolt peak: 12.4 m/s)
    WALK: 4.5,         // ~16.2 km/h (fast power walk)
    RIDE: 32.0,        // ~115.2 km/h (steep downhill cycling)
    HIKE: 4.5,         // ~16.2 km/h
    TRAIL_RUN: 10.0,    // ~36.0 km/h
    ROAD_TRIP: 58.0,    // ~208.8 km/h (expressway driving)
    TRACK_WORKOUT: 12.5,// ~45.0 km/h
    FOOTBALL: 11.5,    // ~41.4 km/h (elite winger sprint)
    TREADMILL: 8.5,     // ~30.6 km/h
    CALISTHENICS: 3.0,  // stationary
    OTHER: 25.0        // ~90.0 km/h
  } as Record<RouteSportType, number>,

  // Stationary Noise & Drift Filter
  // Prevents the 4x GPS jitter accumulation while standing or walking slowly
  MIN_STATIONARY_SPEED_MPS: 0.5, // ~1.8 km/h - below this is stationary drift
  MIN_DISPLACEMENT_METERS: 1.2,  // Minimum step distance required between sequential points

  // Route Discontinuity & Segment Detection
  // If time elapsed or distance jumped exceeds these, split into separate segments
  // rather than drawing false straight lines across the city or during paused intervals
  SEGMENT_TIME_GAP_SECONDS: 30, // 30s gap without GPS updates
  SEGMENT_DISTANCE_JUMP_METERS: 250, // 250m instant displacement without intervening points

  // Minimum accepted points required to produce a valid route map
  MIN_POINTS_FOR_MAP: 3,

  // Douglas-Peucker Simplification Epsilon (degrees)
  // ~0.00005 degrees is approximately 5.5 meters on Earth surface
  SIMPLIFICATION_EPSILON_DEGREES: 0.000045,

  // Video Interpolation Step (meters)
  // Distance delta between animated frames in trail video geometry
  VIDEO_SAMPLE_DISTANCE_METERS: 10.0,

  // Default Privacy Zone Redaction Radius (meters)
  // Trims start and end points within this radius from the user's home or start anchor
  PRIVACY_ZONE_DEFAULT_RADIUS_METERS: 200.0,

  // Map Display Styling
  DISPLAY_STYLING: {
    ROUTE_COLOR_PRIMARY: '#FC5200',      // Energetic Strava Coral
    ROUTE_COLOR_GLOW: 'rgba(252, 82, 0, 0.35)',
    ROUTE_WIDTH_PIXELS: 5,
    ROUTE_GLOW_WIDTH_PIXELS: 10,
    START_MARKER_COLOR: '#10B981',      // Emerald Green
    FINISH_MARKER_COLOR: '#F59E0B',     // Amber Gold
    MAP_PADDING_PIXELS: 40
  }
};
