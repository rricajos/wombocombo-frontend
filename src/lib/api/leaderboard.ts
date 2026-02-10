import { get } from "./client";

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  value: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  per_page: number;
  total: number;
}

export async function getLeaderboard(
  sort: string = "kills",
  page: number = 1,
  perPage: number = 20
): Promise<LeaderboardResponse> {
  return get<LeaderboardResponse>(
    `/stats/leaderboard?sort=${sort}&page=${page}&per_page=${perPage}`
  );
}
