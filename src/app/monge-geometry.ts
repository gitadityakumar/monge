export interface Point2D {
  x: number;
  y: number;
}

export interface CircleDef {
  x: number;
  y: number;
  r: number;
  color: string;
  name: string;
}

export interface TangentLine {
  p1: Point2D;
  p2: Point2D;
}

export interface MongeGeometryResult {
  circles: CircleDef[];
  externalCenters: {
    p12: Point2D | null;
    p23: Point2D | null;
    p31: Point2D | null;
  };
  internalCenters: {
    q12: Point2D | null;
    q23: Point2D | null;
    q31: Point2D | null;
  };
  externalTangents: {
    pair12: TangentLine[];
    pair23: TangentLine[];
    pair31: TangentLine[];
  };
  internalTangents: {
    pair12: TangentLine[];
    pair23: TangentLine[];
    pair31: TangentLine[];
  };
  mongeLine: TangentLine | null;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Compute external homothetic center for two circles.
 * P = O1 + (r1 / (r1 - r2)) * (O2 - O1)
 */
export function getExternalHomotheticCenter(
  c1: Point2D,
  r1: number,
  c2: Point2D,
  r2: number
): Point2D | null {
  if (Math.abs(r1 - r2) < 0.001) {
    // Radii are equal, tangents are parallel, center is at infinity
    return null;
  }
  const factor = r1 / (r1 - r2);
  return {
    x: c1.x + factor * (c2.x - c1.x),
    y: c1.y + factor * (c2.y - c1.y),
  };
}

/**
 * Compute internal homothetic center for two circles.
 * Q = (r2 * O1 + r1 * O2) / (r1 + r2)
 */
export function getInternalHomotheticCenter(
  c1: Point2D,
  r1: number,
  c2: Point2D,
  r2: number
): Point2D | null {
  const sum = r1 + r2;
  if (sum < 0.001) return null;
  return {
    x: (r2 * c1.x + r1 * c2.x) / sum,
    y: (r2 * c1.y + r1 * c2.y) / sum,
  };
}

/**
 * Compute external bitangents between two circles.
 */
export function getExternalBitangents(
  c1: Point2D,
  r1: number,
  c2: Point2D,
  r2: number
): TangentLine[] {
  const d = distance(c1, c2);
  if (d <= Math.abs(r1 - r2) + 0.01) {
    // One circle inside another or touching internally
    return [];
  }

  const theta = Math.atan2(c2.y - c1.y, c2.x - c1.x);
  const cosAlpha = (r1 - r2) / d;
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  // Two tangent angles
  const a1 = theta + alpha;
  const a2 = theta - alpha;

  const t1a: Point2D = { x: c1.x + r1 * Math.cos(a1), y: c1.y + r1 * Math.sin(a1) };
  const t2a: Point2D = { x: c2.x + r2 * Math.cos(a1), y: c2.y + r2 * Math.sin(a1) };

  const t1b: Point2D = { x: c1.x + r1 * Math.cos(a2), y: c1.y + r1 * Math.sin(a2) };
  const t2b: Point2D = { x: c2.x + r2 * Math.cos(a2), y: c2.y + r2 * Math.sin(a2) };

  return [
    { p1: t1a, p2: t2a },
    { p1: t1b, p2: t2b },
  ];
}

/**
 * Compute internal bitangents between two circles.
 */
export function getInternalBitangents(
  c1: Point2D,
  r1: number,
  c2: Point2D,
  r2: number
): TangentLine[] {
  const d = distance(c1, c2);
  if (d <= r1 + r2 + 0.01) {
    // Circles intersect or touch
    return [];
  }

  const theta = Math.atan2(c2.y - c1.y, c2.x - c1.x);
  const cosBeta = (r1 + r2) / d;
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));

  const a1 = theta + beta;
  const a2 = theta - beta;

  const u1a: Point2D = { x: c1.x + r1 * Math.cos(a1), y: c1.y + r1 * Math.sin(a1) };
  const u2a: Point2D = { x: c2.x - r2 * Math.cos(a1), y: c2.y - r2 * Math.sin(a1) };

  const u1b: Point2D = { x: c1.x + r1 * Math.cos(a2), y: c1.y + r1 * Math.sin(a2) };
  const u2b: Point2D = { x: c2.x - r2 * Math.cos(a2), y: c2.y - r2 * Math.sin(a2) };

  return [
    { p1: u1a, p2: u2a },
    { p1: u1b, p2: u2b },
  ];
}

/**
 * Extend a line segment through two points across a given span.
 */
export function extendLine(p1: Point2D, p2: Point2D, extendLength: number): TangentLine {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) {
    return { p1, p2 };
  }
  const ux = dx / len;
  const uy = dy / len;
  return {
    p1: { x: p1.x - ux * extendLength, y: p1.y - uy * extendLength },
    p2: { x: p2.x + ux * extendLength, y: p2.y + uy * extendLength },
  };
}

export interface MongeConfig {
  pos1: Point2D;
  pos2: Point2D;
  pos3: Point2D;
  radius1: number;
  radius2: number;
  radius3: number;
  color1: string;
  color2: string;
  color3: string;
  distanceScale: number;
}

/**
 * Main calculation of the entire Monge's theorem geometry.
 */
export function computeMongeGeometry(config: MongeConfig): MongeGeometryResult {
  const {
    pos1,
    pos2,
    pos3,
    radius1,
    radius2,
    radius3,
    color1,
    color2,
    color3,
    distanceScale,
  } = config;

  // Calculate centroid
  const cx = (pos1.x + pos2.x + pos3.x) / 3;
  const cy = (pos1.y + pos2.y + pos3.y) / 3;

  // Scale positions relative to centroid by distanceScale
  const c1: Point2D = {
    x: cx + (pos1.x - cx) * distanceScale,
    y: cy + (pos1.y - cy) * distanceScale,
  };
  const c2: Point2D = {
    x: cx + (pos2.x - cx) * distanceScale,
    y: cy + (pos2.y - cy) * distanceScale,
  };
  const c3: Point2D = {
    x: cx + (pos3.x - cx) * distanceScale,
    y: cy + (pos3.y - cy) * distanceScale,
  };

  const circles: CircleDef[] = [
    { x: c1.x, y: c1.y, r: radius1, color: color1, name: "C1" },
    { x: c2.x, y: c2.y, r: radius2, color: color2, name: "C2" },
    { x: c3.x, y: c3.y, r: radius3, color: color3, name: "C3" },
  ];

  // Homothetic centers
  const p12 = getExternalHomotheticCenter(c1, radius1, c2, radius2);
  const p23 = getExternalHomotheticCenter(c2, radius2, c3, radius3);
  const p31 = getExternalHomotheticCenter(c3, radius3, c1, radius1);

  const q12 = getInternalHomotheticCenter(c1, radius1, c2, radius2);
  const q23 = getInternalHomotheticCenter(c2, radius2, c3, radius3);
  const q31 = getInternalHomotheticCenter(c3, radius3, c1, radius1);

  // Bitangents
  const ext12 = getExternalBitangents(c1, radius1, c2, radius2);
  const ext23 = getExternalBitangents(c2, radius2, c3, radius3);
  const ext31 = getExternalBitangents(c3, radius3, c1, radius1);

  const int12 = getInternalBitangents(c1, radius1, c2, radius2);
  const int23 = getInternalBitangents(c2, radius2, c3, radius3);
  const int31 = getInternalBitangents(c3, radius3, c1, radius1);

  // Monge line: connects external centers (collinear by Monge's theorem)
  let mongeLine: TangentLine | null = null;
  const extPoints = [p12, p23, p31].filter((p): p is Point2D => p !== null);
  if (extPoints.length >= 2) {
    // Find the pair with largest distance to get stable direction
    let maxDist = -1;
    let ptA = extPoints[0];
    let ptB = extPoints[1];
    for (let i = 0; i < extPoints.length; i++) {
      for (let j = i + 1; j < extPoints.length; j++) {
        const d = distance(extPoints[i], extPoints[j]);
        if (d > maxDist) {
          maxDist = d;
          ptA = extPoints[i];
          ptB = extPoints[j];
        }
      }
    }
    // Extend the line through all points across the scene
    mongeLine = extendLine(ptA, ptB, 1200);
  }

  // Calculate bounding box containing circles and external centers
  let minX = Math.min(c1.x - radius1, c2.x - radius2, c3.x - radius3);
  let maxX = Math.max(c1.x + radius1, c2.x + radius2, c3.x + radius3);
  let minY = Math.min(c1.y - radius1, c2.y - radius2, c3.y - radius3);
  let maxY = Math.max(c1.y + radius1, c2.y + radius2, c3.y + radius3);

  for (const pt of extPoints) {
    minX = Math.min(minX, pt.x - 20);
    maxX = Math.max(maxX, pt.x + 20);
    minY = Math.min(minY, pt.y - 20);
    maxY = Math.max(maxY, pt.y + 20);
  }

  const padding = 60;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    circles,
    externalCenters: { p12, p23, p31 },
    internalCenters: { q12, q23, q31 },
    externalTangents: {
      pair12: ext12,
      pair23: ext23,
      pair31: ext31,
    },
    internalTangents: {
      pair12: int12,
      pair23: int23,
      pair31: int31,
    },
    mongeLine,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(100, maxX - minX),
      height: Math.max(100, maxY - minY),
    },
  };
}
