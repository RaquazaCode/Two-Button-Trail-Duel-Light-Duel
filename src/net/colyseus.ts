import { Client } from "colyseus.js";
import type { ServerSnapshot } from "../sim/types";
import { inputToMessage } from "./messages";

export type LightDuelConnection = {
  sendInput: (input: -1 | 0 | 1) => void;
  leave: () => Promise<void>;
};

export const connectLightDuel = async (args: {
  url: string;
  onSnapshot: (snapshot: ServerSnapshot) => void;
  onLeave?: () => void;
}): Promise<LightDuelConnection> => {
  const client = new Client(args.url);
  const room = await client.joinOrCreate("light_duel");

  room.onMessage("snapshot", (snapshot: ServerSnapshot) => {
    args.onSnapshot(snapshot);
  });

  room.onLeave(() => {
    args.onLeave?.();
  });

  return {
    sendInput: (input) => room.send("input", inputToMessage(input)),
    leave: async () => {
      await room.leave();
    },
  };
};
