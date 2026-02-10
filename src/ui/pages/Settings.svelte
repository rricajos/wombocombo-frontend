<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { settingsStore } from "$lib/stores/settings.svelte";

  function save() {
    settingsStore.save();
    routerStore.back();
  }
</script>

<div class="flex flex-col items-center justify-center h-full bg-[var(--color-bg)]">
  <div class="w-full max-w-md p-8 bg-[var(--color-surface)] rounded-xl">
    <h2 class="text-2xl font-bold mb-6">Settings</h2>

    <div class="flex flex-col gap-5">
      <div>
        <label class="setting-label">Master Volume</label>
        <input type="range" min="0" max="1" step="0.1" bind:value={settingsStore.masterVolume} class="w-full" />
      </div>
      <div>
        <label class="setting-label">Music Volume</label>
        <input type="range" min="0" max="1" step="0.1" bind:value={settingsStore.musicVolume} class="w-full" />
      </div>
      <div>
        <label class="setting-label">SFX Volume</label>
        <input type="range" min="0" max="1" step="0.1" bind:value={settingsStore.sfxVolume} class="w-full" />
      </div>
      <div class="flex items-center justify-between">
        <label class="setting-label">Show FPS</label>
        <input type="checkbox" bind:checked={settingsStore.showFPS} />
      </div>
    </div>

    <div class="flex gap-3 mt-8">
      <button
        class="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold"
        onclick={save}
      >
        Save
      </button>
      <button
        class="flex-1 py-3 bg-[var(--color-surface-light)] text-[var(--color-text)] rounded-lg"
        onclick={() => routerStore.back()}
      >
        Cancel
      </button>
    </div>
  </div>
</div>

<style>
  .setting-label {
    display: block;
    font-size: 13px;
    color: var(--color-text-dim);
    margin-bottom: 6px;
  }
</style>
