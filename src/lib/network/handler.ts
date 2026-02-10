import type { ServerMessage } from "./messages";
import { lobbyStore } from "$lib/stores/lobby.svelte";
import { gameStore } from "$lib/stores/game.svelte";
import { authStore } from "$lib/stores/auth.svelte";
import { routerStore } from "$lib/stores/router.svelte";

// Event emitter for Phaser-bound events (game_state, enemy_spawn, etc.)
type GameEventHandler = (message: ServerMessage) => void;
const gameEventHandlers: Set<GameEventHandler> = new Set();

export function onGameEvent(handler: GameEventHandler): () => void {
  gameEventHandlers.add(handler);
  return () => gameEventHandlers.delete(handler);
}

function emitGameEvent(msg: ServerMessage): void {
  gameEventHandlers.forEach((h) => h(msg));
}

function getName(playerId: string): string {
  return lobbyStore.getPlayerName(playerId);
}

/**
 * Central message dispatcher. Called for every message from the server.
 */
export function handleServerMessage(msg: ServerMessage): void {
  switch (msg.type) {
    // ── Connection ──────────────────────────────────
    case "connected":
      lobbyStore.setConnectedPlayer(msg.player_id);
      gameStore.wsConnected = true;
      gameStore.serverTick = msg.server_tick;
      console.log(`[NET] Connected as ${msg.player_id} at tick ${msg.server_tick}`);
      break;

    case "error":
      console.error(`[NET] Server error: ${msg.code} ${msg.message}`);
      lobbyStore.addSystemMessage(`Error: ${msg.message}`);
      break;

    // ── Lobby ───────────────────────────────────────
    case "player_joined":
      lobbyStore.addPlayer({
        id: msg.player_id,
        name: msg.player_name,
        avatar_id: "avatar_01",
        ready: false,
      });
      lobbyStore.addSystemMessage(`${msg.player_name} joined the room`);
      break;

    case "player_left": {
      const leftName = getName(msg.player_id);
      lobbyStore.removePlayer(msg.player_id);
      lobbyStore.addSystemMessage(`${leftName} left the room`);
      break;
    }

    case "player_ready_state":
      lobbyStore.setPlayerReady(msg.player_id, msg.ready);
      break;

    case "lobby_state":
      lobbyStore.players = msg.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar_id: p.avatar_id,
        ready: p.ready,
      }));
      // Sync name map
      for (const p of msg.players) {
        lobbyStore.playerNames[p.id] = p.name;
      }
      break;

    case "chat_broadcast":
      lobbyStore.addChatMessage(msg.player_id, msg.message);
      break;

    // ── Game Start ──────────────────────────────────
    case "game_start":
      gameStore.phase = "countdown";
      gameStore.round = msg.round;
      gameStore.addKillFeed(`Round ${msg.round} starting!`, "info");
      routerStore.navigate("game");
      emitGameEvent(msg);
      break;

    // ── Game State (20Hz tick) ──────────────────────
    case "game_state": {
      gameStore.timeLeft = msg.time_left;
      gameStore.serverTick = msg.tick;

      const myId = authStore.player?.id;
      const me = msg.players.find((p) => p.id === myId);
      if (me) {
        gameStore.health = me.health;
      }

      gameStore.playersAlive = msg.players.filter(
        (p) => p.state !== "dead"
      ).length;
      gameStore.totalPlayers = msg.players.length;

      emitGameEvent(msg);
      break;
    }

    // ── Game Events ─────────────────────────────────
    case "player_hit":
      if (msg.player_id === authStore.player?.id) {
        gameStore.health = msg.health;
      }
      emitGameEvent(msg);
      break;

    case "player_death": {
      const deadName = getName(msg.player_id);
      if (msg.player_id === authStore.player?.id) {
        gameStore.phase = "death";
        gameStore.health = 0;
        gameStore.addKillFeed("You died!", "death");
      } else {
        gameStore.addKillFeed(`${deadName} was eliminated`, "death");
      }
      emitGameEvent(msg);
      break;
    }

    case "player_respawn":
      if (msg.player_id === authStore.player?.id) {
        gameStore.phase = "playing";
        gameStore.addKillFeed("You respawned!", "info");
      }
      emitGameEvent(msg);
      break;

    case "enemy_spawn":
      emitGameEvent(msg);
      break;

    case "enemy_death": {
      const killerName = getName(msg.killed_by);
      gameStore.addKillFeed(`${killerName} killed a ${msg.enemy_id.split("_")[0] ?? "enemy"}`, "kill");
      emitGameEvent(msg);
      break;
    }

    case "item_spawn":
      emitGameEvent(msg);
      break;

    case "item_pickup": {
      const pickerName = getName(msg.player_id);
      if (msg.player_id === authStore.player?.id) {
        gameStore.addKillFeed(`Picked up ${msg.item_id}`, "pickup");
      } else {
        gameStore.addKillFeed(`${pickerName} picked up ${msg.item_id}`, "pickup");
      }
      emitGameEvent(msg);
      break;
    }

    // ── Round Flow ──────────────────────────────────
    case "round_end":
      gameStore.phase = "shop";
      gameStore.addKillFeed("Round over! Shop time.", "info");
      emitGameEvent(msg);
      break;

    case "shop_open":
      gameStore.shopItems = msg.available_items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        cost: item.cost,
      }));
      break;

    case "buy_result":
      if (msg.success) {
        gameStore.gold = msg.gold_left;
        gameStore.addKillFeed(`Purchased ${msg.item_id}`, "pickup");
      } else {
        gameStore.addKillFeed("Not enough gold!", "info");
      }
      break;

    case "round_start_countdown":
      gameStore.phase = "countdown";
      gameStore.countdownSeconds = msg.seconds;
      emitGameEvent(msg);
      break;

    case "game_over":
      gameStore.phase = "game_over";
      gameStore.finalStats = msg.final_stats;
      routerStore.navigate("results");
      break;

    default:
      console.warn("[NET] Unknown message type:", (msg as ServerMessage).type);
  }
}
