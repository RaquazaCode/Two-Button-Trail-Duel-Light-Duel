import { Room, type Client } from "colyseus";
import { CONFIG } from "../../src/sim/config";
import { stepWorld } from "../../src/sim/step";
import type { WorldState } from "../../src/sim/types";
import { coerceInput, type InputMessage } from "../inputs";
import { buildSnapshot, createWorld } from "../simAdapter";

const SNAPSHOT_HZ = 20;

export class LightDuelRoom extends Room {
  private world: WorldState = createWorld([]);
  private tick = 0;
  private inputBySession = new Map<string, -1 | 0 | 1>();
  private snapshotAccumulator = 0;

  onCreate() {
    this.setSimulationInterval(
      (dtMs) => this.updateWorld(dtMs / 1000),
      1000 / CONFIG.simHz
    );

    this.onMessage("input", (client, message: InputMessage) => {
      this.inputBySession.set(client.sessionId, coerceInput(message));
    });
  }

  onJoin(client: Client) {
    this.inputBySession.set(client.sessionId, 0);
    this.resetWorld();
  }

  onLeave(client: Client) {
    this.inputBySession.delete(client.sessionId);
    this.resetWorld();
  }

  private resetWorld() {
    this.world = createWorld(
      this.clients.map((client) => client.sessionId),
      0
    );
    this.tick = 0;
    this.snapshotAccumulator = 0;
  }

  private updateWorld(dt: number) {
    if (this.world.players.length === 0) return;

    const inputs: Record<string, -1 | 0 | 1> = {};
    this.inputBySession.forEach((input, id) => {
      inputs[id] = input;
    });

    this.world = stepWorld(this.world, inputs, dt);
    this.tick += 1;

    this.snapshotAccumulator += dt;
    if (this.snapshotAccumulator >= 1 / SNAPSHOT_HZ) {
      this.snapshotAccumulator = 0;
      this.broadcast("snapshot", buildSnapshot(this.world, this.tick));
    }
  }
}
