import { getPlayerColor } from "../render/palette";
import type { Vec2 } from "../sim/math";
import type { WorldState } from "../sim/types";

type MinimapPoint = Vec2;

export const worldToMinimap = (pos: Vec2, arenaHalf: number): MinimapPoint => {
  if (arenaHalf <= 0) return { x: 0, y: 0 };
  return { x: pos.x / arenaHalf, y: pos.y / arenaHalf };
};

const colorToRgba = (color: number, alpha: number) => {
  const hex = color.toString(16).padStart(6, "0");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createMinimap = (container: HTMLElement) => {
  const wrapper = document.createElement("div");
  wrapper.className = "minimap";
  const canvas = document.createElement("canvas");
  wrapper.appendChild(canvas);
  container.appendChild(wrapper);

  const ctx = canvas.getContext("2d");
  const size = 180;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  resize();

  const clear = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
  };

  const trailColorCache = new Map<string, string>();
  let lastUpdateAt = 0;

  const update = (world?: WorldState | null) => {
    if (!ctx) return;
    const now = performance.now();
    if (world && now - lastUpdateAt < 90) return;
    lastUpdateAt = now;
    clear();
    if (!world) return;

    const radius = size * 0.5 - 6;
    const center = size * 0.5;

    ctx.save();
    ctx.translate(center, center);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(6, 12, 18, 0.75)";
    ctx.fill();
    ctx.clip();

    ctx.lineWidth = 1.5;
    const maxTrailDraw = 420;
    const step = Math.max(1, Math.ceil(world.trails.length / maxTrailDraw));
    for (let i = 0; i < world.trails.length; i += step) {
      const trail = world.trails[i];
      const start = worldToMinimap(trail.start, world.arenaHalf);
      const end = worldToMinimap(trail.end, world.arenaHalf);
      let stroke = trailColorCache.get(trail.owner);
      if (!stroke) {
        stroke = colorToRgba(getPlayerColor(trail.owner), 0.85);
        trailColorCache.set(trail.owner, stroke);
      }
      ctx.strokeStyle = stroke;
      ctx.beginPath();
      ctx.moveTo(start.x * radius, -start.y * radius);
      ctx.lineTo(end.x * radius, -end.y * radius);
      ctx.stroke();
    }

    world.players.forEach((player) => {
      const point = worldToMinimap(player.pos, world.arenaHalf);
      const sizePx = player.id === "p1" ? 4 : 3;
      if (!player.alive) {
        ctx.strokeStyle = "rgba(255, 60, 60, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(point.x * radius - sizePx, -point.y * radius - sizePx);
        ctx.lineTo(point.x * radius + sizePx, -point.y * radius + sizePx);
        ctx.moveTo(point.x * radius - sizePx, -point.y * radius + sizePx);
        ctx.lineTo(point.x * radius + sizePx, -point.y * radius - sizePx);
        ctx.stroke();
        return;
      }
      ctx.fillStyle = colorToRgba(getPlayerColor(player.id), 1);
      ctx.beginPath();
      ctx.arc(point.x * radius, -point.y * radius, sizePx, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    ctx.strokeStyle = "rgba(0, 245, 255, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  return { update };
};
