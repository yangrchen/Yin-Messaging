import type { Record } from "pocketbase";
export interface Group {
    id: string;
    title: string;
    recentMessage: string;
    expand: { [key: string]: Record | Record[] | any };
}