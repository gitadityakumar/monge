import { describe, expect, it } from "vitest";

import {
  appAcceptance,
  appControlSectionInventory,
  validateProductAcceptanceCoverage,
} from "./app-acceptance";
import { appPerformance } from "./app-performance";
import { appSchema } from "./app-schema";

describe("appSchema", () => {
  it("publishes the Monge theorem product contract", () => {
    expect(appSchema.canvas.draggable).toBe(true);
    expect(appSchema.canvas.enabled).toBe(true);
    expect(appSchema.canvas.sizing).toEqual({
      defaultMode: "finite",
      mode: "editable-output",
    });
    expect(appSchema.panels.controls?.sections[1]?.title).toBe("Settings");
    expect(
      appSchema.panels.controls?.sections[0]?.controls.settingsTransfer,
    ).toMatchObject({
      target: "runtime.settingsTransfer",
      type: "settingsTransfer",
    });
    expect(
      appSchema.panels.controls?.sections[1]?.controls.canvasAspectRatio,
    ).toMatchObject({
      target: "canvas.aspectRatio",
      type: "aspectRatio",
    });
    expect(
      appSchema.panels.controls?.sections[1]?.controls.canvasWidth,
    ).toMatchObject({
      target: "canvas.size.width",
      type: "text",
    });
    expect(
      appSchema.panels.controls?.sections[1]?.controls.canvasHeight,
    ).toMatchObject({
      target: "canvas.size.height",
      type: "text",
    });
    expect(appSchema.panels.layers).toBeUndefined();
    expect(appSchema.panels.timeline).toBeUndefined();
    expect(appSchema.toolbar).toMatchObject({
      history: true,
      radar: true,
      zoom: true,
    });
    expect(appSchema.assembly.components).toEqual([
      "canvas",
      "controlsPanel",
      "toolbar",
    ]);
    expect(appSchema.modulePlan.modules.map(({ id }) => id)).toContain(
      "image-export",
    );
  });

  it("declares the product sections and control inventory", () => {
    const sectionIds = (appSchema.panels.controls?.sections ?? []).map(
      (section) => section.id,
    );

    expect(sectionIds).toContain("circles");
    expect(sectionIds).toContain("geometry");
    expect(sectionIds).toContain("lines");
    expect(sectionIds).toContain("annotations");
    expect(appControlSectionInventory.length).toBeGreaterThan(0);
  });

  it("does not imply timeline behavior before a product needs it", () => {
    expect(appSchema.assembly.capabilities).not.toContain(
      "timeline.playback",
    );
    expect(appSchema.assembly.capabilities).not.toContain(
      "timeline.keyframes",
    );
    expect(appSchema.assembly.commands).not.toContain(
      "timeline.toggleControlKeyframes",
    );
    expect(appSchema.assembly.commands).not.toContain(
      "timeline.moveKeyframe",
    );
  });

  it("configures export long edge in performance envelope", () => {
    expect(appPerformance.workloadEnvelope.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "export-long-edge",
          source: {
            kind: "schema-target",
            target: "export.image.resolution",
          },
        }),
      ]),
    );
  });

  it("declares production reload coverage for the product schema", () => {
    expect(appSchema.persistence.storage).toBe("localStorage");
    if (appSchema.persistence.storage !== "localStorage") {
      throw new Error("Expected localStorage persistence");
    }
    expect(appSchema.persistence.include).toContain("canvas");
    expect(
      appAcceptance.find((entry) => entry.id === "persistence.reload"),
    ).toMatchObject({
      automated: true,
      browser: {
        budget: "extended-io",
        file: "e2e/app-persistence.spec.ts",
      },
      evidence: "persistence-state",
      kind: "runtime",
      persistenceCoverage: "reload",
      persistenceSlices: appSchema.persistence.include,
      target: "canvas.size.width",
    });
    expect(validateProductAcceptanceCoverage()).toEqual([]);
  });
});

