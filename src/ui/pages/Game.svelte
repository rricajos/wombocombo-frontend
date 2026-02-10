<script lang="ts">
  import { onMount } from "svelte";
  import { createGame, destroyGame } from "$game/PhaserGame";
  import { gameStore } from "$lib/stores/game.svelte";
  import { routerStore } from "$lib/stores/router.svelte";
  import HUD from "$ui/components/HUD.svelte";

  let containerEl: HTMLDivElement;

  onMount(() => {
    gameStore.reset();
    createGame(containerEl);

    return () => {
      destroyGame();
      gameStore.reset();
    };
  });
</script>

<div class="game-wrapper">
  <div class="game-container" bind:this={containerEl}></div>
  <HUD />
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
</style>
