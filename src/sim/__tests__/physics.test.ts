import { stepPhysics } from "../physics";
import { vec2 } from "../math";

test("physics updates heading and position with turn inertia", () => {
  const result = stepPhysics({
    pos: vec2(0, 0),
    heading: 0,
    turnVel: 0,
    input: 1,
    dt: 1 / 60,
    speed: 18,
    turnRate: 2.4,
    inertia: 0.18,
  });

  expect(result.pos.x).toBeGreaterThan(0);
  expect(result.heading).toBeGreaterThan(0);
});
