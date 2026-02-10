import { get, post, del } from "./client";

interface FriendEntry {
  player_id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  status: string;
  is_online: boolean;
  since: string;
}

interface FriendsResponse {
  data: FriendEntry[];
}

interface MessageResponse {
  message: string;
}

export async function listFriends(): Promise<FriendEntry[]> {
  const res = await get<FriendsResponse>("/friends");
  return res.data;
}

export async function listPending(): Promise<FriendEntry[]> {
  const res = await get<FriendsResponse>("/friends/pending");
  return res.data;
}

export async function sendRequest(friendId: string): Promise<void> {
  await post<MessageResponse>("/friends/request", { friend_id: friendId });
}

export async function acceptRequest(friendId: string): Promise<void> {
  await post<MessageResponse>("/friends/accept", { friend_id: friendId });
}

export async function removeFriend(friendId: string): Promise<void> {
  await del<MessageResponse>(`/friends/${friendId}`);
}
