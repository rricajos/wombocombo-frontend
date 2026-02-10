import { post } from "./client";
import { authStore, type PlayerData } from "$lib/stores/auth.svelte";

interface AuthResponse {
  data: {
    player: PlayerData;
    token: string;
    refresh_token: string;
  };
}

interface MessageResponse {
  message: string;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<void> {
  const res = await post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  authStore.setAuth(res.data.token, res.data.refresh_token, res.data.player);
}

export async function login(email: string, password: string): Promise<void> {
  const res = await post<AuthResponse>("/auth/login", { email, password });
  authStore.setAuth(res.data.token, res.data.refresh_token, res.data.player);
}

export async function logout(): Promise<void> {
  try {
    await post<MessageResponse>("/auth/logout");
  } finally {
    authStore.clear();
  }
}
