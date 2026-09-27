import React from "react";
import { useToolcraftEvaluatedValues } from "@/toolcraft/runtime/react";
import {
  computeMongeGeometry,
  type MongeConfig,
  type MongeGeometryResult,
  type Point2D,
} from "./monge-geometry";

export const PRESET_POSITIONS: Record<
  string,
  { pos1: Point2D; pos2: Point2D; pos3: Point2D }
> = {
  triangle: {
    pos1: { x: 500, y: 320 },
    pos2: { x: 860, y: 270 },
    pos3: { x: 710, y: 520 },
  },
  ascending: {
    pos1: { x: 520, y: 560 },
    pos2: { x: 810, y: 440 },
    pos3: { x: 1050, y: 340 },
  },
  offset: {
    pos1: { x: 450, y: 280 },
    pos2: { x: 850, y: 280 },
    pos3: { x: 600, y: 500 },
  },
};

export function getMongeConfigFromValues(
  values: Record<string, unknown>
): {
  config: MongeConfig;
  circleStrokeWidth: number;
  circleFillOpacity: number;
  tangentStrokeWidth: number;
  mongeLineStrokeWidth: number;
  tangentColor: string;
  mongeLineColor: string;
  glowIntensity: number;
  showMongeLine: boolean;
  showExternalTangents: boolean;
  showInternalTangents: boolean;
  showCenterLines: boolean;
  showLabels: boolean;
  showPoints: boolean;
  fontSize: number;
  labelColor: string;
} {
  const presetKey = (values["geometry.layoutPreset"] as string) || "triangle";
  const basePos = PRESET_POSITIONS[presetKey] || PRESET_POSITIONS.triangle;

  const distanceScale = Number(values["geometry.distanceScale"] ?? 1.0);
  const radius1 = Number(values["circles.radius1"] ?? 80);
  const radius2 = Number(values["circles.radius2"] ?? 50);
  const radius3 = Number(values["circles.radius3"] ?? 30);

  const color1 = (values["circles.color1"] as string) || "#38BDF8";
  const color2 = (values["circles.color2"] as string) || "#C084FC";
  const color3 = (values["circles.color3"] as string) || "#FB7185";

  const config: MongeConfig = {
    pos1: basePos.pos1,
    pos2: basePos.pos2,
    pos3: basePos.pos3,
    radius1,
    radius2,
    radius3,
    color1,
    color2,
    color3,
    distanceScale,
  };

  return {
    config,
    circleStrokeWidth: Number(values["circles.strokeWidth"] ?? 3),
    circleFillOpacity: Number(values["circles.fillOpacity"] ?? 0.15),
    tangentStrokeWidth: Number(values["lines.tangentStrokeWidth"] ?? 2),
    mongeLineStrokeWidth: Number(values["lines.mongeLineStrokeWidth"] ?? 3.5),
    tangentColor: (values["lines.tangentColor"] as string) || "#94A3B8",
    mongeLineColor: (values["lines.mongeLineColor"] as string) || "#F59E0B",
    glowIntensity: Number(values["lines.glowIntensity"] ?? 12),
    showMongeLine: values["lines.showMongeLine"] !== false,
    showExternalTangents: values["lines.showExternalTangents"] !== false,
    showInternalTangents: Boolean(values["lines.showInternalTangents"]),
    showCenterLines: values["lines.showCenterLines"] !== false,
    showLabels: values["annotations.showLabels"] !== false,
    showPoints: values["annotations.showPoints"] !== false,
    fontSize: Number(values["annotations.fontSize"] ?? 16),
    labelColor: (values["annotations.labelColor"] as string) || "#F8FAFC",
  };
}

/**
 * Pure 2D canvas drawing routine shared between export and canvas preview.
 */
export function drawMongeSceneToCanvas(
  ctx: CanvasRenderingContext2D,
  geometry: MongeGeometryResult,
  options: {
    circleStrokeWidth: number;
    circleFillOpacity: number;
    tangentStrokeWidth: number;
    mongeLineStrokeWidth: number;
    tangentColor: string;
    mongeLineColor: string;
    glowIntensity: number;
    showMongeLine: boolean;
    showExternalTangents: boolean;
    showInternalTangents: boolean;
    showCenterLines: boolean;
    showLabels: boolean;
    showPoints: boolean;
    fontSize: number;
    labelColor: string;
    scale?: number;
  }
): void {
  const {
    circleStrokeWidth,
    circleFillOpacity,
    tangentStrokeWidth,
    mongeLineStrokeWidth,
    tangentColor,
    mongeLineColor,
    glowIntensity,
    showMongeLine,
    showExternalTangents,
    showInternalTangents,
    showCenterLines,
    showLabels,
    showPoints,
    fontSize,
    labelColor,
    scale = 1,
  } = options;

  ctx.save();
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // 1. Center connection lines (dashed)
  if (showCenterLines) {
    ctx.save();
    if (glowIntensity > 0) {
      ctx.shadowColor = "rgba(148, 163, 184, 0.5)";
      ctx.shadowBlur = glowIntensity * 0.5;
    }
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = Math.max(1, tangentStrokeWidth * 0.75);
    ctx.setLineDash([6, 6]);

    const c = geometry.circles;
    ctx.beginPath();
    ctx.moveTo(c[0].x, c[0].y);
    ctx.lineTo(c[1].x, c[1].y);
    ctx.lineTo(c[2].x, c[2].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // 2. External Bitangents
  if (showExternalTangents) {
    ctx.save();
    if (glowIntensity > 0) {
      ctx.shadowColor = tangentColor;
      ctx.shadowBlur = glowIntensity * 0.8;
    }
    ctx.strokeStyle = tangentColor;
    ctx.lineWidth = tangentStrokeWidth;

    const allExt = [
      ...geometry.externalTangents.pair12,
      ...geometry.externalTangents.pair23,
      ...geometry.externalTangents.pair31,
    ];

    for (const t of allExt) {
      ctx.beginPath();
      ctx.moveTo(t.p1.x, t.p1.y);
      ctx.lineTo(t.p2.x, t.p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. Internal Bitangents
  if (showInternalTangents) {
    ctx.save();
    if (glowIntensity > 0) {
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.shadowBlur = glowIntensity * 0.8;
    }
    ctx.strokeStyle = "rgba(168, 85, 247, 0.65)";
    ctx.lineWidth = Math.max(1, tangentStrokeWidth * 0.9);
    ctx.setLineDash([4, 4]);

    const allInt = [
      ...geometry.internalTangents.pair12,
      ...geometry.internalTangents.pair23,
      ...geometry.internalTangents.pair31,
    ];

    for (const t of allInt) {
      ctx.beginPath();
      ctx.moveTo(t.p1.x, t.p1.y);
      ctx.lineTo(t.p2.x, t.p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Monge's Collinear Line
  if (showMongeLine && geometry.mongeLine) {
    ctx.save();
    if (glowIntensity > 0) {
      ctx.shadowColor = mongeLineColor;
      ctx.shadowBlur = glowIntensity * 1.5;
    }
    ctx.strokeStyle = mongeLineColor;
    ctx.lineWidth = mongeLineStrokeWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(geometry.mongeLine.p1.x, geometry.mongeLine.p1.y);
    ctx.lineTo(geometry.mongeLine.p2.x, geometry.mongeLine.p2.y);
    ctx.stroke();

    // Outer glow halo
    if (glowIntensity > 0) {
      ctx.strokeStyle = mongeLineColor;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = mongeLineStrokeWidth * (1.5 + glowIntensity * 0.1);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. The Three Circles
  for (const circle of geometry.circles) {
    ctx.save();
    // Fill with opacity
    ctx.fillStyle = circle.color;
    ctx.globalAlpha = circleFillOpacity;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.fill();

    // Stroke with glow
    if (glowIntensity > 0) {
      ctx.shadowColor = circle.color;
      ctx.shadowBlur = glowIntensity;
    }
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = circle.color;
    ctx.lineWidth = circleStrokeWidth;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.stroke();

    // Center point
    if (showPoints) {
      ctx.fillStyle = circle.color;
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. External Homothetic Centers (Points P12, P23, P31)
  if (showPoints) {
    const extCenters = [
      { pt: geometry.externalCenters.p12, label: "P₁₂" },
      { pt: geometry.externalCenters.p23, label: "P₂₃" },
      { pt: geometry.externalCenters.p31, label: "P₃₁" },
    ];

    for (const item of extCenters) {
      if (!item.pt) continue;
      ctx.save();
      if (glowIntensity > 0) {
        ctx.shadowColor = mongeLineColor;
        ctx.shadowBlur = glowIntensity;
      }
      // Outer ring
      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = mongeLineColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(item.pt.x, item.pt.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = mongeLineColor;
      ctx.beginPath();
      ctx.arc(item.pt.x, item.pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 7. Labels
  if (showLabels) {
    ctx.save();
    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Circle Labels
    geometry.circles.forEach((circle, idx) => {
      const labelText = `C${idx + 1}`;
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.roundRect(
        circle.x - fontSize * 1.2,
        circle.y - circle.r - fontSize * 1.6,
        fontSize * 2.4,
        fontSize * 1.3,
        4
      );
      ctx.fill();
      ctx.strokeStyle = circle.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = circle.color;
      ctx.fillText(
        labelText,
        circle.x,
        circle.y - circle.r - fontSize * 0.95
      );
      ctx.restore();
    });

    // Point Labels
    if (showPoints) {
      const extCenters = [
        { pt: geometry.externalCenters.p12, label: "P₁₂" },
        { pt: geometry.externalCenters.p23, label: "P₂₃" },
        { pt: geometry.externalCenters.p31, label: "P₃₁" },
      ];

      for (const item of extCenters) {
        if (!item.pt) continue;
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.beginPath();
        ctx.roundRect(
          item.pt.x + 10,
          item.pt.y - fontSize * 0.8,
          fontSize * 2.2,
          fontSize * 1.2,
          4
        );
        ctx.fill();
        ctx.strokeStyle = mongeLineColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = mongeLineColor;
        ctx.fillText(
          item.label,
          item.pt.x + 10 + fontSize * 1.1,
          item.pt.y - fontSize * 0.2
        );
        ctx.restore();
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Interactive SVG/Canvas product component for Toolcraft scene.canvasContent.
 */
export function MongeCanvas(): React.ReactElement {
  const values = useToolcraftEvaluatedValues();
  const parsed = getMongeConfigFromValues(values);
  const geometry = computeMongeGeometry(parsed.config);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // High-DPI canvas rendering for the live preview
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1920;
    const height = 1080;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    drawMongeSceneToCanvas(ctx, geometry, {
      circleStrokeWidth: parsed.circleStrokeWidth,
      circleFillOpacity: parsed.circleFillOpacity,
      tangentStrokeWidth: parsed.tangentStrokeWidth,
      mongeLineStrokeWidth: parsed.mongeLineStrokeWidth,
      tangentColor: parsed.tangentColor,
      mongeLineColor: parsed.mongeLineColor,
      glowIntensity: parsed.glowIntensity,
      showMongeLine: parsed.showMongeLine,
      showExternalTangents: parsed.showExternalTangents,
      showInternalTangents: parsed.showInternalTangents,
      showCenterLines: parsed.showCenterLines,
      showLabels: parsed.showLabels,
      showPoints: parsed.showPoints,
      fontSize: parsed.fontSize,
      labelColor: parsed.labelColor,
    });
  }, [geometry, parsed]);

  return (
    <div
      data-toolcraft-product-output="true"
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        pointerEvents: "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
