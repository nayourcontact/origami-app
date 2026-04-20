import { ref } from "vue";
import axios from "axios";
import { API_BASE_URL, INSTAGRAM_USER_ID } from "../config.js";
import { t } from "../locales";

export const posts = ref(null);
export const isLoading = ref(false);
export const hasMore = ref(true);
export const page = ref(1);

const limit = 9;
let lastCall = 0;

const toAbsoluteMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url}`;
};

export async function loadMorePosts(currentLanguage) {
    if (isLoading.value || !hasMore.value) return;
    isLoading.value = true;

    try {
        const res = await axios.get(
            `${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}?page=${page.value}&limit=${limit}`
        );

        const newPosts = (res.data?.posts || []).map(post => ({
            ...post,
            mediaUrl: toAbsoluteMediaUrl(post.mediaUrl),
            thumbnailUrl: toAbsoluteMediaUrl(post.thumbnailUrl),
        }));

        posts.value.push(...newPosts);
        page.value++;

        if (posts.value.length >= res.data.total) {
            hasMore.value = false;
        }
    } catch (err) {
        console.error("Could not load more posts:", err);
        setTimeout(() => {
            window.showToast?.(
                t(currentLanguage.value, "errorGalleryLoad"),
                "error"
            );
        });
    } finally {
        isLoading.value = false;
    }
}
