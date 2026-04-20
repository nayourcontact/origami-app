import {ref} from "vue";
import axios from "axios";
import {API_BASE_URL, INSTAGRAM_USER_ID} from "../config.js";
import {t} from "../locales";
import DOMPurify from "isomorphic-dompurify";

export const introImage = ref(null);
export const posts = ref(null);
export const gallery = ref(null);
export const bio = ref("Travel with me to the World of Origami!");

function mapInstagramMessageToKey(message) {
    const map = {
        "Nem található biográfia az Instagramon.": "instagramBioNotFound",
        "Nem sikerült lekérni a biográfiát. Próbáld újra később!": "instagramBioError",
        "Nem sikerült betölteni az Instagram posztokat. Próbálja meg később!": "instagramPostsError"
    };
    return map[message] || null;
}

export async function initBio(currentLanguage) {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/biography/${INSTAGRAM_USER_ID}`);
        if (!res.data?.user?.biography) {
            const key = mapInstagramMessageToKey("Nem található biográfia az Instagramon.");
            window.showToast?.(t(currentLanguage, key || "instagramBioNotFound"), "info");
        }

        bio.value = DOMPurify.sanitize(res.data?.user?.biography || '', {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });
    } catch (err) {
        const key = mapInstagramMessageToKey("Nem sikerült lekérni a biográfiát. Próbáld újra később!");
        window.showToast?.(t(currentLanguage, key || "instagramBioError"), "error");
    }
}

const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const fetchAllPosts = async () => {
    const firstRes = await axios.get(
        `${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}?page=1&limit=100`
    );

    const firstPosts = (firstRes.data?.posts || []).map(normalizePostMedia);
    const total = firstRes.data?.total || 0;
    const pageCount = firstRes.data?.pageCount || 1;

    let allPosts = [...firstPosts];

    if (pageCount > 1) {
        const requests = [];

        for (let page = 2; page <= pageCount; page++) {
            requests.push(
                axios.get(`${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}?page=${page}&limit=100`)
            );
        }

        const responses = await Promise.all(requests);

        for (const res of responses) {
            const pagePosts = (res.data?.posts || []).map(normalizePostMedia);
            allPosts.push(...pagePosts);
        }
    }

    return allPosts.slice(0, total);
};

const normalizePostMedia = (post) => ({
    ...post,
    mediaUrl: toAbsoluteMediaUrl(post.mediaUrl),
    thumbnailUrl: toAbsoluteMediaUrl(post.thumbnailUrl),
});

export async function initNewSixPosts(currentLanguage) {
    try {
        const allPosts = await fetchAllPosts();

        if (!Array.isArray(allPosts) || !allPosts.length) {
            console.warn("Üres vagy hibás poszt lista.");
            posts.value = [];
            return;
        }

        const highlightRes = await axios.get(
            `${API_BASE_URL}/api/posts/highlight/${INSTAGRAM_USER_ID}`
        );
        const icarPost = highlightRes.data?.post;

        let filteredPosts = allPosts;

        if (icarPost) {
            filteredPosts = allPosts.filter(post => post.igId !== icarPost.igId);
            introImage.value = toAbsoluteMediaUrl(icarPost.mediaUrl);
        } else {
            introImage.value = toAbsoluteMediaUrl(allPosts[0]?.mediaUrl || null);
        }

        const normalizedPosts = filteredPosts.map(post => ({
            ...post,
            mediaUrl: toAbsoluteMediaUrl(post.mediaUrl),
            thumbnailUrl: toAbsoluteMediaUrl(post.thumbnailUrl),
        }));

        posts.value = shuffle(normalizedPosts).slice(0, 6);
    } catch (err) {
        console.error("Nem sikerült betölteni az Instagram posztokat:", err);
        posts.value = [];
        const key = mapInstagramMessageToKey(
            "Nem sikerült betölteni az Instagram posztokat. Próbálja meg később!"
        );
        window.showToast?.(t(currentLanguage, key || "instagramPostsError"), "error");
    }
}

const toAbsoluteMediaUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${API_BASE_URL}${url}`
}
