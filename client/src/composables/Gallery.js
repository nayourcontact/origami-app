import { ref } from "vue";
import axios from "axios";
import { API_BASE_URL, INSTAGRAM_USER_ID } from "../config.js";

export const posts = ref([]);
export const isLoading = ref(false);
export const hasMore = ref(true);
export const page = ref(1);

const limit = 21;
let lastCall = 0;

export async function loadMorePosts() {
    const now = Date.now();
    if (isLoading.value || !hasMore.value || now - lastCall < 500) return;

    lastCall = now;
    isLoading.value = true;

    try {
        const res = await axios.get(
            `${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}?page=${page.value}&limit=${limit}`
        );
        const newPosts = res.data?.posts || [];

        posts.value.push(...newPosts);
        page.value++;

        if (posts.value.length >= res.data.total) {
            hasMore.value = false;
        }
    } catch (err) {
        console.error("Could not load more posts:", err);
        setTimeout(() => {
            window.showToast?.("Nem sikerült a gallériát betölteni. Próbáld újra később!", "error");
        }, );
    } finally {
        isLoading.value = false;
    }
}
