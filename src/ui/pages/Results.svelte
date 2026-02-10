<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { gameStore } from "$lib/stores/game.svelte";
</script>

<div class="flex flex-col items-center justify-center h-full bg-[var(--color-bg)]">
  <div class="w-full max-w-md p-8 bg-[var(--color-surface)] rounded-xl text-center">
    <h2 class="text-3xl font-bold mb-2" style="font-family: 'Press Start 2P', monospace; color: var(--color-accent);">
      GAME OVER
    </h2>
    <p class="text-[var(--color-text-dim)] mb-8">Round {gameStore.round} reached</p>

    <div class="grid grid-cols-2 gap-4 mb-8 text-left">
      <div class="stat-card">
        <span class="stat-label">Score</span>
        <span class="stat-value">{gameStore.score}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Gold</span>
        <span class="stat-value text-yellow-400">{gameStore.gold}</span>
      </div>
    </div>

    <button
      class="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold"
      onclick={() => routerStore.navigate("lobby")}
    >
      BACK TO LOBBY
    </button>
  </div>
</div>

<style>
  .stat-card {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: var(--color-bg);
    border-radius: 8px;
  }
  .stat-label {
    font-size: 11px;
    color: var(--color-text-dim);
    margin-bottom: 4px;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 700;
    font-family: "Press Start 2P", monospace;
  }
</style>
