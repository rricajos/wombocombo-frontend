<script lang="ts">
  import { gameStore } from "$lib/stores/game.svelte";

  const isDead = $derived(gameStore.phase === "death");
  const playersAlive = $derived(gameStore.playersAlive);
  const totalPlayers = $derived(gameStore.totalPlayers);
</script>

{#if isDead}
  <div class="death-overlay">
    <div class="death-content">
      <div class="death-title shake">YOU DIED</div>

      <div class="death-info">
        <span class="spectating">Watching teammates...</span>
        <span class="alive-count">{playersAlive} / {totalPlayers} alive</span>
      </div>

      {#if gameStore.killedBy}
        <div class="killed-by">
          Eliminated by <span class="killer">{gameStore.killedBy}</span>
        </div>
      {/if}

      <div class="stats-mini">
        <div class="stat">
          <span class="stat-label">SCORE</span>
          <span class="stat-value">{gameStore.score}</span>
        </div>
        <div class="stat">
          <span class="stat-label">ROUND</span>
          <span class="stat-value">{gameStore.round}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .death-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 0, 0, 0.55);
    z-index: 50;
    pointer-events: none;
    animation: fadeIn 0.5s ease-out;
  }

  .death-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .death-title {
    font-family: "Press Start 2P", monospace;
    font-size: 42px;
    color: #cc2222;
    text-shadow:
      0 0 20px rgba(204, 34, 34, 0.8),
      0 0 40px rgba(204, 34, 34, 0.4),
      2px 2px 0 #000;
    letter-spacing: 6px;
  }

  .shake {
    animation: deathShake 0.5s ease-out;
  }

  .death-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: "Press Start 2P", monospace;
    font-size: 10px;
  }

  .spectating {
    color: #aaa;
    animation: pulse 2s ease-in-out infinite;
  }

  .alive-count {
    color: #888;
  }

  .killed-by {
    font-family: "Press Start 2P", monospace;
    font-size: 11px;
    color: #999;
  }

  .killer {
    color: #ff6666;
  }

  .stats-mini {
    display: flex;
    gap: 24px;
    margin-top: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-family: "Press Start 2P", monospace;
    font-size: 8px;
    color: #666;
    letter-spacing: 2px;
  }

  .stat-value {
    font-family: "Press Start 2P", monospace;
    font-size: 16px;
    color: #ddd;
  }

  @keyframes deathShake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-8px); }
    20% { transform: translateX(8px); }
    30% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    50% { transform: translateX(-3px); }
    60% { transform: translateX(3px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
