<script lang="ts">
  import { lobbyStore, type ChatMessage } from "$lib/stores/lobby.svelte";
  import { socket } from "$lib/network/socket";

  let chatInput = $state("");
  let chatContainer: HTMLDivElement;
  let isAtBottom = $state(true);

  // Auto-scroll when new messages arrive (only if user is at bottom)
  $effect(() => {
    const _ = lobbyStore.chatMessages.length;
    if (isAtBottom && chatContainer) {
      requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    }
  });

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
  }

  function sendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    socket.send({ type: "chat_message", message: msg });
    chatInput = "";
  }

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
</script>

<div class="chat-wrapper">
  <div
    class="chat-messages"
    bind:this={chatContainer}
    onscroll={handleScroll}
  >
    {#each lobbyStore.chatMessages as msg (msg.id)}
      {#if msg.isSystem}
        <p class="chat-system">
          <span class="chat-time">{formatTime(msg.timestamp)}</span>
          {msg.message}
        </p>
      {:else}
        <p class="chat-msg">
          <span class="chat-time">{formatTime(msg.timestamp)}</span>
          <span class="chat-sender">{msg.senderName}</span>
          {msg.message}
        </p>
      {/if}
    {/each}

    {#if lobbyStore.chatMessages.length === 0}
      <p class="chat-empty">No messages yet</p>
    {/if}
  </div>

  {#if !isAtBottom}
    <button
      class="scroll-btn"
      onclick={() => { chatContainer.scrollTop = chatContainer.scrollHeight; }}
    >
      ↓ New messages
    </button>
  {/if}

  <div class="chat-input-row">
    <input
      type="text"
      placeholder="Type a message..."
      bind:value={chatInput}
      maxlength="200"
      class="chat-input"
      onkeydown={(e: KeyboardEvent) => e.key === "Enter" && sendChat()}
    />
    <button class="chat-send" onclick={sendChat} disabled={!chatInput.trim()}>
      Send
    </button>
  </div>
</div>

<style>
  .chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    scrollbar-width: thin;
    scrollbar-color: var(--color-surface-light) transparent;
  }
  .chat-msg, .chat-system {
    font-size: 13px;
    line-height: 1.4;
    padding: 2px 0;
    word-break: break-word;
  }
  .chat-system {
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 12px;
  }
  .chat-time {
    color: var(--color-text-dim);
    font-size: 10px;
    margin-right: 6px;
    opacity: 0.6;
  }
  .chat-sender {
    color: var(--color-accent);
    font-weight: 600;
    margin-right: 4px;
  }
  .chat-sender::after {
    content: ":";
  }
  .chat-empty {
    font-size: 12px;
    color: var(--color-text-dim);
    text-align: center;
    padding: 20px 0;
  }
  .scroll-btn {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 12px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 11px;
    cursor: pointer;
    z-index: 2;
  }
  .chat-input-row {
    display: flex;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--color-surface-light);
  }
  .chat-input {
    flex: 1;
    padding: 8px 12px;
    background: var(--color-bg);
    border: 1px solid var(--color-surface-light);
    border-radius: 6px;
    color: var(--color-text);
    font-size: 13px;
    outline: none;
  }
  .chat-input:focus { border-color: var(--color-primary); }
  .chat-send {
    padding: 8px 16px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }
  .chat-send:hover:not(:disabled) { background: var(--color-primary-dark); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
