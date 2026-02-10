<script lang="ts">
  import { onMount } from "svelte";
  import { createGame, destroyGame } from "$game/PhaserGame";
  import { gameStore } from "$lib/stores/game.svelte";
  import { routerStore } from "$lib/stores/router.svelte";
  import { socket } from "$lib/network/socket";
  import { lobbyStore } from "$lib/stores/lobby.svelte";
  import HUD from "$ui/components/HUD.svelte";

  let containerEl: HTMLDivElement;

  onMount(() => {
    gameStore.reset();
    createGame(containerEl);

    // Clean expired kill feed entries periodically
    const feedTimer = setInterval(() => gameStore.cleanKillFeed(), 1000);

    // Escape key to show exit confirmation
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirm("Leave the match?")) {
          socket.disconnect();
          lobbyStore.clear();
          routerStore.navigate("lobby");
        }
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      clearInterval(feedTimer);
      destroyGame();
      gameStore.reset();
    };
  });
</script>

<div class="game-wrapper">
  <div class="game-container" bind:this={containerEl}></div>

  <!-- HUD overlay -->
  <HUD />

  <!-- Kill feed -->
  {#if gameStore.killFeed.length > 0}
    <div class="kill-feed">
      {#each gameStore.killFeed as entry (entry.id)}
        <div class="feed-entry feed-{entry.type}">
          {entry.message}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Connection status -->
  {#if !gameStore.wsConnected}
    <div class="connection-lost">
      <p>CONNECTION LOST</p>
      <p class="text-xs mt-1">Attempting to reconnect...</p>
    </div>
  {/if}
</div>

<style>
  .game-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;
  }
  .game-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .kill-feed {
    position: absolute;
    top: 50px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    pointer-events: none;
    z-index: 15;
    max-width: 280px;
  }
  .feed-entry {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-family: "Press Start 2P", monospace;
    text-shadow: 1px 1px 2px #000;
    animation: feedSlide 0.3s ease-out;
  }
  .feed-kill { background: rgba(255, 50, 50, 0.2); color: #ff6666; }
  .feed-death { background: rgba(200, 0, 0, 0.3); color: #ff4444; }
  .feed-pickup { background: rgba(0, 200, 0, 0.2); color: #66ff66; }
  .feed-info { background: rgba(100, 100, 255, 0.2); color: #aaaaff; }

  @keyframes feedSlide {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .connection-lost {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px 40px;
    background: rgba(0, 0, 0, 0.85);
    border: 2px solid #cc3333;
    border-radius: 12px;
    color: #ff4444;
    text-align: center;
    font-family: "Press Start 2P", monospace;
    font-size: 14px;
    z-index: 50;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { border-color: #cc3333; }
    50% { border-color: #ff6666; }
  }
</style>
