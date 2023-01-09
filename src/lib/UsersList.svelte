<script lang="ts">
    import { onMount } from "svelte";
    import { pb, currentUser } from "./pocketbase";
    import Icon from "@iconify/svelte";

    onMount(async () => {
        // TODO: Implement friends system and only query for friends
        const usersList = await pb
            .collection("users")
            .getList(1, 50, { sort: "firstName" });
        users = usersList.items.filter((user) => user.id !== $currentUser.id);
    });

    export let isCreate: boolean;
    let users = [];
    let selectedUsers = [];
    let groupTitle = "";

    async function createGroup() {
        try {
            const data = {
                title: groupTitle,
                members: [...selectedUsers, $currentUser.id],
                createdBy: $currentUser.id,
            };
            const createdGroup = await pb.collection("groups").create(data);
            selectedUsers = [];
            isCreate = false;
        } catch (err) {}
    }
</script>

<div class="text-white relative flex flex-col gap-10">
    <div class="flex gap-3">
        <button on:click={() => (isCreate = false)}
            ><Icon icon="material-symbols:arrow-back" class="text-xl" /></button
        >
        <h2>Start a new conversation!</h2>
    </div>
    <form action="#" on:submit|preventDefault class="flex flex-col gap-4">
        <input
            type="text"
            class="text-white bg-gray-600 rounded-lg px-4 py-2 placeholder-slate-200 required:border-red-500 w-full"
            required
            placeholder="Group Name"
            bind:value={groupTitle}
        />
        {#each users as user (user.id)}
            {@const userSelected = selectedUsers.includes(user.id)}
            {@const name = user.firstName + " " + user.lastName}
            <div
                class={"flex items-center gap-3 py-2 px-4 cursor-pointer hover:bg-gray-200/10 rounded-lg w-full"}
                on:click={() => {
                    if (userSelected) {
                        selectedUsers = selectedUsers.filter(
                            (id) => id !== user.id
                        );
                    } else {
                        selectedUsers = [...selectedUsers, user.id];
                    }
                }}
                on:keydown
            >
                <div class="rounded-full p-2 bg-white">
                    <img
                        src={`https://avatars.dicebear.com/api/identicon/${name}.svg`}
                        alt=""
                        width="50"
                        class="rounded-full"
                    />
                </div>
                <p class="font-bold">{name}</p>
                <div class="text-xl" class:text-green-300={userSelected}>
                    <Icon
                        icon={userSelected
                            ? "carbon:checkmark-filled"
                            : "carbon:checkmark-outline"}
                    />
                </div>
            </div>
        {/each}
        <button
            type="submit"
            disabled={Array.isArray(selectedUsers) &&
                !selectedUsers.length &&
                !groupTitle}
            class="rounded bg-blue-400 p-3"
            class:bg-gray-300={(Array.isArray(selectedUsers) &&
                !selectedUsers.length) ||
                !groupTitle}
            on:click={createGroup}
        >
            Create Group
        </button>
    </form>
</div>
