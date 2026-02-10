<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { gameStore } from "$lib/stores/game.svelte";
  import { lobbyStore } from "$lib/stores/lobby.svelte";
  import { socket } from "$lib/network/socket";

  function backToLobby() {
    socket.disconnect();
    lobbyStore.clear();
    gameStore.reset();
    routerStore.navigate("lobby");
  }

  function playAgain() {
    // If we have a room, go back to room
    if (lobbyStore.room) {
      gameStore.reset();
      routerStore.navigate("room");
    } else {
      backToLobby();
    }
  }
</script>

<div class="results-page">
  <div class="results-card">
    <div class="results-header">
      <h2 class="title">GAME OVER</h2>
      <p class="round-info">Reached Round {gameStore.round}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-value">{gameStore.score}</span>
        <span class="stat-label">Score</span>
      </div>
      <div class="stat-box gold">
        <span class="stat-value">{gameStore.gold}</span>
        <span class="stat-label">Gold Earned</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{gameStore.round}</span>
        <span class="stat-label">Rounds</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{gameStore.totalPlayers}</span>
        <span class="stat-label">Players</span>
      </div>
    </div>

    {#if gameStore.finalStats}
      <div class="extra-stats">
        {#each Object.entries(gameStore.finalStats) as [key, val]}
          <div class="extra-stat">
            <span class="extra-key">{key.replace(/_/g, " ")}</span>
            <span class="extra-val">{val}</span>
          </div>
        {/each}
      </div>
    {/if}

    <div class="btn-row">
      <button class="btn-primary" onclick={playAgain}>
        PLAY AGAIN
      </button>
      <button class="btn-secondary" onclick={backToLobby}>
        BACK TO LOBBY
      </button>
    </div>
  </div>
</div>

<style>
  .results-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: var(--color-bg);
    background-image: radial-gradient(ellipse at 50% 40%, rgba(0, 206, 201, 0.05), transparent 60%);
  }
  .results-card {
    width: 100%;
    max-width: 480px;
    padding: 40px;
    background: var(--color-surface);
    border-radius: 16px;
    text-align: center;
  }
  .results-header { margin-bottom: 30px; }
  .title {
    font-family: "Press Start 2P", monospace;
    font-size: 28px;
    color: var(--color-accent);
    text-shadow: 0 0 20px rgba(0, 206, 201, 0.3);
    margin-bottom: 8px;
  }
  .round-info {
    font-size: 14px;
    color: var(--color-text-dim);
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .stat-box {
    padding: 16px 12px;
    background: var(--color-bg);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stat-value {
    font-size: 14px;
    font-weight: 700;
    font-family: "Press Start 2P", monospace;
    color: white;
  }
  .stat-box.gold .stat-value { color: #ffcc00; }
  .stat-label {
    font-size: 11px;
    color: var(--color-text-dim);
  }
  .extra-stats {
    margin-bottom: 24px;
    padding: 12px;
    background: var(--color-bg);
    border-radius: 8px;
  }
  .extra-stat {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 12px;
  }
  .extra-key { color: var(--color-text-dim); text-transform: capitalize; }
  .extra-val { color: white; font-weight: 600; }
  .btn-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .btn-primary {
    padding: 14px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-primary:hover { background: var(--color-primary-dark); }
  .btn-secondary {
    padding: 12px;
    background: transparent;
    color: var(--color-text-dim);
    border: 1px solid var(--color-surface-light);
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
  }
  .btn-secondary:hover { color: white; border-color: white; }
</style>
