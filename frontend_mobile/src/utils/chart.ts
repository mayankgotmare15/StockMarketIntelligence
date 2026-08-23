/**
 * Chart utility algorithms for high-performance financial time-series rendering.
 */

export interface ChartPoint {
  x: number;
  y: number;
  price: number;
  date: string;
  adaptivePrice?: number;
  staticPrice?: number;
}

/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
 * Downsamples data to `threshold` points while preserving visual peaks, troughs, and trends.
 */
export function lttbDownsample<T extends { actual_price: number; date: string; y_hat_adaptive_price?: number; y_hat_static_price?: number }>(
  data: T[],
  threshold: number
): T[] {
  if (threshold >= data.length || threshold === 0) {
    return data;
  }

  const sampled: T[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0; // Initially the first point in the dataset
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate average point for the next bucket (bucket c)
    let avgX = 0;
    let avgY = 0;
    const nextBucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
    const nextBucketLength = nextBucketEnd - nextBucketStart;

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgX += j;
      avgY += data[j].actual_price;
    }
    avgX /= nextBucketLength || 1;
    avgY /= nextBucketLength || 1;

    // Get the range for this bucket (bucket b)
    const currentBucketStart = Math.floor(i * bucketSize) + 1;
    const currentBucketEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, data.length);

    // Point a
    const pointA_X = a;
    const pointA_Y = data[a].actual_price;

    let maxArea = -1;
    let maxAreaIndex = currentBucketStart;

    for (let j = currentBucketStart; j < currentBucketEnd; j++) {
      // Calculate triangle area over points a, this point, and average next point
      const area =
        Math.abs(
          (pointA_X - avgX) * (data[j].actual_price - pointA_Y) -
            (pointA_X - j) * (avgY - pointA_Y)
        ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }

    sampled.push(data[maxAreaIndex]);
    a = maxAreaIndex; // Next point a is the selected point
  }

  // Always include the last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Generates smooth SVG Cubic Bezier Path from 2D coordinate points
 */
export function generateBezierSpline(
  coords: { x: number; y: number }[],
  width: number,
  height: number
): { path: string; area: string } {
  if (coords.length === 0) {
    return { path: "", area: "" };
  }

  if (coords.length === 1) {
    return {
      path: `M 0 ${coords[0].y} L ${width} ${coords[0].y}`,
      area: `M 0 ${coords[0].y} L ${width} ${coords[0].y} L ${width} ${height} L 0 ${height} Z`,
    };
  }

  let pathD = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return { path: pathD, area: areaD };
}
