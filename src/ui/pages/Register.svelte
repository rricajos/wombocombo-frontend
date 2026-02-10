<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { register } from "$lib/api/auth";

  let username = $state("");
  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleRegister() {
    error = "";
    loading = true;
    try {
      await register(username, email, password);
      routerStore.navigate("lobby");
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Registration failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-full bg-[var(--color-bg)]">
  <div class="w-full max-w-sm p-8 bg-[var(--color-surface)] rounded-xl">
    <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>

    {#if error}
      <div class="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
        {error}
      </div>
    {/if}

    <div class="flex flex-col gap-4">
      <input type="text" placeholder="Username" bind:value={username} class="input-field" />
      <input type="email" placeholder="Email" bind:value={email} class="input-field" />
      <input
        type="password"
        placeholder="Password (min 8 chars)"
        bind:value={password}
        class="input-field"
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && handleRegister()}
      />
      <button
        class="btn-primary"
        onclick={handleRegister}
        disabled={loading || !username || !email || !password}
      >
        {loading ? "Creating account..." : "REGISTER"}
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-[var(--color-text-dim)]">
      Already have an account?
      <button class="text-[var(--color-accent)] underline" onclick={() => routerStore.navigate("login")}>
        Login
      </button>
    </p>
    <p class="mt-2 text-center">
      <button class="text-sm text-[var(--color-text-dim)]" onclick={() => routerStore.back()}>← Back</button>
    </p>
  </div>
</div>

<style>
  .input-field {
    width: 100%;
    padding: 12px 16px;
    background: var(--color-bg);
    border: 1px solid var(--color-surface-light);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 14px;
    outline: none;
  }
  .input-field:focus { border-color: var(--color-primary); }
  .btn-primary {
    padding: 12px 24px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
