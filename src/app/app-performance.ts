import {
  defineToolcraftDiscreteFixtureAdapter,
  defineToolcraftPerformance,
  type ToolcraftEnvelopePerformanceConfig,
} from "@/toolcraft/runtime";

const exportLongEdgeFixture = defineToolcraftDiscreteFixtureAdapter({
  dimensionId: "export-long-edge",
  domain: {
    kind: "schema-options",
    optionValues: ["2k", "4k", "8k"],
    target: "export.image.resolution",
  },
  entries: [
    { appliedValue: "2k", value: 2048 },
    { appliedValue: "4k", value: 4096 },
    { appliedValue: "8k", value: 8192 },
  ],
});

export const appPerformance: ToolcraftEnvelopePerformanceConfig =
  defineToolcraftPerformance({
    fixtureAdapters: {
      dimensions: {
        "export-long-edge": exportLongEdgeFixture,
      },
    },
    rendererStrategy: "none",
    scenarios: [],
    usesCustomRenderer: false,
    workloadEnvelope: {
      dimensions: [
        {
          batchMax: 8192,
          customMappingReason:
            "The image resolution option maps to its exact numeric long edge in pixels.",
          defaultValue: 4096,
          id: "export-long-edge",
          mapping: "custom",
          source: {
            kind: "schema-target",
            target: "export.image.resolution",
          },
          unit: "pixels",
        },
      ],
    },
  });

