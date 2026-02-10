<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
</script>

<div class="landing">
  <div class="landing-content">
    <h1 class="title">WOMBOCOMBO</h1>
    <p class="subtitle">Co-op survival platformer</p>

    <div class="btn-group">
      {#if authStore.isAuthenticated}
        <p class="welcome">Welcome back, {authStore.player?.display_name ?? "Player"}!</p>
        <button class="btn-play" onclick={() => routerStore.navigate("lobby")}>
          ▶ PLAY
        </button>
        <div class="btn-row">
          <button class="btn-secondary" onclick={() => routerStore.navigate("settings")}>Settings</button>
        </div>
      {:else}
        <button class="btn-play" onclick={() => routerStore.navigate("login")}>
          LOGIN
        </button>
        <button class="btn-secondary" onclick={() => routerStore.navigate("register")}>
          CREATE ACCOUNT
        </button>
      {/if}
    </div>
  </div>

  <p class="version">v0.2.0 — Phase 2</p>
</div>

<style>
  .landing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: var(--color-bg);
    background-image: radial-gradient(ellipse at 50% 30%, rgba(108, 92, 231, 0.08), transparent 70%);
  }
  .landing-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .title {
    font-family: "Press Start 2P", monospace;
    font-size: 42px;
    color: var(--color-primary);
    text-shadow: 0 0 40px rgba(108, 92, 231, 0.3);
    letter-spacing: 3px;
  }
  .subtitle {
    color: var(--color-text-dim);
    font-size: 15px;
    margin-bottom: 30px;
  }
  .welcome {
    color: var(--color-accent);
    font-size: 13px;
    margin-bottom: 4px;
  }
  .btn-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 280px;
  }
  .btn-play {
    width: 100%;
    padding: 16px 24px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    font-family: "Press Start 2P", monospace;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-play:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.3);
  }
  .btn-secondary {
    width: 100%;
    padding: 13px 24px;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-surface-light);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: var(--color-surface-light); }
  .btn-row {
    display: flex;
    gap: 10px;
    width: 100%;
  }
  .version {
    position: absolute;
    bottom: 16px;
    font-size: 11px;
    color: var(--color-text-dim);
  }
</style>
