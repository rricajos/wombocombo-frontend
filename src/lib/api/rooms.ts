import { get, post } from "./client";
import type { RoomData } from "$lib/stores/lobby.svelte";

interface RoomResponse {
  data: RoomData;
}

interface RoomsResponse {
  data: RoomData[];
}

export async function createRoom(
  mapId: string,
  maxPlayers: number,
  isPublic: boolean
): Promise<RoomData> {
  const res = await post<RoomResponse>("/rooms", {
    map_id: mapId,
    max_players: maxPlayers,
    is_public: isPublic,
  });
  return res.data;
}

export async function getRoom(code: string): Promise<RoomData> {
  const res = await get<RoomResponse>(`/rooms/${code}`);
  return res.data;
}

export async function listPublicRooms(): Promise<RoomData[]> {
  const res = await get<RoomsResponse>("/rooms/public");
  return res.data;
}
