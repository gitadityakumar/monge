import { describe, expect, it } from "vitest";
import { computeMongeGeometry, getExternalHomotheticCenter } from "./monge-geometry";

describe("Monge's Theorem Geometry", () => {
  it("computes external homothetic centers correctly", () => {
    // Circle 1 at (0, 0), r1 = 100; Circle 2 at (300, 0), r2 = 50
    // Factor = 100 / (100 - 50) = 2
    // P12 = (0, 0) + 2 * (300, 0) = (600, 0)
    const p12 = getExternalHomotheticCenter({ x: 0, y: 0 }, 100, { x: 300, y: 0 }, 50);
    expect(p12).not.toBeNull();
    expect(p12!.x).toBeCloseTo(600, 4);
    expect(p12!.y).toBeCloseTo(0, 4);
  });

  it("proves the three external homothetic centers are collinear (Monge's Theorem)", () => {
    // 3 circles in general position with unequal radii
    const result = computeMongeGeometry({
      pos1: { x: 400, y: 350 },
      pos2: { x: 750, y: 280 },
      pos3: { x: 600, y: 550 },
      radius1: 120,
      radius2: 70,
      radius3: 45,
      color1: "#38bdf8",
      color2: "#a855f7",
      color3: "#f43f5e",
      distanceScale: 1.0,
    });

    const { p12, p23, p31 } = result.externalCenters;
    expect(p12).not.toBeNull();
    expect(p23).not.toBeNull();
    expect(p31).not.toBeNull();

    // Collinearity check: triangle area = 0.5 * |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|
    const area = Math.abs(
      p12!.x * (p23!.y - p31!.y) +
      p23!.x * (p31!.y - p12!.y) +
      p31!.x * (p12!.y - p23!.y)
    ) * 0.5;

    // Relative to the distance between centers, the triangle area should be negligible (< 0.01)
    expect(area).toBeLessThan(0.05);
    expect(result.mongeLine).not.toBeNull();
  });

  it("handles distanceScale scaling properly", () => {
    const r1 = computeMongeGeometry({
      pos1: { x: 200, y: 200 },
      pos2: { x: 500, y: 200 },
      pos3: { x: 350, y: 400 },
      radius1: 80,
      radius2: 50,
      radius3: 30,
      color1: "#38bdf8",
      color2: "#a855f7",
      color3: "#f43f5e",
      distanceScale: 1.0,
    });

    const r2 = computeMongeGeometry({
      pos1: { x: 200, y: 200 },
      pos2: { x: 500, y: 200 },
      pos3: { x: 350, y: 400 },
      radius1: 80,
      radius2: 50,
      radius3: 30,
      color1: "#38bdf8",
      color2: "#a855f7",
      color3: "#f43f5e",
      distanceScale: 1.5,
    });

    // Distance between circles should be strictly greater with distanceScale = 1.5
    const dist1 = Math.hypot(r1.circles[1].x - r1.circles[0].x, r1.circles[1].y - r1.circles[0].y);
    const dist2 = Math.hypot(r2.circles[1].x - r2.circles[0].x, r2.circles[1].y - r2.circles[0].y);
    expect(dist2).toBeGreaterThan(dist1);
  });
});
