<script lang="ts">
  import { gameStore } from "$lib/stores/game.svelte";
  import { socket } from "$lib/network/socket";
  import { settingsStore } from "$lib/stores/settings.svelte";

  let healthPercent = $derived(
    gameStore.maxHealth > 0 ? (gameStore.health / gameStore.maxHealth) * 100 : 0
  );

  let healthColor = $derived(
    healthPercent > 50 ? "#00cc66" : healthPercent > 25 ? "#ccaa00" : "#cc3333"
  );

  let timeColor = $derived(
    gameStore.timeLeft > 10 ? "#fff" : "#ff4444"
  );

  let formattedTime = $derived(() => {
    const t = Math.ceil(gameStore.timeLeft);
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}`;
  });
</script>

<div class="hud">
  <!-- Top bar -->
  <div class="hud-top">
    <!-- Health -->
    <div class="hud-health">
      <div class="health-bar-bg">
        <div
          class="health-bar-fill"
          style="width: {healthPercent}%; background: {healthColor};"
        ></div>
      </div>
      <span class="health-text">{gameStore.health}</span>
    </div>

    <!-- Round -->
    <div class="hud-center">
      <span class="round-label">ROUND</span>
      <span class="round-num">{gameStore.round}</span>
    </div>

    <!-- Timer -->
    <div class="hud-timer" style="color: {timeColor};">
      {formattedTime()}
    </div>
  </div>

  <!-- Bottom bar -->
  <div class="hud-bottom">
    <div class="hud-left-bottom">
      <div class="stat-group">
        <span class="stat-lbl">SCORE</span>
        <span class="stat-val">{gameStore.score}</span>
      </div>
      <div class="stat-group gold">
        <span class="gold-dot">●</span>
        <span class="stat-val gold-val">{gameStore.gold}</span>
      </div>
    </div>

    <div class="hud-center-bottom">
      {gameStore.playersAlive}/{gameStore.totalPlayers} alive
    </div>

    <div class="hud-right-bottom">
      <span class="conn-dot" class:connected={gameStore.wsConnected}></span>
      {#if settingsStore.showFPS}
        <span class="debug-info">{socket.latencyMs}ms | tick {gameStore.serverTick}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    font-family: "Press Start 2P", monospace;
  }

  /* ── Top bar ── */
  .hud-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
  }

  .hud-health {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 200px;
  }

  .health-bar-bg {
    width: 150px;
    height: 16px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .health-bar-fill {
    height: 100%;
    transition: width 0.15s ease-out, background 0.3s;
    border-radius: 2px;
  }

  .health-text {
    font-size: 11px;
    color: #fff;
    text-shadow: 1px 1px 3px #000;
    min-width: 30px;
  }

  .hud-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .round-label {
    font-size: 8px;
    color: #6c5ce7;
    letter-spacing: 2px;
  }

  .round-num {
    font-size: 14px;
    color: white;
    text-shadow: 0 0 8px rgba(108, 92, 231, 0.6);
  }

  .hud-timer {
    font-size: 16px;
    text-shadow: 1px 1px 3px #000;
    min-width: 60px;
    text-align: right;
  }

  /* ── Bottom bar ── */
  .hud-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 10px 14px;
    font-size: 9px;
    text-shadow: 1px 1px 2px #000;
  }

  .hud-left-bottom {
    display: flex;
    gap: 16px;
    align-items: flex-end;
  }

  .stat-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-lbl {
    color: #888;
    font-size: 7px;
    letter-spacing: 1px;
  }

  .stat-val {
    color: #ffcc00;
    font-size: 12px;
  }

  .gold {
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }

  .gold-dot {
    color: #ffdd00;
    font-size: 8px;
  }

  .gold-val {
    font-size: 11px;
    color: #ffdd00;
  }

  .hud-center-bottom {
    color: #aaa;
  }

  .hud-right-bottom {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .conn-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cc3333;
  }

  .conn-dot.connected {
    background: #33cc33;
  }

  .debug-info {
    font-size: 8px;
    color: #666;
    font-family: monospace;
  }
</style>
