<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { lobbyStore } from "$lib/stores/lobby.svelte";
  import { socket } from "$lib/network/socket";
  import { handleServerMessage } from "$lib/network/handler";

  let chatInput = $state("");
  let isReady = $state(false);

  // Connect WebSocket when entering room
  $effect(() => {
    if (lobbyStore.room && authStore.token) {
      socket.connect(lobbyStore.room.join_code, authStore.token);
      const unsub = socket.onMessage(handleServerMessage);
      return () => {
        unsub();
        socket.disconnect();
      };
    }
  });

  function toggleReady() {
    isReady = !isReady;
    socket.send({ type: "player_ready", ready: isReady });
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    socket.send({ type: "chat_message", message: chatInput.trim() });
    chatInput = "";
  }

  function leaveRoom() {
    socket.disconnect();
    lobbyStore.clear();
    routerStore.navigate("lobby");
  }
</script>

<div class="flex flex-col h-full bg-[var(--color-bg)] p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-xl font-bold">Room</h2>
      <p class="text-[var(--color-accent)] font-mono text-lg tracking-widest">
        {lobbyStore.room?.join_code ?? "------"}
      </p>
    </div>
    <button class="text-sm text-[var(--color-text-dim)] hover:text-white" onclick={leaveRoom}>
      ← Leave Room
    </button>
  </div>

  <div class="flex gap-6 flex-1 min-h-0">
    <!-- Player list -->
    <div class="w-72 p-5 bg-[var(--color-surface)] rounded-xl">
      <h3 class="font-semibold mb-4">
        Players ({lobbyStore.players.length}/{lobbyStore.room?.max_players ?? 4})
      </h3>
      <div class="flex flex-col gap-2">
        {#each lobbyStore.players as player}
          <div class="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg">
            <span class="text-sm">{player.name}</span>
            <span class="text-xs {player.ready ? 'text-green-400' : 'text-[var(--color-text-dim)]'}">
              {player.ready ? "READY" : "waiting"}
            </span>
          </div>
        {/each}
        {#if lobbyStore.players.length === 0}
          <p class="text-sm text-[var(--color-text-dim)]">Waiting for players...</p>
        {/if}
      </div>

      <button
        class="w-full mt-6 py-3 rounded-lg font-semibold text-sm transition-colors {isReady
          ? 'bg-green-600 text-white'
          : 'bg-[var(--color-primary)] text-white'}"
        onclick={toggleReady}
      >
        {isReady ? "✓ READY" : "READY UP"}
      </button>
    </div>

    <!-- Chat -->
    <div class="flex-1 flex flex-col p-5 bg-[var(--color-surface)] rounded-xl">
      <h3 class="font-semibold mb-3">Chat</h3>
      <div class="flex-1 overflow-y-auto mb-3 space-y-1">
        {#each lobbyStore.chatMessages as msg}
          <p class="text-sm">
            <span class="text-[var(--color-accent)]">{msg.sender}:</span>
            {msg.message}
          </p>
        {/each}
      </div>
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          bind:value={chatInput}
          class="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-surface-light)] rounded text-sm text-[var(--color-text)] outline-none"
          onkeydown={(e: KeyboardEvent) => e.key === "Enter" && sendChat()}
        />
        <button
          class="px-4 py-2 bg-[var(--color-primary)] text-white rounded text-sm"
          onclick={sendChat}
        >
          Send
        </button>
      </div>
    </div>
  </div>
</div>
