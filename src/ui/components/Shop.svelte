<script lang="ts">
  import { gameStore } from "$lib/stores/game.svelte";
  import { socket } from "$lib/network/socket";

  const isOpen = $derived(gameStore.phase === "shop");
  const items = $derived(gameStore.shopItems);
  const gold = $derived(gameStore.gold);

  let buyingId = $state<string | null>(null);

  function buyItem(itemId: string, cost: number) {
    if (gold < cost || buyingId) return;
    buyingId = itemId;
    socket.send({ type: "buy_item", item_id: itemId });
    // Reset after brief delay (server will confirm/deny)
    setTimeout(() => (buyingId = null), 500);
  }
</script>

{#if isOpen}
  <div class="shop-overlay">
    <div class="shop-panel">
      <div class="shop-header">
        <div class="shop-title">SHOP</div>
        <div class="gold-display">
          <span class="gold-icon">●</span>
          <span class="gold-amount">{gold}</span>
        </div>
      </div>

      <div class="shop-subtitle">
        Round {gameStore.round} complete — Spend your gold!
      </div>

      {#if items.length === 0}
        <div class="no-items">No items available</div>
      {:else}
        <div class="item-grid">
          {#each items as item}
            <button
              class="item-card"
              class:affordable={gold >= item.cost}
              class:buying={buyingId === item.id}
              disabled={gold < item.cost || buyingId !== null}
              onclick={() => buyItem(item.id, item.cost)}
            >
              <div class="item-icon">
                {item.name.charAt(0).toUpperCase()}
              </div>
              <div class="item-details">
                <div class="item-name">{item.name}</div>
                <div class="item-desc">{item.description}</div>
              </div>
              <div class="item-cost" class:too-expensive={gold < item.cost}>
                <span class="cost-icon">●</span>
                {item.cost}
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <div class="shop-footer">
        <span class="next-round">Next round starting soon...</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .shop-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
    z-index: 50;
    animation: fadeIn 0.3s ease-out;
  }

  .shop-panel {
    background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%);
    border: 2px solid #333;
    border-radius: 12px;
    padding: 24px;
    min-width: 400px;
    max-width: 520px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }

  .shop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .shop-title {
    font-family: "Press Start 2P", monospace;
    font-size: 20px;
    color: #ffcc00;
    text-shadow: 0 0 10px rgba(255, 204, 0, 0.4);
    letter-spacing: 4px;
  }

  .gold-display {
    font-family: "Press Start 2P", monospace;
    font-size: 14px;
    color: #ffdd00;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .gold-icon {
    font-size: 10px;
    color: #ffdd00;
  }

  .shop-subtitle {
    font-family: "Press Start 2P", monospace;
    font-size: 8px;
    color: #777;
    margin-bottom: 20px;
  }

  .no-items {
    font-family: "Press Start 2P", monospace;
    font-size: 10px;
    color: #666;
    text-align: center;
    padding: 30px;
  }

  .item-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .item-card.affordable:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #6c5ce7;
    transform: translateX(4px);
  }

  .item-card:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .item-card.buying {
    border-color: #ffcc00;
    animation: buyFlash 0.3s ease-out;
  }

  .item-icon {
    width: 40px;
    height: 40px;
    background: rgba(108, 92, 231, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Press Start 2P", monospace;
    font-size: 16px;
    color: #6c5ce7;
    flex-shrink: 0;
  }

  .item-details {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-family: "Press Start 2P", monospace;
    font-size: 10px;
    color: #eee;
    margin-bottom: 4px;
  }

  .item-desc {
    font-family: "Press Start 2P", monospace;
    font-size: 7px;
    color: #888;
    line-height: 1.6;
  }

  .item-cost {
    font-family: "Press Start 2P", monospace;
    font-size: 12px;
    color: #ffdd00;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .item-cost.too-expensive {
    color: #cc3333;
  }

  .cost-icon {
    font-size: 8px;
  }

  .shop-footer {
    margin-top: 16px;
    text-align: center;
  }

  .next-round {
    font-family: "Press Start 2P", monospace;
    font-size: 8px;
    color: #555;
    animation: pulse 2s infinite;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes buyFlash {
    0% { background: rgba(255, 204, 0, 0.2); }
    100% { background: rgba(255, 255, 255, 0.04); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
