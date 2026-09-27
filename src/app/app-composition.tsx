import React from "react";
import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { appSchema } from "./app-schema";
import {
  MongeCanvas,
  drawMongeSceneToCanvas,
  getMongeConfigFromValues,
} from "./monge-canvas";
import { computeMongeGeometry } from "./monge-geometry";

export const appComposition = composeToolcraftApp(appSchema, {
  scene: {
    canvasContent: <MongeCanvas />,
    sceneBoundsProvider: () => [
      { x: -960, y: -540, width: 1920, height: 1080 },
    ],
    rasterFrameRenderer: {
      baseFileName: "monge-theorem",
      renderFrame: ({ context, frame, state }) => {
        const parsed = getMongeConfigFromValues(
          state.values as Record<string, unknown>
        );
        const geometry = computeMongeGeometry(parsed.config);
        context.save();
        if (frame) {
          context.translate(frame.x, frame.y);
        }
        drawMongeSceneToCanvas(context, geometry, {
          circleStrokeWidth: parsed.circleStrokeWidth,
          circleFillOpacity: parsed.circleFillOpacity,
          tangentStrokeWidth: parsed.tangentStrokeWidth,
          mongeLineStrokeWidth: parsed.mongeLineStrokeWidth,
          tangentColor: parsed.tangentColor,
          mongeLineColor: parsed.mongeLineColor,
          showMongeLine: parsed.showMongeLine,
          showExternalTangents: parsed.showExternalTangents,
          showInternalTangents: parsed.showInternalTangents,
          showCenterLines: parsed.showCenterLines,
          showLabels: parsed.showLabels,
          showPoints: parsed.showPoints,
          fontSize: parsed.fontSize,
          labelColor: parsed.labelColor,
          scale: 1,
        });
        context.restore();
      },
    },
  },
});

