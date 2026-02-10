<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
</script>

<div class="flex flex-col items-center justify-center h-full bg-[var(--color-bg)]">
  <h1 class="text-5xl font-bold mb-2" style="font-family: 'Press Start 2P', monospace; color: var(--color-primary);">
    WOMBOCOMBO
  </h1>
  <p class="text-[var(--color-text-dim)] mb-12 text-lg">
    Co-op survival platformer
  </p>

  <div class="flex flex-col gap-4 w-64">
    {#if authStore.isAuthenticated}
      <button
        class="btn-primary"
        onclick={() => routerStore.navigate("lobby")}
      >
        PLAY
      </button>
      <button
        class="btn-secondary"
        onclick={() => routerStore.navigate("settings")}
      >
        SETTINGS
      </button>
    {:else}
      <button
        class="btn-primary"
        onclick={() => routerStore.navigate("login")}
      >
        LOGIN
      </button>
      <button
        class="btn-secondary"
        onclick={() => routerStore.navigate("register")}
      >
        REGISTER
      </button>
    {/if}
  </div>

  <p class="absolute bottom-4 text-xs text-[var(--color-text-dim)]">v0.1.0 — Phase 1</p>
</div>

<style>
  .btn-primary {
    padding: 14px 24px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: "Press Start 2P", monospace;
    letter-spacing: 1px;
  }
  .btn-primary:hover {
    background: var(--color-primary-dark);
  }
  .btn-secondary {
    padding: 14px 24px;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-surface-light);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-secondary:hover {
    background: var(--color-surface-light);
  }
</style>
