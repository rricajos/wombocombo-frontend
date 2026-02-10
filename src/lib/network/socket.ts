import type { ClientMessage, ServerMessage } from "./messages";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";
export type MessageHandler = (message: ServerMessage) => void;

const HEARTBEAT_INTERVAL = 15_000;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000];

class SocketManager {
  private ws: WebSocket | null = null;
  private url: string = "";
  private handlers: Set<MessageHandler> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempt: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose: boolean = false;

  state: ConnectionState = "disconnected";
  lastError: string = "";

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

    this.state = this.reconnectAttempt > 0 ? "reconnecting" : "connecting";

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.state = "connected";
        this.reconnectAttempt = 0;
        this.lastError = "";
        this.startHeartbeat();
        console.log("[WS] Connected");
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const msg: ServerMessage = JSON.parse(
            typeof event.data === "string"
              ? event.data
              : new TextDecoder().decode(event.data)
          );
          this.handlers.forEach((handler) => handler(msg));
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.stopHeartbeat();
        this.state = "disconnected";
        console.log(`[WS] Closed: ${event.code} ${event.reason}`);

        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.lastError = "Connection error";
        console.error("[WS] Error");
      };
    } catch (err) {
      this.lastError = "Failed to connect";
      this.state = "disconnected";
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

    this.state = "disconnected";
    console.log("[WS] Disconnected (intentional)");
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  get isConnected(): boolean {
    return this.state === "connected";
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
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
      RECONNECT_DELAYS[
        Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)
      ];
    console.log(
      `[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt + 1})`
    );

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
