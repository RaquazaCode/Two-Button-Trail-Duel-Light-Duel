import { assignBotRoles, getHunterCount } from "../botRoles";

const makeRng = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

test("assignBotRoles selects expected hunter counts by difficulty", () => {
  const ids = ["b1", "b2", "b3", "b4", "b5", "b6", "b7"];
  const rng = makeRng(42);

  const easy = assignBotRoles(ids, "EASY", rng);
  const medium = assignBotRoles(ids, "MEDIUM", rng);
  const hard = assignBotRoles(ids, "HARD", rng);

  const countHunters = (map: Map<string, string>) =>
    [...map.values()].filter((role) => role === "HUNTER").length;

  expect(countHunters(easy)).toBe(getHunterCount("EASY"));
  expect(countHunters(medium)).toBe(getHunterCount("MEDIUM"));
  expect(countHunters(hard)).toBe(getHunterCount("HARD"));
});
