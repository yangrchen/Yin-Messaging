<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from "svelte";
    import { pb, currentUser, currentGroup } from "./pocketbase";

    let inputText = "";
    let chatbox: HTMLElement;
    let autoscroll;
    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    // TODO: Add custom types for messagesByDate
    let messagesByDate: Object = {};
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
                        if (today in messagesByDate) {
                            messagesByDate[today] = [
                                ...messagesByDate[today],
                                record,
                            ];
                        } else {
                            messagesByDate[today] = [record];
                        }
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
    onDestroy(() => {
        console.count("unmounted chatroom");
        unsubscribe();
    });

    const groupMessages = (messages: any[]) => {
        messagesByDate = {};
        messages.forEach((message) => {
            const createdDate = new Date(message.created).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
            );
            if (createdDate in messagesByDate) {
                messagesByDate[createdDate].push(message);
            } else {
                messagesByDate[createdDate] = [message];
            }
        });
        messagesByDate = messagesByDate;
    };
    async function getMessages() {
        const messagesList = await pb.collection("messages").getList(1, 1000, {
            filter: `group='${$currentGroup.id}'`,
            sort: "created",
            expand: "sender",
        });
        groupMessages(messagesList.items);
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
        }
    }
</script>

<div class="mx-2 overflow-hidden mt-6 text-white">
    <div class="flex items-center gap-2 text-2xl">
        <button on:click={() => ($currentGroup = null)} class="md:hidden">
            <Icon icon="material-symbols:arrow-back" />
        </button>
        <h2>{$currentGroup.title}</h2>
    </div>
    <div
        class="h-[70vh] flex flex-col overflow-y-scroll px-5 mt-8 gap-y-2"
        bind:this={chatbox}
    >
        {#each Object.entries(messagesByDate) as [date, messages]}
            <h2
                class="rounded-full bg-blue-900 self-center py-1 px-4 text-bold my-6"
            >
                {date}
            </h2>
            {#each messages as message}
                {@const isCurrentUser =
                    message.expand?.sender?.id === $currentUser.id}
                {@const messageDate = new Date(message.created).toLocaleString(
                    "en-US",
                    { timeStyle: "short" }
                )}
                <div class="flex gap-2" class:self-end={isCurrentUser}>
                    {#if !isCurrentUser}
                        <img
                            src={`https://avatars.dicebear.com/api/identicon/${message.expand?.sender.name}.svg`}
                            class="h-10 rounded-full bg-white p-1"
                            alt=""
                        />
                    {/if}
                    <div
                        class="flex gap-4 bg-blue-400 max-w-fit p-2 rounded-tl rounded-tr rounded-bl relative"
                        class:bg-gray-600={!isCurrentUser}
                    >
                        <p>
                            {message.text}
                        </p>
                        <small class="text-xs text-gray-200 self-end"
                            >{messageDate}</small
                        >
                    </div>
                </div>
            {/each}
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
