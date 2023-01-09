<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import Chatroom from "./Chatroom.svelte";
    import type { Group } from "../types";
    import { pb, currentGroup, groups, currentUser } from "./pocketbase";
    import Icon from "@iconify/svelte";
    import UsersList from "./UsersList.svelte";
    import Modal from "../lib/Modal.svelte";

    let isCreate = false;
    let showModal = false;
    let unsubscribe: () => void;

    onMount(async () => {
        const groupList = await pb.collection("groups").getList<Group>(1, 50, {
            sort: "created",
            expand: "recentMessage",
        });
        $groups = groupList.items;

        unsubscribe = await pb
            .collection("groups")
            .subscribe<Group>("*", async ({ action, record }) => {
                if (action === "create") {
                    $groups = [...$groups, record as Group];
                }
                if (action === "update") {
                    const recentMessage = await pb
                        .collection("messages")
                        .getOne(record.recentMessage);
                    record.expand = { recentMessage };
                    const replacedGroupIdx = $groups.findIndex(
                        (group) => group.id == record.id
                    );
                    $groups[replacedGroupIdx] = record;
                }
            });
    });
    onDestroy(() => {
        console.count("unmounted chatboard");
        unsubscribe();
    });

    function changeGroup(group: Group) {
        if ($currentGroup?.id === group.id) return;
        $currentGroup = group;
    }

    async function signOut() {
        pb.authStore.clear();
        $currentGroup = null;
    }
</script>

<!-- {#if isCreate}
    <UsersList bind:isCreate />
{:else} -->
<div class="flex">
    <div
        class="w-full md:w-1/3 p-4 md:block"
        class:hidden={$currentGroup != null}
    >
        <div class="mb-8 flex items-center text-white justify-between">
            <div class="flex items-center gap-x-4">
                <img
                    src={`https://avatars.dicebear.com/api/identicon/${
                        $currentUser.firstName + " " + $currentUser.lastName
                    }.svg`}
                    alt="avatar"
                    class="rounded-full h-16 border-2 p-2 cursor-pointer"
                    on:click={() => (showModal = true)}
                    on:keydown
                />
                <p class="text-bold text-lg">
                    {$currentUser.firstName + " " + $currentUser.lastName}
                </p>
            </div>
            <button
                class="rounded-md text-2xl font-bold bg-gray-500 text-white p-3"
                on:click={() => (isCreate = true)}
                ><Icon icon="system-uicons:write" /></button
            >
            {#if showModal}
                <Modal on:close={() => (showModal = false)}>
                    <h2 slot="header">
                        {$currentUser.firstName + " " + $currentUser.lastName}
                    </h2>
                    <div
                        class="flex items-center gap-2 hover:text-red-400 font-semibold text-red-500 transition-colors duration-200 mt-2"
                    >
                        <Icon icon="material-symbols:logout" class="text-xl" />
                        <button on:click={signOut}>Sign Out </button>
                    </div>
                </Modal>
            {/if}
        </div>
        {#if isCreate}
            <UsersList bind:isCreate />
        {:else}
            <div>
                {#each $groups as group (group.id)}
                    <div
                        class={$currentGroup?.id === group.id
                            ? "flex gap-3 px-2 py-4 cursor-pointer bg-gray-200/10 rounded-lg"
                            : "flex gap-3 px-2 py-4 cursor-pointer hover:bg-gray-200/10 rounded-lg"}
                        on:click={() => {
                            changeGroup(group);
                        }}
                        on:keydown
                    >
                        <img
                            src={`https://avatars.dicebear.com/api/identicon/${group.title}.svg`}
                            alt=""
                            class="rounded-full h-12"
                        />
                        <div class="self-center w-2/3">
                            <p class="text-white justify-self-center font-bold">
                                {group.title}
                            </p>
                            <p class="text-gray-300 truncate">
                                {group.expand?.recentMessage?.text ?? ""}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <div
        class="w-full md:w-2/3"
        class:hidden={$currentGroup == null}
        class:block={$currentGroup != null}
    >
        {#if $currentGroup}
            <Chatroom />
        {/if}
    </div>
</div>
