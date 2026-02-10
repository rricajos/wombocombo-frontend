export interface LobbyPlayer {
  id: string;
  name: string;
  avatar_id: string;
  ready: boolean;
}

export interface RoomData {
  id: string;
  join_code: string;
  host_id: string;
  map_id: string;
  max_players: number;
  is_public: boolean;
  status: string;
  players: string[];
}

export interface ChatMessage {
  id: number;
  sender: string;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem: boolean;
}

let chatIdCounter = 0;

class LobbyStore {
  room = $state<RoomData | null>(null);
  players = $state<LobbyPlayer[]>([]);
  chatMessages = $state<ChatMessage[]>([]);
  isHost = $state<boolean>(false);
  connectedPlayerId = $state<string>("");

  /** Map of player_id → display_name, persists across lobby→game transition */
  playerNames = $state<Record<string, string>>({});

  get allReady(): boolean {
    return this.players.length >= 2 && this.players.every((p) => p.ready);
  }

  get playerCount(): number {
    return this.players.length;
  }

  setRoom(room: RoomData) {
    this.room = room;
  }

  setConnectedPlayer(playerId: string) {
    this.connectedPlayerId = playerId;
  }

  addPlayer(player: LobbyPlayer) {
    if (!this.players.find((p) => p.id === player.id)) {
      this.players.push(player);
    }
    this.playerNames[player.id] = player.name;
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  setPlayerReady(playerId: string, ready: boolean) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.ready = ready;
  }

  addChatMessage(senderId: string, message: string) {
    const senderName = this.playerNames[senderId] ?? senderId.slice(0, 8);
    this.chatMessages.push({
      id: ++chatIdCounter,
      sender: senderId,
      senderName,
      message,
      timestamp: Date.now(),
      isSystem: false,
    });
    this.trimChat();
  }

  addSystemMessage(message: string) {
    this.chatMessages.push({
      id: ++chatIdCounter,
      sender: "system",
      senderName: "System",
      message,
      timestamp: Date.now(),
      isSystem: true,
    });
    this.trimChat();
  }

  getPlayerName(playerId: string): string {
    return this.playerNames[playerId] ?? playerId.slice(0, 8);
  }

  private trimChat() {
    if (this.chatMessages.length > 200) {
      this.chatMessages = this.chatMessages.slice(-150);
    }
  }

  clear() {
    this.room = null;
    this.players = [];
    this.chatMessages = [];
    this.isHost = false;
    this.connectedPlayerId = "";
  }

  clearAll() {
    this.clear();
    this.playerNames = {};
  }
}

export const lobbyStore = new LobbyStore();
