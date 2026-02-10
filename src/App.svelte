<script lang="ts">
  import { authStore } from "$lib/stores/auth";
  import { routerStore, type Route } from "$lib/stores/router";
  import Landing from "$ui/pages/Landing.svelte";
  import Login from "$ui/pages/Login.svelte";
  import Register from "$ui/pages/Register.svelte";
  import Lobby from "$ui/pages/Lobby.svelte";
  import Room from "$ui/pages/Room.svelte";
  import GamePage from "$ui/pages/Game.svelte";
  import Results from "$ui/pages/Results.svelte";
  import Settings from "$ui/pages/Settings.svelte";

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

  // Redirect to landing if not authenticated and trying to access protected routes
  $effect(() => {
    const protectedRoutes: Route[] = ["lobby", "room", "game", "results", "settings"];
    if (protectedRoutes.includes(routerStore.current) && !authStore.token) {
      routerStore.navigate("login");
    }
  });
</script>

{#each Object.entries(pages) as [route, Component]}
  {#if routerStore.current === route}
    <Component />
  {/if}
{/each}
