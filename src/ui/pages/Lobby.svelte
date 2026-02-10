<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { lobbyStore, type RoomData } from "$lib/stores/lobby.svelte";
  import { createRoom, listPublicRooms, getRoom } from "$lib/api/rooms";
  import { getPlayerStats } from "$lib/api/players";
  import { logout } from "$lib/api/auth";

  let joinCode = $state("");
  let publicRooms = $state<RoomData[]>([]);
  let error = $state("");
  let loading = $state(false);
  let refreshing = $state(false);

  // Room creation settings
  let roomMaxPlayers = $state(4);
  let roomIsPublic = $state(true);
  let roomMapId = $state("arena_01");
  let showCreateOptions = $state(false);

  // Player stats
  let stats = $state<{ total_kills: number; rounds_played: number; best_round: number; currency: number } | null>(null);

  async function loadStats() {
    if (!authStore.player?.id) return;
    try {
      const s = await getPlayerStats(authStore.player.id);
      stats = s;
    } catch { /* ignore */ }
  }

  async function handleCreateRoom() {
    error = "";
    loading = true;
    try {
      const room = await createRoom(roomMapId, roomMaxPlayers, roomIsPublic);
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

  async function joinPublicRoom(room: RoomData) {
    lobbyStore.setRoom(room);
    routerStore.navigate("room", { code: room.join_code });
  }

  async function refreshRooms() {
    refreshing = true;
    try {
      publicRooms = await listPublicRooms();
    } catch {
      publicRooms = [];
    } finally {
      refreshing = false;
    }
  }

  async function handleLogout() {
    await logout();
    lobbyStore.clearAll();
    routerStore.navigate("landing");
  }

  // Load on mount
  refreshRooms();
  loadStats();
</script>

<div class="flex flex-col h-full bg-[var(--color-bg)]">
  <!-- Top bar -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface)]">
    <h1 class="text-xl font-bold" style="font-family: 'Press Start 2P', monospace; color: var(--color-primary); font-size: 16px;">
      WOMBOCOMBO
    </h1>
    <div class="flex items-center gap-4">
      <button
        class="text-sm text-[var(--color-text-dim)] hover:text-white"
        onclick={() => routerStore.navigate("settings")}
      >
        Settings
      </button>
      <span class="text-sm font-medium">{authStore.player?.display_name ?? "Player"}</span>
      <button class="text-sm text-[var(--color-text-dim)] hover:text-red-400" onclick={handleLogout}>
        Logout
      </button>
    </div>
  </div>

  {#if error}
    <div class="mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
      {error}
      <button class="ml-2 underline" onclick={() => { error = ""; }}>dismiss</button>
    </div>
  {/if}

  <div class="flex flex-1 min-h-0 p-6 gap-6">
    <!-- Left column: Profile + Actions -->
    <div class="w-80 flex flex-col gap-5">
      <!-- Player card -->
      <div class="p-5 bg-[var(--color-surface)] rounded-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-xl font-bold">
            {(authStore.player?.display_name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="font-semibold">{authStore.player?.display_name}</p>
            <p class="text-xs text-[var(--color-text-dim)]">@{authStore.player?.username}</p>
          </div>
        </div>
        {#if stats}
          <div class="grid grid-cols-2 gap-3">
            <div class="stat-mini">
              <span class="stat-val">{stats.total_kills}</span>
              <span class="stat-lbl">Kills</span>
            </div>
            <div class="stat-mini">
              <span class="stat-val">{stats.rounds_played}</span>
              <span class="stat-lbl">Rounds</span>
            </div>
            <div class="stat-mini">
              <span class="stat-val">{stats.best_round}</span>
              <span class="stat-lbl">Best Round</span>
            </div>
            <div class="stat-mini">
              <span class="stat-val text-yellow-400">{stats.currency}</span>
              <span class="stat-lbl">Gold</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Create room -->
      <div class="p-5 bg-[var(--color-surface)] rounded-xl">
        <h3 class="font-semibold mb-3 text-sm">Create Room</h3>

        {#if showCreateOptions}
          <div class="flex flex-col gap-3 mb-4">
            <div>
              <label class="text-xs text-[var(--color-text-dim)]">Map</label>
              <select bind:value={roomMapId} class="select-field">
                <option value="arena_01">Arena</option>
                <option value="forest_01">Forest</option>
                <option value="dungeon_01">Dungeon</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[var(--color-text-dim)]">Max Players</label>
              <select bind:value={roomMaxPlayers} class="select-field">
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" bind:checked={roomIsPublic} />
              Public room
            </label>
          </div>
        {:else}
          <button
            class="text-xs text-[var(--color-text-dim)] mb-3 hover:text-white"
            onclick={() => { showCreateOptions = true; }}
          >
            ▸ Show options
          </button>
        {/if}

        <button class="btn-primary w-full" onclick={handleCreateRoom} disabled={loading}>
          {loading ? "Creating..." : "CREATE ROOM"}
        </button>
      </div>

      <!-- Join with code -->
      <div class="p-5 bg-[var(--color-surface)] rounded-xl">
        <h3 class="font-semibold mb-3 text-sm">Join with Code</h3>
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="ABC123"
            bind:value={joinCode}
            class="input-code flex-1"
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
    <div class="flex-1 flex flex-col p-5 bg-[var(--color-surface)] rounded-xl min-h-0">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-sm">Public Rooms</h3>
        <button
          class="text-xs text-[var(--color-accent)] hover:underline"
          onclick={refreshRooms}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        {#if publicRooms.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-center">
            <p class="text-[var(--color-text-dim)] text-sm mb-2">No public rooms available</p>
            <p class="text-[var(--color-text-dim)] text-xs">Create one and invite friends!</p>
          </div>
        {:else}
          <div class="flex flex-col gap-2">
            {#each publicRooms as room (room.id)}
              <button
                class="room-card"
                onclick={() => joinPublicRoom(room)}
              >
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold text-[var(--color-accent)]">{room.join_code}</span>
                  <span class="text-xs text-[var(--color-text-dim)]">{room.map_id}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs">
                    {room.players.length}/{room.max_players}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded {room.status === 'waiting' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}">
                    {room.status}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .stat-mini {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background: var(--color-bg);
    border-radius: 6px;
    text-align: center;
  }
  .stat-val { font-size: 16px; font-weight: 700; font-family: "Press Start 2P", monospace; font-size: 12px; }
  .stat-lbl { font-size: 10px; color: var(--color-text-dim); margin-top: 2px; }
  .select-field {
    width: 100%;
    padding: 8px;
    background: var(--color-bg);
    border: 1px solid var(--color-surface-light);
    border-radius: 6px;
    color: var(--color-text);
    font-size: 13px;
  }
  .input-code {
    padding: 10px 14px;
    background: var(--color-bg);
    border: 1px solid var(--color-surface-light);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 16px;
    font-family: monospace;
    letter-spacing: 3px;
    text-transform: uppercase;
    outline: none;
    text-align: center;
  }
  .input-code:focus { border-color: var(--color-primary); }
  .btn-primary {
    padding: 12px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
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
    font-size: 13px;
    cursor: pointer;
  }
  .btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }
  .room-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: var(--color-bg);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .room-card:hover {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-bg));
  }
</style>
