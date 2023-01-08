<script lang="ts">
    import type { ClientResponseError } from "pocketbase";
    import { currentUser, pb } from "./pocketbase";
    import Messages from "./Messages.svelte";
    import Chatboard from "./Chatboard.svelte";
    import Icon from "@iconify/svelte";

    let username = "";
    let password = "";
    let passwordConfirm = "";
    let firstName = "";
    let lastName = "";
    let clientError: ClientResponseError;
    let isRegistering = false;

    async function login() {
        try {
            await pb.collection("users").authWithPassword(username, password);
        } catch (err) {
            clientError = err as ClientResponseError;
        }
    }

    async function signUp() {
        try {
            const data = {
                username,
                firstName,
                lastName,
                password,
                passwordConfirm: passwordConfirm,
            };
            const createdUser = await pb.collection("users").create(data);
            await login();
        } catch (err) {
            clientError = err as ClientResponseError;
        }
    }
</script>

<h1 class="fixed text-white text-4xl text-center top-24 left-0 right-0">
    Yin Messaging
</h1>
<div class="flex flex-col items-center h-full justify-center">
    {#if clientError}
        <div class="flex gap-x-2 text-red-500 mb-4">
            <Icon
                icon="material-symbols:error-circle-rounded"
                class="text-2xl"
            />
            <p>{clientError.message}</p>
        </div>
    {/if}
    {#if isRegistering}
        <form
            action="#"
            on:submit|preventDefault={signUp}
            class="flex flex-col text-white gap-4 w-full md:w-2/3 lg:w-1/3"
        >
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:user" class="text-2xl" />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    bind:value={username}
                />
            </div>
            <div class="flex w-full gap-4">
                <div
                    class="flex gap-4 border-2 rounded-full px-6 items-center w-1/2"
                >
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                        bind:value={firstName}
                    />
                </div>
                <div
                    class="flex gap-4 border-2 rounded-full px-6 items-center w-1/2"
                >
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                        bind:value={lastName}
                    />
                </div>
            </div>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:lock" class="text-2xl" />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    bind:value={password}
                />
            </div>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:repeat-variant" class="text-2xl" />
                <input
                    type="password"
                    name="confirm-password"
                    placeholder="Repeat Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    bind:value={passwordConfirm}
                />
            </div>
            <button
                type="submit"
                disabled={!username ||
                    !password ||
                    !passwordConfirm ||
                    passwordConfirm !== password}
                class={!username ||
                !password ||
                !passwordConfirm ||
                passwordConfirm !== password
                    ? "bg-gray-300 py-2 px-4 rounded font-bold w-full text-lg self-center mt-4"
                    : "bg-purple-600 py-2 px-4 rounded font-bold w-full text-lg hover:bg-purple-700 self-center mt-4"}
                >Sign Up</button
            >
        </form>
    {:else}
        <form
            action="#"
            on:submit|preventDefault={login}
            class="flex flex-col text-white gap-4 w-full md:w-2/3 lg:w-1/3"
        >
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:user" class="text-2xl" />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    bind:value={username}
                />
            </div>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="material-symbols:lock" class="text-2xl" />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    bind:value={password}
                />
            </div>
            <button
                type="submit"
                disabled={!username || !password}
                class={!username || !password
                    ? "bg-gray-300 py-2 px-4 rounded font-bold w-full text-lg self-center mt-4"
                    : "bg-purple-600 py-2 px-4 rounded font-bold w-full text-lg hover:bg-purple-700 self-center mt-4"}
                >Login</button
            >
            <p class="text-sm text-center">
                Don't have an account with us? <span
                    class="text-purple-400"
                    on:click={() => {
                        username = "";
                        password = "";
                        isRegistering = true;
                    }}
                    on:keydown>Sign up</span
                >
            </p>
        </form>
    {/if}
</div>
