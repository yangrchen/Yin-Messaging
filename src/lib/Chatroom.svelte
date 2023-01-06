<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { pb, currentUser, currentGroup } from "./pocketbase";

    let messages = [];
    let inputText = "";
    let unsubscribe: () => void;
    $: $currentGroup && getMessages();

    onMount(async () => {
        unsubscribe = await pb
            .collection("messages")
            .subscribe("*", async ({ action, record }) => {
                if (action === "create") {
                    if (record.group === $currentGroup.id) {
                        const sender = await pb
                            .collection("users")
                            .getOne(record.sender);
                        record.expand = { sender };
                        messages = [...messages, record];
                    }
                }
            });
    });
    async function getMessages() {
        const messagesList = await pb.collection("messages").getList(1, 1000, {
            filter: `group='${$currentGroup.id}'`,
            sort: "created",
            expand: "sender",
        });
        messages = messagesList.items;
    }
    async function handleSubmit() {
        try {
            const messageData = {
                sender: $currentUser.id,
                group: $currentGroup.id,
                text: inputText,
            };
            const createdMessage = await pb
                .collection("messages")
                .create(messageData);
            const updatedRecentMessage = await pb
                .collection("groups")
                .update($currentGroup.id, { recentMessage: createdMessage.id });
            inputText = "";
        } catch (err) {
            // TODO: Handle error
            console.log(err);
        }
    }
    onDestroy(() => {
        unsubscribe();
    });
</script>

<div class="mx-2 overflow-hidden mt-6">
    {#if $currentGroup}
        <h2 class="text-white">{$currentGroup.title}</h2>
        <div class="h-[38em] flex flex-col overflow-y-scroll px-5 mt-8">
            {#each messages as message}
                {@const isCurrentUser =
                    message.expand?.sender?.id === $currentUser.id}
                <div class="flex gap-2" class:self-end={isCurrentUser}>
                    {#if !isCurrentUser}
                        <img
                            src={`https://avatars.dicebear.com/api/identicon/${message.expand?.sender.name}.svg`}
                            class="h-10 rounded-full bg-white p-1"
                            alt=""
                        />
                    {/if}
                    <p
                        class="bg-blue-400 text-white mb-4 max-w-fit p-2 rounded-tl rounded-tr rounded-bl"
                        class:bg-gray-400={!isCurrentUser}
                    >
                        {message.text}
                    </p>
                </div>
            {/each}
        </div>
        <form
            action="#"
            on:submit|preventDefault={handleSubmit}
            class="flex justify-between absolute bottom-2 w-2/3 right-0"
        >
            <input
                type="text"
                bind:value={inputText}
                placeholder="Send a message..."
                class="w-full mx-4 py-1 focus:outline-none grow-0 rounded-full px-4 bg-gray-600 placeholder-gray-300 caret-white text-white"
            />
        </form>
    {/if}
</div>
