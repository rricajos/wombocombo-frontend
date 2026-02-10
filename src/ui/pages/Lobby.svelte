<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { lobbyStore, type RoomData } from "$lib/stores/lobby.svelte";
  import { createRoom, listPublicRooms, getRoom } from "$lib/api/rooms";
  import { logout } from "$lib/api/auth";

  let joinCode = $state("");
  let publicRooms = $state<RoomData[]>([]);
  let error = $state("");
  let loading = $state(false);

  async function handleCreateRoom() {
    error = "";
    loading = true;
    try {
      const room = await createRoom("arena_01", 4, true);
      lobbyStore.setRoom(room);
      lobbyStore.isHost = true;
      routerStore.navigate("room", { code: room.join_code });
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to create room";
    } finally {
      loading = false;
    }
  }

  async function handleJoinRoom() {
    if (!joinCode.trim()) return;
    error = "";
    loading = true;
    try {
      const room = await getRoom(joinCode.trim().toUpperCase());
      lobbyStore.setRoom(room);
      routerStore.navigate("room", { code: room.join_code });
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Room not found";
    } finally {
      loading = false;
    }
  }

  async function refreshRooms() {
    try {
      publicRooms = await listPublicRooms();
    } catch {
      publicRooms = [];
    }
  }

  async function handleLogout() {
    await logout();
    routerStore.navigate("landing");
  }

  // Load public rooms on mount
  refreshRooms();
</script>

<div class="flex flex-col h-full bg-[var(--color-bg)] p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold" style="font-family: 'Press Start 2P', monospace; color: var(--color-primary);">
      LOBBY
    </h1>
    <div class="flex items-center gap-4">
      <span class="text-sm text-[var(--color-text-dim)]">{authStore.player?.display_name ?? "Player"}</span>
      <button class="text-sm text-[var(--color-text-dim)] hover:text-white" onclick={handleLogout}>Logout</button>
    </div>
  </div>

  {#if error}
    <div class="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">{error}</div>
  {/if}

  <div class="flex gap-8 flex-1">
    <!-- Left: Create / Join -->
    <div class="flex flex-col gap-6 w-80">
      <div class="p-6 bg-[var(--color-surface)] rounded-xl">
        <h3 class="font-semibold mb-4">Create Room</h3>
        <button class="btn-primary w-full" onclick={handleCreateRoom} disabled={loading}>
          {loading ? "Creating..." : "CREATE ROOM"}
        </button>
      </div>

      <div class="p-6 bg-[var(--color-surface)] rounded-xl">
        <h3 class="font-semibold mb-4">Join with Code</h3>
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="ABC123"
            bind:value={joinCode}
            class="input-field flex-1 uppercase"
            maxlength="6"
            onkeydown={(e: KeyboardEvent) => e.key === "Enter" && handleJoinRoom()}
          />
          <button class="btn-accent" onclick={handleJoinRoom} disabled={loading || !joinCode.trim()}>
            JOIN
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Public rooms -->
    <div class="flex-1 p-6 bg-[var(--color-surface)] rounded-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Public Rooms</h3>
        <button class="text-sm text-[var(--color-accent)]" onclick={refreshRooms}>↻ Refresh</button>
      </div>

      {#if publicRooms.length === 0}
        <p class="text-[var(--color-text-dim)] text-sm">No public rooms available. Create one!</p>
      {:else}
        <div class="flex flex-col gap-2">
          {#each publicRooms as room}
            <button
              class="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors"
              onclick={() => {
                lobbyStore.setRoom(room);
                routerStore.navigate("room", { code: room.join_code });
              }}
            >
              <span class="font-mono text-sm">{room.join_code}</span>
              <span class="text-xs text-[var(--color-text-dim)]">
                {room.players.length}/{room.max_players} players
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .input-field {
    padding: 10px 14px;
    background: var(--color-bg);
    border: 1px solid var(--color-surface-light);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 14px;
    outline: none;
    font-family: monospace;
    letter-spacing: 2px;
  }
  .input-field:focus { border-color: var(--color-primary); }
  .btn-primary {
    padding: 12px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-accent {
    padding: 10px 16px;
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
