<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from "svelte";
    import { pb, currentUser, currentGroup } from "./pocketbase";

    let messages = [];
    let inputText = "";
    let chatbox: HTMLElement;
    let autoscroll;
    let unsubscribe: () => void;
    $: $currentGroup && getMessages();

    onMount(async () => {
        console.log("chatroom opened");
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
                        chatbox.scrollTo(0, chatbox.scrollHeight);
                    }
                }
            });
    });
    beforeUpdate(() => {
        autoscroll =
            chatbox &&
            chatbox.offsetHeight + chatbox.scrollTop >
                chatbox.scrollHeight - 20;
    });

    afterUpdate(() => {
        if (autoscroll) chatbox.scrollTo(0, chatbox.scrollHeight);
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

<div class="mx-2 overflow-hidden mt-6 text-white">
    <div class="flex items-center gap-2 text-2xl">
        <button on:click={() => ($currentGroup = null)} class="md:hidden">
            <Icon icon="material-symbols:arrow-back" />
        </button>
        <h2>{$currentGroup.title}</h2>
    </div>
    <div
        class="h-[70vh] flex flex-col overflow-y-scroll px-5 mt-8"
        bind:this={chatbox}
    >
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
                    class="bg-blue-400 mb-4 max-w-fit p-2 rounded-tl rounded-tr rounded-bl"
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
        class="flex justify-between absolute bottom-0.5 lg:bottom-2 w-full md:w-2/3 right-0"
    >
        <input
            type="text"
            bind:value={inputText}
            placeholder="Send a message..."
            class="w-full mx-4 py-1 focus:outline-none grow-0 rounded-full px-4 bg-gray-600 placeholder-gray-300 caret-white"
        />
    </form>
</div>
