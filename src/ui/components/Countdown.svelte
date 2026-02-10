<script lang="ts">
  import { gameStore } from "$lib/stores/game.svelte";

  const seconds = $derived(gameStore.countdownSeconds);
  const isActive = $derived(gameStore.phase === "countdown" && seconds > 0);
</script>

{#if isActive}
  <div class="countdown-overlay">
    <div class="label">GET READY</div>
    <div class="number" class:pulse={true}>
      {seconds}
    </div>
    <div class="round-info">Round {gameStore.round}</div>
  </div>
{/if}

<style>
  .countdown-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
    pointer-events: none;
    animation: fadeIn 0.2s ease-out;
  }

  .label {
    font-family: "Press Start 2P", monospace;
    font-size: 18px;
    color: #ccc;
    text-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
    margin-bottom: 16px;
    letter-spacing: 4px;
  }

  .number {
    font-family: "Press Start 2P", monospace;
    font-size: 72px;
    color: #6c5ce7;
    text-shadow:
      0 0 20px rgba(108, 92, 231, 0.8),
      0 0 40px rgba(108, 92, 231, 0.4);
  }

  .number.pulse {
    animation: countPulse 1s ease-out infinite;
  }

  .round-info {
    font-family: "Press Start 2P", monospace;
    font-size: 12px;
    color: #888;
    margin-top: 20px;
    letter-spacing: 2px;
  }

  @keyframes countPulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.9; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
