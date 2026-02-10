<script lang="ts">
  import { routerStore } from "$lib/stores/router.svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import { login } from "$lib/api/auth";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleLogin() {
    error = "";
    loading = true;
    try {
      await login(email, password);
      routerStore.navigate("lobby");
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-full bg-[var(--color-bg)]">
  <div class="w-full max-w-sm p-8 bg-[var(--color-surface)] rounded-xl">
    <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

    {#if error}
      <div class="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
        {error}
      </div>
    {/if}

    <div class="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        bind:value={email}
        class="input-field"
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && handleLogin()}
      />
      <input
        type="password"
        placeholder="Password"
        bind:value={password}
        class="input-field"
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && handleLogin()}
      />
      <button
        class="btn-primary"
        onclick={handleLogin}
        disabled={loading || !email || !password}
      >
        {loading ? "Logging in..." : "LOGIN"}
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-[var(--color-text-dim)]">
      Don't have an account?
      <button class="text-[var(--color-accent)] underline" onclick={() => routerStore.navigate("register")}>
        Register
      </button>
    </p>
    <p class="mt-2 text-center">
      <button class="text-sm text-[var(--color-text-dim)]" onclick={() => routerStore.back()}>
        ← Back
      </button>
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
    transition: border 0.15s;
  }
  .input-field:focus {
    border-color: var(--color-primary);
  }
  .btn-primary {
    padding: 12px 24px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
