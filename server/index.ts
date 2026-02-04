import { createServer } from "http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LightDuelRoom } from "./rooms/LightDuelRoom";
const port = Number(process.env.PORT ?? 2567);
const httpServer = createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("light_duel", LightDuelRoom);
gameServer.listen(port);

console.log(`Light Duel server listening on ws://localhost:${port}`);
