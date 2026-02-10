<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { lobbyStore } from "$lib/stores/lobby.svelte";
  import { socket, type ConnectionState } from "$lib/network/socket";
  import { handleServerMessage } from "$lib/network/handler";
  import Chat from "$ui/components/Chat.svelte";
  import PlayerList from "$ui/components/PlayerList.svelte";

  let isReady = $state(false);
  let codeCopied = $state(false);
  let wsState = $state<ConnectionState>("disconnected");

  // Connect WebSocket when entering room
  $effect(() => {
    if (lobbyStore.room && authStore.token) {
      socket.connect(lobbyStore.room.join_code, authStore.token);

      const unsubMsg = socket.onMessage(handleServerMessage);
      const unsubState = socket.onStateChange((s) => { wsState = s; });

      return () => {
        unsubMsg();
        unsubState();
        socket.disconnect();
      };
    }
  });

  function toggleReady() {
    isReady = !isReady;
    socket.send({ type: "player_ready", ready: isReady });
  }

  function copyCode() {
    const code = lobbyStore.room?.join_code ?? "";
    navigator.clipboard.writeText(code).then(() => {
      codeCopied = true;
      setTimeout(() => { codeCopied = false; }, 2000);
    });
  }

  function leaveRoom() {
    socket.disconnect();
    lobbyStore.clear();
    routerStore.navigate("lobby");
  }

  const statusColor: Record<ConnectionState, string> = {
    disconnected: "#cc3333",
    connecting: "#ccaa00",
    connected: "#33cc33",
    reconnecting: "#ccaa00",
  };
</script>

<div class="flex flex-col h-full bg-[var(--color-bg)] p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-5">
    <div class="flex items-center gap-4">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          Room
          <span class="inline-block w-2 h-2 rounded-full" style="background: {statusColor[wsState]};"></span>
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-[var(--color-accent)] font-mono text-xl tracking-[0.3em] font-bold">
            {lobbyStore.room?.join_code ?? "------"}
          </span>
          <button
            class="text-xs px-2 py-1 rounded bg-[var(--color-surface-light)] text-[var(--color-text-dim)] hover:text-white transition-colors"
            onclick={copyCode}
          >
            {codeCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>

    <button
      class="text-sm text-[var(--color-text-dim)] hover:text-white transition-colors"
      onclick={leaveRoom}
    >
      ← Leave Room
    </button>
  </div>

  <!-- Main content -->
  <div class="flex gap-5 flex-1 min-h-0">
    <!-- Left: Players + Ready -->
    <div class="w-80 flex flex-col gap-4">
      <div class="flex-1 p-5 bg-[var(--color-surface)] rounded-xl overflow-auto">
        <h3 class="text-sm font-semibold mb-3 text-[var(--color-text-dim)]">
          PLAYERS ({lobbyStore.playerCount}/{lobbyStore.room?.max_players ?? 4})
        </h3>
        <PlayerList />
      </div>

      <button
        class="ready-btn {isReady ? 'ready' : ''}"
        onclick={toggleReady}
        disabled={wsState !== "connected"}
      >
        {#if isReady}
          ✓ READY — waiting for others
        {:else}
          READY UP
        {/if}
      </button>

      {#if lobbyStore.allReady}
        <p class="text-center text-sm text-green-400 font-semibold animate-pulse">
          All players ready! Starting soon...
        </p>
      {/if}
    </div>

    <!-- Right: Chat -->
    <div class="flex-1 flex flex-col p-5 bg-[var(--color-surface)] rounded-xl min-h-0">
      <h3 class="text-sm font-semibold mb-3 text-[var(--color-text-dim)]">CHAT</h3>
      <Chat />
    </div>
  </div>

  <!-- Connection warning -->
  {#if wsState === "reconnecting"}
    <div class="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-300 text-xs text-center">
      Connection lost — reconnecting...
    </div>
  {/if}
  {#if wsState === "disconnected" && !socket.isConnected}
    <div class="mt-3 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-xs text-center">
      Disconnected from server
    </div>
  {/if}
</div>

<style>
  .ready-btn {
    width: 100%;
    padding: 14px;
    border: 2px solid var(--color-primary);
    background: transparent;
    color: var(--color-primary);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .ready-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
  }
  .ready-btn.ready {
    background: #22663a;
    border-color: #33cc33;
    color: #33cc33;
  }
  .ready-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
