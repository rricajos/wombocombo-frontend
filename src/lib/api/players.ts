import { get, patch } from "./client";
import type { PlayerData } from "$lib/stores/auth.svelte";

interface PlayerResponse {
  data: PlayerData;
}

interface StatsResponse {
  data: {
    rounds_played: number;
    rounds_survived: number;
    total_kills: number;
    total_deaths: number;
    best_round: number;
    total_playtime_secs: number;
    coop_revives: number;
    currency: number;
  };
}

export async function getMe(): Promise<PlayerData> {
  const res = await get<PlayerResponse>("/players/me");
  return res.data;
}

export async function updateMe(
  updates: Partial<{ display_name: string; avatar_id: string }>
): Promise<PlayerData> {
  const res = await patch<PlayerResponse>("/players/me", updates);
  return res.data;
}

export async function getPlayer(id: string): Promise<PlayerData> {
  const res = await get<PlayerResponse>(`/players/${id}`);
  return res.data;
}

export async function getPlayerStats(id: string) {
  const res = await get<StatsResponse>(`/players/${id}/stats`);
  return res.data;
}
