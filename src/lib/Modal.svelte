<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    const close = () => dispatch("close");

    let modal;

    const handle_keydown = (e) => {
        if (e.key === "Escape") {
            close();
            return;
        }

        // if (e.key === 'Tab') {
        // 	// trap focus
        // 	const nodes = modal.querySelectorAll('*');
        // 	const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

        // 	let index = tabbable.indexOf(document.activeElement);
        // 	if (index === -1 && e.shiftKey) index = 0;

        // 	index += tabbable.length + (e.shiftKey ? -1 : 1);
        // 	index %= tabbable.length;

        // 	tabbable[index].focus();
        // 	e.preventDefault();
        // }
    };

    // const previously_focused =
    //     typeof document !== "undefined" && document.activeElement;

    // if (previously_focused) {
    //     onDestroy(() => {
    //         previously_focused.focus();
    //     });
    // }
</script>

<svelte:window on:keydown={handle_keydown} />

<div
    class="fixed top-0 left-0 w-full h-full z-30"
    on:click={close}
    on:keydown
/>

<div
    class="absolute rounded-lg top-20 left-4 h-20 w-52 bg-gray-600 z-40 p-4"
    role="dialog"
    aria-modal="true"
    bind:this={modal}
>
    <slot name="header" />
    <hr />
    <slot />

    <!-- svelte-ignore a11y-autofocus -->
    <!-- <button autofocus on:click={close}>close modal</button> -->
</div>
