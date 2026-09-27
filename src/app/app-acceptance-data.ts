import type {
  ToolcraftControlSectionInventoryEntry,
  ToolcraftProductReadiness,
  ToolcraftTransferMode,
} from "./acceptance/types";

export const appTransferMode: ToolcraftTransferMode = {
  animationIntent: { mode: "none" },
  mode: "new-toolcraft-app",
  referenceInputs: [],
};

export const appProductReadiness: ToolcraftProductReadiness = {
  exportIntent: {
    image: {
      evidence: {
        messageRef: "initial-user-prompt",
        messageText:
          "Create an interactive editor for Monge's theorem where I can control the thickness of circles, thickness of lines, distance between circles, color of circles, color of lines, thickness of lines, and make sure it can export the created figure into high-quality image. If it is possible, make sure it can export it into 4K.",
        quote:
          "export the created figure into high-quality image. If it is possible, make sure it can export it into 4K.",
        source: "user-message",
      },
      mode: "user-requested",
    },
    svg: { mode: "not-requested" },
    video: { mode: "not-requested" },
  },
  interactionOwnership: [
    {
      alternative: {
        reason:
          "Direct canvas dragging for circle thickness would lack numerical precision and clutter the geometric diagram.",
        surface: "canvas",
      },
      capability: "precise-value-entry",
      evidence: {
        detail:
          "User explicitly requested circle thickness control via interactive panel slider.",
        source: "user-request",
      },
      id: "circle-stroke-width",
      reason:
        "The controls panel slider provides precise numerical stroke width entry for circle boundaries.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "circles.strokeWidth",
    },
    {
      alternative: {
        reason:
          "Direct canvas gestures for line thickness would obscure geometric tangent line alignment.",
        surface: "canvas",
      },
      capability: "precise-value-entry",
      evidence: {
        detail:
          "User explicitly requested line thickness control via interactive panel slider.",
        source: "user-request",
      },
      id: "tangent-stroke-width",
      reason:
        "The controls panel slider provides precise numerical stroke width entry for tangent lines.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "lines.tangentStrokeWidth",
    },
    {
      alternative: {
        reason:
          "Direct canvas gestures for distance scaling would conflict with canvas viewport panning and zooming.",
        surface: "canvas",
      },
      capability: "precise-value-entry",
      evidence: {
        detail:
          "User explicitly requested distance between circles control via interactive panel slider.",
        source: "user-request",
      },
      id: "distance-scale",
      reason:
        "The controls panel slider provides continuous and precise scaling of the distance between circle centers.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "geometry.distanceScale",
    },
    {
      alternative: {
        reason:
          "Canvas color sampling would require extra canvas overlay chrome instead of direct palette selection.",
        surface: "canvas",
      },
      capability: "property-edit",
      evidence: {
        detail:
          "User explicitly requested circle color control via interactive panel color picker.",
        source: "user-request",
      },
      id: "circle-color-1",
      reason:
        "The controls panel provides accessible hex and swatch color editing for Circle A.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "circles.color1",
    },
    {
      alternative: {
        reason:
          "Canvas color sampling would require extra canvas overlay chrome instead of direct palette selection.",
        surface: "canvas",
      },
      capability: "property-edit",
      evidence: {
        detail:
          "User explicitly requested line color control via interactive panel color picker.",
        source: "user-request",
      },
      id: "tangent-color",
      reason:
        "The controls panel provides accessible hex and swatch color editing for tangent lines.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "lines.tangentColor",
    },
    {
      alternative: {
        reason:
          "Canvas gestures cannot intuitively control optical glow blur radius without obscuring geometric tangent lines.",
        surface: "canvas",
      },
      capability: "precise-value-entry",
      evidence: {
        detail:
          "User explicitly requested glow value control for lines, circles, and geometry.",
        source: "user-request",
      },
      id: "glow-intensity",
      reason:
        "The controls panel slider provides precise numerical glow blur entry for diagram elements.",
      selectionScope: { mode: "global" },
      surface: "panel",
      target: "lines.glowIntensity",
    },
  ],
  mode: "product",
  productName: "Monge's Theorem Studio",
  productSummary:
    "An interactive mathematical geometry diagram illustrating Monge's Circle Theorem with configurable circles, common bitangents, homothetic centers, and collinear line, supporting 4K raster export.",
  requestedBehavior:
    "Control thickness of circles and lines, distance between circles, colors of circles and lines, and export the collinear geometry into a 4K image.",
  viewInteraction: {
    mode: "non-spatial",
    reason:
      "Monge's theorem is a planar 2D Euclidean geometry visualization where all geometric entities exist on a 2D plane.",
  },
};

export const appControlSectionInventory: readonly ToolcraftControlSectionInventoryEntry[] =
  [
    {
      entity: "Canvas background",
      entityId: "background",
      finiteSelectors: [
        {
          affectedTargets: ["appearance.background"],
          reason:
            "Background inclusion determines whether its color affects output.",
          role: "branch",
          target: "export.includeBackground",
        },
      ],
      groupingReason:
        "Inclusion toggle and background fill color define canvas and export background.",
      id: "background",
      targets: ["export.includeBackground", "appearance.background"],
      title: "Background",
    },
    {
      entity: "Circle appearance and size",
      entityId: "circles",
      finiteSelectors: [],
      groupingReason:
        "Stroke thickness, fill opacity, palette colors, and individual radii define the three circles.",
      id: "circles",
      targets: [
        "circles.strokeWidth",
        "circles.fillOpacity",
        "circles.color1",
        "circles.color2",
        "circles.color3",
        "circles.radius1",
        "circles.radius2",
        "circles.radius3",
      ],
      title: "Circles",
    },
    {
      entity: "Circle geometry layout",
      entityId: "geometry",
      finiteSelectors: [
        {
          reason:
            "Layout preset changes spatial distribution of circle centers.",
          role: "parameter",
          target: "geometry.layoutPreset",
        },
      ],
      groupingReason:
        "Distance scale and spatial preset determine circle positions and relative geometry.",
      id: "geometry",
      targets: ["geometry.distanceScale", "geometry.layoutPreset"],
      title: "Geometry",
    },
    {
      entity: "Tangent and Monge lines",
      entityId: "lines",
      finiteSelectors: [
        {
          reason: "Toggles rendering of Monge's theorem collinear line.",
          role: "parameter",
          target: "lines.showMongeLine",
        },
        {
          reason: "Toggles rendering of external common tangents.",
          role: "parameter",
          target: "lines.showExternalTangents",
        },
        {
          reason: "Toggles rendering of internal common tangents.",
          role: "parameter",
          target: "lines.showInternalTangents",
        },
        {
          reason: "Toggles rendering of dashed lines connecting circle centers.",
          role: "parameter",
          target: "lines.showCenterLines",
        },
      ],
      groupingReason:
        "Line styles and visibility toggles define the tangents, center lines, and Monge collinear line.",
      id: "lines",
      targets: [
        "lines.tangentStrokeWidth",
        "lines.mongeLineStrokeWidth",
        "lines.tangentColor",
        "lines.mongeLineColor",
        "lines.glowIntensity",
        "lines.showMongeLine",
        "lines.showExternalTangents",
        "lines.showInternalTangents",
        "lines.showCenterLines",
      ],
      title: "Lines",
    },
    {
      entity: "Diagram annotations and labels",
      entityId: "annotations",
      finiteSelectors: [
        {
          reason: "Toggles circle and point text labels.",
          role: "parameter",
          target: "annotations.showLabels",
        },
        {
          reason: "Toggles center and intersection marker dots.",
          role: "parameter",
          target: "annotations.showPoints",
        },
      ],
      groupingReason:
        "Label typography, color, and indicator points annotate geometric features and vertices.",
      id: "annotations",
      targets: [
        "annotations.showLabels",
        "annotations.showPoints",
        "annotations.fontSize",
        "annotations.labelColor",
      ],
      title: "Annotations",
    },
    {
      entity: "Image delivery",
      entityId: "image-delivery",
      finiteSelectors: [
        {
          reason: "Image format changes its own exported artifact encoding.",
          role: "parameter",
          target: "export.image.format",
        },
        {
          reason:
            "Image resolution changes its own exported artifact dimensions.",
          role: "parameter",
          target: "export.image.resolution",
        },
      ],
      groupingReason:
        "Format and resolution jointly configure the exported Monge theorem image.",
      id: "runtime.image-export",
      targets: ["export.image.format", "export.image.resolution"],
      title: "Image Export",
    },
  ];

export { appAcceptance } from "./app-acceptance-matrix";
