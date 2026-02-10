<script lang="ts">
  import { authStore } from "$lib/stores/auth.svelte";
  import { routerStore, type Route } from "$lib/stores/router.svelte";
  import { getMe } from "$lib/api/players";
  import Landing from "$ui/pages/Landing.svelte";
  import Login from "$ui/pages/Login.svelte";
  import Register from "$ui/pages/Register.svelte";
  import Lobby from "$ui/pages/Lobby.svelte";
  import Room from "$ui/pages/Room.svelte";
  import GamePage from "$ui/pages/Game.svelte";
  import Results from "$ui/pages/Results.svelte";
  import Settings from "$ui/pages/Settings.svelte";

  let initializing = $state(true);

  const pages: Record<Route, typeof Landing> = {
    landing: Landing,
    login: Login,
    register: Register,
    lobby: Lobby,
    room: Room,
    game: GamePage,
    results: Results,
    settings: Settings,
  };

  // Session restore: if we have a token, fetch player profile
  $effect(() => {
    if (authStore.token && !authStore.player) {
      getMe()
        .then((player) => {
          authStore.setPlayer(player);
          initializing = false;
        })
        .catch(() => {
          authStore.clear();
          initializing = false;
        });
    } else {
      initializing = false;
    }
  });

  // Route guard: redirect to login if not authenticated and trying to access protected routes
  $effect(() => {
    if (initializing) return;
    const protectedRoutes: Route[] = ["lobby", "room", "game", "results", "settings"];
    if (protectedRoutes.includes(routerStore.current) && !authStore.token) {
      routerStore.navigate("login");
    }
  });
</script>

{#if initializing}
  <div class="flex items-center justify-center h-full bg-[var(--color-bg)]">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4" style="font-family: 'Press Start 2P', monospace; color: var(--color-primary);">
        WOMBOCOMBO
      </h1>
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
{:else}
  {#each Object.entries(pages) as [route, Component]}
    {#if routerStore.current === route}
      <Component />
    {/if}
  {/each}
{/if}

<style>
  .loading-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
  }
  .loading-dots span {
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
    animation: dotPulse 1.2s ease-in-out infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
</style>
