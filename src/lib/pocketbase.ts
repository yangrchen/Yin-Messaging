import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import type { Group } from '../types';

// TODO: On deploy change the IP address
export const pb = new PocketBase(`${import.meta.env.VITE_POCKETBASE_URL}`);

export const currentUser = writable(pb.authStore.model);

export const currentGroup = writable<Group>();
export const groups = writable<Group[]>([]);

pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model);
})