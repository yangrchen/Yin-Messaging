<script lang="ts">
    import type { ClientResponseError } from "pocketbase";
    import { onMount, onDestroy } from "svelte";
    import { currentUser, pb } from "./pocketbase";

    let messages = [];
    let newMessage: string;
    let unsubscribe: () => void;

    onMount(async () => {
        const resultList = await pb.collection("messages").getList(1, 50, {
            sort: "created",
            expand: "user",
        });

        messages = resultList.items;

        unsubscribe = await pb
            .collection("messages")
            .subscribe("*", async ({ action, record }) => {
                if (action === "create") {
                    const user = await pb
                        .collection("users")
                        .getOne(record.user);
                    record.expand = { user };
                    messages = [...messages, record];
                }
                if (action === "delete") {
                    messages = messages.filter((m) => m.id !== record.id);
                }
            });
    });

    onDestroy(() => {
        unsubscribe();
    });

    async function createMessage() {
        try {
            const data = {
                text: newMessage,
                user: $currentUser.id,
            };
            const createdMessage = await pb.collection("messages").create(data);
            newMessage = "";
        } catch (err) {
            const clientErr = err as ClientResponseError;
            console.log({ clientErr });
        }
    }
</script>

<div>
    {#each messages as message (message.id)}
        <div>
            <img
                src={`https://avatars.dicebear.com/api/identicon/${message.expand?.user?.username}.svg`}
                alt="avatar"
                class="avatar"
                width="40"
            />
        </div>
        <div>
            <small>
                Sent by @{message.expand?.user?.username}
            </small>
            <p>{message.text}</p>
        </div>
    {/each}
</div>

<form on:submit|preventDefault={createMessage}>
    <input
        type="text"
        bind:value={newMessage}
        placeholder="Send a Message..."
    />
    <button type="submit">Send</button>
</form>
