import type { CircuitConfig, Landmark, LandmarkShape } from './circuits';
import { TIME_PALETTES } from './circuits';

/**
 * Draws the sky gradient + a per-circuit skyline strip at the top of the
 * background canvas. The road is drawn separately by RaceScene (3D).
 */

export function drawSkyline(
  ctx: CanvasRenderingContext2D,
  circuit: CircuitConfig,
  w: number,
  h: number,
) {
  const palette = TIME_PALETTES[circuit.time];

  // Sky gradient.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, palette.skyTop);
  grad.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Star/light sparkle layer for night/dusk.
  if (circuit.time === 'night' || circuit.time === 'dusk') {
    ctx.fillStyle = palette.accent;
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % w;
      const y = (i * 73.2) % (h * 0.7);
      ctx.globalAlpha = 0.25 + Math.random() * 0.5;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;
  }

  // Skyline strip = bottom 60% of the background area.
  const stripTop = h * 0.4;
  const stripHeight = h * 0.6;

  ctx.fillStyle = palette.silhouette;
  for (const lm of circuit.landmarks) {
    drawLandmark(ctx, lm, w, stripTop, stripHeight, palette.accent);
  }
}

const drawLandmark = (
  ctx: CanvasRenderingContext2D,
  lm: Landmark,
  stripW: number,
  baseY: number,
  stripH: number,
  accent: string,
) => {
  const cx = lm.x * stripW;
  const lw = lm.w * stripW;
  const lh = lm.h * stripH;
  const bottomY = baseY + stripH;
  const topY = bottomY - lh;

  // Cache fill style; some shapes use accent (e.g. window dots).
  const silhouette = ctx.fillStyle as string;

  const drawBlock = (x: number, y: number, w: number, h: number) => {
    ctx.fillRect(x, y, w, h);
    // Window dots if tall enough — light specks suggesting office windows.
    if (h > 30) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.35;
      const cols = Math.max(2, Math.floor(w / 6));
      const rows = Math.max(3, Math.floor(h / 8));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.55) continue;
          ctx.fillRect(x + 2 + c * 6, y + 4 + r * 8, 1.8, 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = silhouette;
    }
  };

  switch (lm.shape) {
    case 'block':
      drawBlock(cx - lw / 2, topY, lw, lh);
      break;

    case 'spire': {
      // Tall thin tower with a tapered tip and clock face hint.
      const baseW = lw;
      const baseH = lh * 0.7;
      drawBlock(cx - baseW / 2, bottomY - baseH, baseW, baseH);
      // Spire
      ctx.beginPath();
      ctx.moveTo(cx - baseW / 2, bottomY - baseH);
      ctx.lineTo(cx + baseW / 2, bottomY - baseH);
      ctx.lineTo(cx, topY);
      ctx.closePath();
      ctx.fill();
      // Clock face — small accent disc partway up
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, bottomY - baseH * 0.7, baseW * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = silhouette;
      break;
    }

    case 'eiffel': {
      // 4-tier Eiffel silhouette.
      const t1 = bottomY;
      const t2 = bottomY - lh * 0.4;
      const t3 = bottomY - lh * 0.65;
      const t4 = bottomY - lh * 0.85;
      const t5 = topY;
      ctx.beginPath();
      ctx.moveTo(cx - lw * 0.5, t1);
      ctx.lineTo(cx - lw * 0.32, t2);
      ctx.lineTo(cx - lw * 0.20, t3);
      ctx.lineTo(cx - lw * 0.10, t4);
      ctx.lineTo(cx - lw * 0.04, t5);
      ctx.lineTo(cx + lw * 0.04, t5);
      ctx.lineTo(cx + lw * 0.10, t4);
      ctx.lineTo(cx + lw * 0.20, t3);
      ctx.lineTo(cx + lw * 0.32, t2);
      ctx.lineTo(cx + lw * 0.5, t1);
      ctx.closePath();
      ctx.fill();
      // Arched base
      ctx.fillStyle = '#000';
      ctx.globalAlpha = 0;
      ctx.fillStyle = silhouette;
      break;
    }

    case 'pyramid':
      ctx.beginPath();
      ctx.moveTo(cx - lw / 2, bottomY);
      ctx.lineTo(cx + lw / 2, bottomY);
      ctx.lineTo(cx, topY);
      ctx.closePath();
      ctx.fill();
      break;

    case 'dome': {
      // Base box + dome on top + optional smaller dome flanks (St Basil's style).
      const baseW = lw * 0.6;
      const baseH = lh * 0.6;
      drawBlock(cx - baseW / 2, bottomY - baseH, baseW, baseH);
      ctx.beginPath();
      ctx.arc(cx, bottomY - baseH, baseW / 2, Math.PI, 2 * Math.PI);
      ctx.fill();
      // Spike on top
      ctx.beginPath();
      ctx.moveTo(cx - 2, bottomY - baseH - baseW / 2);
      ctx.lineTo(cx + 2, bottomY - baseH - baseW / 2);
      ctx.lineTo(cx, topY);
      ctx.closePath();
      ctx.fill();
      // Side mini-domes (looks like St Basil's / multi-onion)
      const sideR = baseW * 0.25;
      ctx.beginPath();
      ctx.arc(cx - baseW * 0.6, bottomY - sideR, sideR, Math.PI, 2 * Math.PI);
      ctx.arc(cx + baseW * 0.6, bottomY - sideR, sideR, Math.PI, 2 * Math.PI);
      ctx.fill();
      break;
    }

    case 'twin': {
      const colW = lw * 0.35;
      const gap = lw * 0.1;
      drawBlock(cx - colW - gap / 2, topY, colW, lh);
      drawBlock(cx + gap / 2, topY, colW, lh);
      break;
    }

    case 'pagoda': {
      // 3 stacked tiers, each narrower with flared roof
      const tiers = 3;
      for (let i = 0; i < tiers; i++) {
        const tierH = lh / (tiers + 1);
        const tierW = lw * (1 - i * 0.18);
        const tierY = bottomY - (i + 1) * tierH;
        drawBlock(cx - tierW / 2, tierY, tierW, tierH);
        // Roof eaves — small triangle on top
        ctx.beginPath();
        ctx.moveTo(cx - tierW / 2 - 3, tierY);
        ctx.lineTo(cx + tierW / 2 + 3, tierY);
        ctx.lineTo(cx, tierY - tierH * 0.35);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'bridge': {
      // Suspension bridge: two towers + cable curve
      const tH = lh * 0.85;
      const towerW = lw * 0.08;
      const tx1 = cx - lw / 2 + lw * 0.15;
      const tx2 = cx + lw / 2 - lw * 0.15;
      const towerTop = bottomY - tH;
      drawBlock(tx1 - towerW / 2, towerTop, towerW, tH);
      drawBlock(tx2 - towerW / 2, towerTop, towerW, tH);
      // Deck
      drawBlock(cx - lw / 2, bottomY - lh * 0.18, lw, lh * 0.06);
      // Cables (two arcs)
      ctx.strokeStyle = silhouette;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - lw / 2, bottomY - lh * 0.18);
      ctx.quadraticCurveTo(tx1, bottomY - lh * 0.55, tx1, towerTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx1, towerTop);
      ctx.quadraticCurveTo(cx, bottomY - lh * 0.4, tx2, towerTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx2, towerTop);
      ctx.quadraticCurveTo(tx2, bottomY - lh * 0.55, cx + lw / 2, bottomY - lh * 0.18);
      ctx.stroke();
      break;
    }

    case 'mountain': {
      // Two overlapping triangular peaks
      ctx.beginPath();
      ctx.moveTo(cx - lw / 2, bottomY);
      ctx.lineTo(cx - lw / 6, topY);
      ctx.lineTo(cx + lw / 8, bottomY - lh * 0.7);
      ctx.lineTo(cx + lw * 0.45, bottomY - lh * 0.4);
      ctx.lineTo(cx + lw / 2, bottomY);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'arch': {
      const armW = lw * 0.18;
      const armH = lh;
      const gap = lw * 0.42;
      drawBlock(cx - gap / 2 - armW, bottomY - armH, armW, armH);
      drawBlock(cx + gap / 2, bottomY - armH, armW, armH);
      drawBlock(cx - lw / 2, bottomY - armH, lw, armH * 0.2);
      break;
    }

    case 'opera': {
      // Three sail-shaped curves
      const s = lw / 3;
      for (let i = 0; i < 3; i++) {
        const sx = cx - lw / 2 + s * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(sx - s * 0.45, bottomY);
        ctx.quadraticCurveTo(sx - s * 0.05, topY + lh * 0.1, sx + s * 0.45, bottomY);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'crown': {
      // Tower with stepped pointed crown
      const towerW = lw;
      const towerH = lh * 0.65;
      drawBlock(cx - towerW / 2, bottomY - towerH, towerW, towerH);
      ctx.beginPath();
      ctx.moveTo(cx - towerW / 2, bottomY - towerH);
      ctx.lineTo(cx - towerW / 4, bottomY - lh * 0.85);
      ctx.lineTo(cx, topY);
      ctx.lineTo(cx + towerW / 4, bottomY - lh * 0.85);
      ctx.lineTo(cx + towerW / 2, bottomY - towerH);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'mosque': {
      // Main dome + 2 minarets
      const baseW = lw * 0.6;
      const baseH = lh * 0.45;
      drawBlock(cx - baseW / 2, bottomY - baseH, baseW, baseH);
      ctx.beginPath();
      ctx.arc(cx, bottomY - baseH, baseW * 0.5, Math.PI, 2 * Math.PI);
      ctx.fill();
      // Minarets flanking
      const minW = lw * 0.05;
      const minH = lh * 0.85;
      drawBlock(cx - lw / 2 + minW, bottomY - minH, minW, minH);
      drawBlock(cx + lw / 2 - minW * 2, bottomY - minH, minW, minH);
      // Minaret tops (tiny domes)
      ctx.beginPath();
      ctx.arc(cx - lw / 2 + minW * 1.5, bottomY - minH, minW * 0.9, Math.PI, 2 * Math.PI);
      ctx.arc(cx + lw / 2 - minW * 1.5, bottomY - minH, minW * 0.9, Math.PI, 2 * Math.PI);
      ctx.fill();
      break;
    }

    case 'forbidden': {
      // Long low pavilion with sweeping pagoda-style roof
      const baseH = lh * 0.55;
      drawBlock(cx - lw / 2, bottomY - baseH, lw, baseH);
      // Roof
      ctx.beginPath();
      ctx.moveTo(cx - lw / 2 - 8, bottomY - baseH);
      ctx.quadraticCurveTo(cx, topY, cx + lw / 2 + 8, bottomY - baseH);
      ctx.lineTo(cx + lw / 2, bottomY - baseH);
      ctx.lineTo(cx - lw / 2, bottomY - baseH);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'lotus': {
      // Lotus Temple — 9 petals as arcs around a center
      const r = lw * 0.45;
      const baseY2 = bottomY - lh * 0.1;
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * (r * 0.3);
        ctx.beginPath();
        ctx.moveTo(cx + offset - r * 0.2, baseY2);
        ctx.quadraticCurveTo(cx + offset, baseY2 - lh * 0.9, cx + offset + r * 0.2, baseY2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'wave': {
      // Marina Bay Sands: three towers + horizontal sky-park boat on top
      const towerW = lw * 0.08;
      const towerH = lh * 0.85;
      const t1x = cx - lw * 0.35;
      const t2x = cx;
      const t3x = cx + lw * 0.35;
      drawBlock(t1x - towerW / 2, bottomY - towerH, towerW, towerH);
      drawBlock(t2x - towerW / 2, bottomY - towerH, towerW, towerH);
      drawBlock(t3x - towerW / 2, bottomY - towerH, towerW, towerH);
      // Sky-park (curved roof)
      ctx.beginPath();
      ctx.moveTo(t1x - lw * 0.05, bottomY - towerH);
      ctx.quadraticCurveTo(cx, bottomY - towerH - lh * 0.15, t3x + lw * 0.05, bottomY - towerH);
      ctx.lineTo(t3x + lw * 0.04, bottomY - towerH + 6);
      ctx.quadraticCurveTo(cx, bottomY - towerH - lh * 0.08, t1x - lw * 0.04, bottomY - towerH + 6);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'redeemer': {
      // Tall pedestal + figure with outstretched arms on a peak
      const peakX = cx;
      const peakW = lw * 0.5;
      const peakH = lh * 0.4;
      ctx.beginPath();
      ctx.moveTo(peakX - peakW / 2, bottomY);
      ctx.lineTo(peakX + peakW / 2, bottomY);
      ctx.lineTo(peakX, bottomY - peakH);
      ctx.closePath();
      ctx.fill();
      // Pedestal
      const pedW = lw * 0.08;
      const pedH = lh * 0.2;
      drawBlock(peakX - pedW / 2, bottomY - peakH - pedH, pedW, pedH);
      // Figure body
      const figH = lh * 0.32;
      ctx.fillRect(peakX - 2, bottomY - peakH - pedH - figH, 4, figH);
      // Outstretched arms
      ctx.fillRect(peakX - lw * 0.12, bottomY - peakH - pedH - figH * 0.65, lw * 0.24, 3);
      break;
    }

    case 'colosseum': {
      // Roman arena: arched oval with tiered window-arch hints
      const archW = lw / 6;
      const archH = lh * 0.7;
      const y = bottomY - archH;
      drawBlock(cx - lw / 2, y, lw, archH);
      // Arch hints — bright rectangles suggesting the openings.
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - lw / 2 + 6 + i * archW, y + archH * 0.2, archW * 0.4, archH * 0.3);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = silhouette;
      // Roof brokenness (one side lower)
      ctx.fillRect(cx + lw / 4, y - 4, lw / 4, 8);
      break;
    }

    case 'gate': {
      // Triumphal arch with arched opening + ornate top
      const w = lw;
      const h = lh;
      drawBlock(cx - w / 2, bottomY - h, w, h);
      // Arch opening
      ctx.fillStyle = TIME_PALETTES.day.skyBottom; // a "hole" through the gate
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.18, bottomY);
      ctx.lineTo(cx - w * 0.18, bottomY - h * 0.55);
      ctx.quadraticCurveTo(cx, bottomY - h * 0.85, cx + w * 0.18, bottomY - h * 0.55);
      ctx.lineTo(cx + w * 0.18, bottomY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = silhouette;
      // Crown ornament
      drawBlock(cx - w * 0.25, bottomY - h - 4, w * 0.5, 6);
      break;
    }

    case 'tv-tower': {
      // Tall narrow tower with a sphere/disc halfway up
      const w = lw;
      const h = lh;
      drawBlock(cx - w / 2, bottomY - h, w, h);
      const sphereY = bottomY - h * 0.55;
      ctx.beginPath();
      ctx.arc(cx, sphereY, w * 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Tip
      ctx.beginPath();
      ctx.moveTo(cx - 2, bottomY - h);
      ctx.lineTo(cx + 2, bottomY - h);
      ctx.lineTo(cx, bottomY - h - lh * 0.08);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
};

// Background colour for the road area beneath the skyline strip — picked
// from the time-of-day palette to keep the whole frame coherent.
export const groundColorFor = (circuit: CircuitConfig): string => {
  return TIME_PALETTES[circuit.time].silhouette;
};
