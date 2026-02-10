<script lang="ts">
  import { gameStore } from "$lib/stores/game.svelte";

  let healthPercent = $derived(
    gameStore.maxHealth > 0 ? (gameStore.health / gameStore.maxHealth) * 100 : 0
  );

  let healthColor = $derived(
    healthPercent > 50 ? "#00cc66" : healthPercent > 25 ? "#ccaa00" : "#cc3333"
  );
</script>

<div class="hud">
  <!-- Top bar -->
  <div class="hud-top">
    <div class="hud-health">
      <div class="health-bar-bg">
        <div class="health-bar-fill" style="width: {healthPercent}%; background: {healthColor};"></div>
      </div>
      <span class="health-text">{gameStore.health}/{gameStore.maxHealth}</span>
    </div>

    <div class="hud-round">
      ROUND {gameStore.round}
    </div>

    <div class="hud-timer">
      {Math.ceil(gameStore.timeLeft)}s
    </div>
  </div>

  <!-- Bottom bar -->
  <div class="hud-bottom">
    <div class="hud-score">
      Score: {gameStore.score}
    </div>
    <div class="hud-players">
      {gameStore.playersAlive}/{gameStore.totalPlayers} alive
    </div>
  </div>

  <!-- Countdown overlay -->
  {#if gameStore.phase === "countdown" && gameStore.countdownSeconds > 0}
    <div class="countdown-overlay">
      <span class="countdown-number">{gameStore.countdownSeconds}</span>
    </div>
  {/if}

  <!-- Death overlay -->
  {#if gameStore.phase === "death"}
    <div class="death-overlay">
      <p class="death-text">YOU DIED</p>
      <p class="death-sub">Waiting for teammates...</p>
    </div>
  {/if}
</div>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    font-family: "Press Start 2P", monospace;
  }
  .hud-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
  }
  .hud-health {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .health-bar-bg {
    width: 160px;
    height: 14px;
    background: #222;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #444;
  }
  .health-bar-fill {
    height: 100%;
    transition: width 0.2s, background 0.3s;
  }
  .health-text {
    font-size: 10px;
    color: #fff;
    text-shadow: 1px 1px 2px #000;
  }
  .hud-round {
    font-size: 12px;
    color: var(--color-accent);
    text-shadow: 1px 1px 2px #000;
  }
  .hud-timer {
    font-size: 14px;
    color: #fff;
    text-shadow: 1px 1px 2px #000;
  }
  .hud-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    font-size: 10px;
    color: #aaa;
    text-shadow: 1px 1px 2px #000;
  }
  .hud-score { color: #ffcc00; }
  .countdown-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }
  .countdown-number {
    font-size: 80px;
    color: white;
    text-shadow: 0 0 20px var(--color-primary);
  }
  .death-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(80, 0, 0, 0.6);
  }
  .death-text {
    font-size: 32px;
    color: #ff4444;
    text-shadow: 0 0 10px #ff0000;
    margin-bottom: 12px;
  }
  .death-sub {
    font-size: 10px;
    color: #ccc;
  }
</style>
