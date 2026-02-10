import type { ClientMessage, ServerMessage } from "./messages";
import { gameStore } from "$lib/stores/game.svelte";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";
export type MessageHandler = (message: ServerMessage) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

const HEARTBEAT_INTERVAL = 15_000;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000];
const MAX_RECONNECT_ATTEMPTS = 10;

class SocketManager {
  private ws: WebSocket | null = null;
  private url: string = "";
  private handlers: Set<MessageHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempt: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose: boolean = false;
  private lastPingSent: number = 0;

  state: ConnectionState = "disconnected";
  lastError: string = "";
  latencyMs: number = 0;

  connect(roomCode: string, token: string): void {
    this.intentionalClose = false;
    this.reconnectAttempt = 0;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
    this.url = `${wsProtocol}//${wsHost}/ws/${roomCode}?token=${token}`;

    this.doConnect();
  }

  private doConnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    this.setState(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.setState("connected");
        gameStore.wsConnected = true;
        this.reconnectAttempt = 0;
        this.lastError = "";
        this.startHeartbeat();
        console.log("[WS] Connected");
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === "string"
            ? event.data
            : new TextDecoder().decode(event.data);

          const msg: ServerMessage = JSON.parse(raw);

          // Handle pong for latency
          if ((msg as unknown as Record<string, unknown>).type === "pong") {
            this.latencyMs = Date.now() - this.lastPingSent;
            return;
          }

          this.handlers.forEach((handler) => handler(msg));
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.stopHeartbeat();
        this.setState("disconnected");
        gameStore.wsConnected = false;
        console.log(`[WS] Closed: ${event.code} ${event.reason}`);

        if (!this.intentionalClose && this.reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.lastError = "Connection error";
        console.error("[WS] Error");
      };
    } catch {
      this.lastError = "Failed to connect";
      this.setState("disconnected");
    }
  }

  send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.stopHeartbeat();
    this.cancelReconnect();

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.setState("disconnected");
    gameStore.wsConnected = false;
    console.log("[WS] Disconnected (intentional)");
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.state === "connected";
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.stateHandlers.forEach((h) => h(state));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastPingSent = Date.now();
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.cancelReconnect();

    const delay =
      RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt++;
      this.doConnect();
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const socket = new SocketManager();
