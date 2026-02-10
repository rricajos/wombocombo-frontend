<script lang="ts">
  import { lobbyStore } from "$lib/stores/lobby.svelte";
  import { authStore } from "$lib/stores/auth.svelte";

  const AVATAR_COLORS: Record<string, string> = {
    avatar_01: "#4488ff",
    avatar_02: "#44cc44",
    avatar_03: "#cc44cc",
    avatar_04: "#cccc44",
  };

  function avatarColor(id: string): string {
    return AVATAR_COLORS[id] ?? "#888";
  }
</script>

<div class="player-list">
  {#each lobbyStore.players as player (player.id)}
    <div class="player-card" class:is-me={player.id === authStore.player?.id}>
      <div class="player-left">
        <div class="avatar" style="background: {avatarColor(player.avatar_id)};">
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div class="player-info">
          <span class="player-name">
            {player.name}
            {#if player.id === lobbyStore.room?.host_id}
              <span class="host-badge">HOST</span>
            {/if}
            {#if player.id === authStore.player?.id}
              <span class="you-badge">YOU</span>
            {/if}
          </span>
        </div>
      </div>
      <div class="player-status" class:ready={player.ready}>
        {player.ready ? "✓ READY" : "waiting"}
      </div>
    </div>
  {/each}

  {#if lobbyStore.players.length === 0}
    <p class="empty-text">Waiting for players to join...</p>
  {/if}
</div>

<style>
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--color-bg);
    border-radius: 8px;
    border: 1px solid transparent;
    transition: border-color 0.15s;
  }
  .player-card.is-me {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg));
  }
  .player-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: white;
  }
  .player-name {
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .host-badge {
    font-size: 9px;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 700;
  }
  .you-badge {
    font-size: 9px;
    background: var(--color-primary);
    color: white;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 700;
  }
  .player-status {
    font-size: 11px;
    color: var(--color-text-dim);
  }
  .player-status.ready {
    color: #44cc44;
    font-weight: 600;
  }
  .empty-text {
    font-size: 12px;
    color: var(--color-text-dim);
    text-align: center;
    padding: 20px 0;
  }
</style>
