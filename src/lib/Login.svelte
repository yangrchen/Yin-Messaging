<script lang="ts">
    import type { ClientResponseError } from "pocketbase";
    import { currentUser, pb } from "./pocketbase";
    import Messages from "./Messages.svelte";
    import Chatboard from "./Chatboard.svelte";

    let username: string;
    let password: string;

    async function login() {
        await pb.collection("users").authWithPassword(username, password);
    }

    async function signUp() {
        try {
            const data = {
                username,
                name: username,
                password,
                passwordConfirm: password,
            };
            const createdUser = await pb.collection("users").create(data);
            await login();
        } catch (err) {
            // TODO: Handle error
            const clientErr = err as ClientResponseError;
            console.log({ clientErr });
        }
    }
</script>

{#if $currentUser}
    <div class="h-full relative">
        <Chatboard />
        <!-- <button on:click={signOut}>Sign Out</button> -->
    </div>
    <!-- <Messages /> -->
{:else}
    <form
        action="#"
        on:submit|preventDefault
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 space-y-4"
    >
        <div>
            <label
                for="username"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Username</label
            >
            <input
                type="text"
                name="username"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                bind:value={username}
            />
        </div>
        <div>
            <label
                for="password"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Password</label
            >
            <input
                type="password"
                name="password"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                bind:value={password}
            />
        </div>
        <button on:click={signUp}>Sign Up</button>
        <button on:click={login}>Login</button>
    </form>
{/if}
