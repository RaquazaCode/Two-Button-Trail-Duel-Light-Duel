import { CONFIG } from "./config";
import { stepPhysics } from "./physics";
import { updateTrail } from "./trails";
import { intersectsAny, outOfBounds } from "./collision";
import { arenaHalfAt } from "./shrink";
import { resolveElimination } from "./match";
import type { WorldState } from "./types";

export const stepWorld = (
  world: WorldState,
  inputs: Record<string, -1 | 0 | 1>,
  dt: number
): WorldState => {
  const time = world.time + dt;
  const arenaHalf = arenaHalfAt(
    time,
    CONFIG.arenaSize / 2,
    CONFIG.shrinkStart,
    CONFIG.shrinkEnd,
    CONFIG.shrinkTo
  );
  const trails = [...world.trails];

  const players = world.players.map((p) => {
    if (!p.alive) return p;
    const input = inputs[p.id] ?? 0;
    const phys = stepPhysics({
      pos: p.pos,
      heading: p.heading,
      turnVel: p.turnVel,
      input,
      dt,
      speed: CONFIG.speed,
      turnRate: CONFIG.turnRate,
      inertia: CONFIG.turnInertia,
    });

    const trailRes = updateTrail({
      prev: p.pos,
      next: phys.pos,
      time,
      gapOn: CONFIG.gapOn,
      gapOff: CONFIG.gapOff,
      solidifyDelay: CONFIG.solidifyDelay,
      state: { gapTimer: p.gapTimer, gapOnState: p.gapOn, trailId: p.trailId },
      owner: p.id,
      trails,
    });

    const hit =
      outOfBounds(phys.pos, arenaHalf) || intersectsAny(p.pos, phys.pos, trails, time);

    return resolveElimination({
      player: {
        ...p,
        pos: phys.pos,
        heading: phys.heading,
        turnVel: phys.turnVel,
        gapTimer: trailRes.gapTimer,
        gapOn: trailRes.gapOnState,
        trailId: trailRes.trailId ?? p.trailId,
      },
      hit,
      time,
    });
  });

  return { ...world, time, arenaHalf, players, trails };
};
