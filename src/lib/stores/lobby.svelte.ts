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

class LobbyStore {
  room = $state<RoomData | null>(null);
  players = $state<LobbyPlayer[]>([]);
  chatMessages = $state<{ sender: string; message: string; timestamp: number }[]>([]);
  isHost = $state<boolean>(false);

  get allReady(): boolean {
    return this.players.length >= 2 && this.players.every((p) => p.ready);
  }

  setRoom(room: RoomData) {
    this.room = room;
  }

  addPlayer(player: LobbyPlayer) {
    if (!this.players.find((p) => p.id === player.id)) {
      this.players.push(player);
    }
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  setPlayerReady(playerId: string, ready: boolean) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.ready = ready;
  }

  addChatMessage(sender: string, message: string) {
    this.chatMessages.push({ sender, message, timestamp: Date.now() });
    if (this.chatMessages.length > 100) {
      this.chatMessages.shift();
    }
  }

  clear() {
    this.room = null;
    this.players = [];
    this.chatMessages = [];
    this.isHost = false;
  }
}

export const lobbyStore = new LobbyStore();
