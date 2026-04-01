// lib/aftereffects.ts — After Effects ExtendScript Generator

import { CreativeBrief, Platform, PLATFORM_DIMENSIONS } from "./types"

/**
 * Generate an After Effects ExtendScript (.jsx) file
 * that creates a composition with the campaign assets.
 */
export function generateAEScript(
  brief: CreativeBrief,
  platform: Platform,
  heroImagePath: string
): string {
  const dims = PLATFORM_DIMENSIONS[platform]
  const fps = 30
  const duration = brief.durationSeconds || 15

  return `// AdGenAI — Auto-generated After Effects ExtendScript
// Brand: ${brief.brand}
// Platform: ${dims.label} (${dims.width}x${dims.height})
// Duration: ${duration}s
// Generated: ${new Date().toISOString()}

(function() {
  app.beginUndoGroup("AdGenAI Campaign");

  // Create composition
  var comp = app.project.items.addComp(
    "${brief.brand} — ${dims.label}",
    ${dims.width},
    ${dims.height},
    1, // pixel aspect ratio
    ${duration},
    ${fps}
  );

  // ─── Background Layer ─────────────────────────────────
  var bg = comp.layers.addSolid(
    hexToRGB("${brief.colorPalette[0] || "#000000"}"),
    "Background",
    ${dims.width},
    ${dims.height},
    1
  );

  // ─── Hero Image ───────────────────────────────────────
  try {
    var heroFile = new File("${heroImagePath}");
    if (heroFile.exists) {
      var heroImport = app.project.importFile(new ImportOptions(heroFile));
      var heroLayer = comp.layers.add(heroImport);
      heroLayer.name = "Hero Image";

      // Scale to fit comp
      var scaleFactor = Math.max(
        ${dims.width} / heroLayer.source.width,
        ${dims.height} / heroLayer.source.height
      ) * 100;
      heroLayer.transform.scale.setValue([scaleFactor, scaleFactor]);

      // Fade in
      heroLayer.transform.opacity.setValueAtTime(0, 0);
      heroLayer.transform.opacity.setValueAtTime(1, 100);
    }
  } catch(e) {
    // Hero image not found — continue with solid background
  }

  // ─── Headline Text ────────────────────────────────────
  var headlineLayer = comp.layers.addText("${escapeAE(brief.headline)}");
  headlineLayer.name = "Headline";
  var headlineDoc = headlineLayer.sourceText.value;
  headlineDoc.fontSize = ${Math.round(dims.width * 0.06)};
  headlineDoc.fillColor = hexToRGB("${brief.colorPalette[1] || "#FFFFFF"}");
  headlineDoc.font = "Arial-BoldMT";
  headlineDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
  headlineLayer.sourceText.setValue(headlineDoc);

  // Position headline
  headlineLayer.transform.position.setValue([${dims.width / 2}, ${dims.height * 0.35}]);

  // Animate headline — slide up + fade in
  headlineLayer.transform.position.setValueAtTime(0.5, [${dims.width / 2}, ${dims.height * 0.4}]);
  headlineLayer.transform.position.setValueAtTime(1.2, [${dims.width / 2}, ${dims.height * 0.35}]);
  headlineLayer.transform.opacity.setValueAtTime(0.5, 0);
  headlineLayer.transform.opacity.setValueAtTime(1.2, 100);

  // ─── Subheadline Text ─────────────────────────────────
  var subLayer = comp.layers.addText("${escapeAE(brief.subheadline)}");
  subLayer.name = "Subheadline";
  var subDoc = subLayer.sourceText.value;
  subDoc.fontSize = ${Math.round(dims.width * 0.035)};
  subDoc.fillColor = hexToRGB("${brief.colorPalette[1] || "#FFFFFF"}");
  subDoc.font = "ArialMT";
  subDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
  subLayer.sourceText.setValue(subDoc);
  subLayer.transform.position.setValue([${dims.width / 2}, ${dims.height * 0.45}]);

  // Animate subheadline
  subLayer.transform.opacity.setValueAtTime(1.0, 0);
  subLayer.transform.opacity.setValueAtTime(1.8, 100);

  // ─── CTA Button ───────────────────────────────────────
  var ctaBg = comp.layers.addSolid(
    hexToRGB("${brief.colorPalette[2] || brief.colorPalette[0] || "#0066FF"}"),
    "CTA Background",
    ${Math.round(dims.width * 0.4)},
    ${Math.round(dims.height * 0.06)},
    1
  );
  ctaBg.transform.position.setValue([${dims.width / 2}, ${dims.height * 0.75}]);

  var ctaLayer = comp.layers.addText("${escapeAE(brief.cta)}");
  ctaLayer.name = "CTA";
  var ctaDoc = ctaLayer.sourceText.value;
  ctaDoc.fontSize = ${Math.round(dims.width * 0.03)};
  ctaDoc.fillColor = hexToRGB("#FFFFFF");
  ctaDoc.font = "Arial-BoldMT";
  ctaDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
  ctaLayer.sourceText.setValue(ctaDoc);
  ctaLayer.transform.position.setValue([${dims.width / 2}, ${dims.height * 0.75}]);

  // CTA pop-in animation
  ctaBg.transform.scale.setValueAtTime(${duration - 5}, [0, 0]);
  ctaBg.transform.scale.setValueAtTime(${duration - 4}, [105, 105]);
  ctaBg.transform.scale.setValueAtTime(${duration - 3.8}, [100, 100]);
  ctaLayer.transform.opacity.setValueAtTime(${duration - 4.5}, 0);
  ctaLayer.transform.opacity.setValueAtTime(${duration - 3.8}, 100);

  // ─── Legal Disclaimer ─────────────────────────────────
  ${brief.legalDisclaimer ? `
  var legalLayer = comp.layers.addText("${escapeAE(brief.legalDisclaimer)}");
  legalLayer.name = "Legal";
  var legalDoc = legalLayer.sourceText.value;
  legalDoc.fontSize = ${Math.round(dims.width * 0.015)};
  legalDoc.fillColor = hexToRGB("#999999");
  legalDoc.font = "ArialMT";
  legalLayer.sourceText.setValue(legalDoc);
  legalLayer.transform.position.setValue([${dims.width / 2}, ${dims.height * 0.95}]);
  ` : "// No legal disclaimer for this brief"}

  app.endUndoGroup();
  alert("AdGenAI composition created successfully!");

  // ─── Utility ──────────────────────────────────────────
  function hexToRGB(hex) {
    hex = hex.replace("#", "");
    return [
      parseInt(hex.substr(0, 2), 16) / 255,
      parseInt(hex.substr(2, 2), 16) / 255,
      parseInt(hex.substr(4, 2), 16) / 255,
    ];
  }
})();
`
}

/** Escape string for After Effects ExtendScript */
function escapeAE(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
}
