import {ref} from "vue";
import axios from "axios";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
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

export function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
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

export async function initNewSixPosts(currentLanguage) {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}`);
        const allPosts = res.data?.posts || [];

        if (!Array.isArray(allPosts) || !allPosts.length) {
            console.warn("Üres vagy hibás poszt lista.");
            posts.value = [];
            return;
        }

        posts.value = allPosts
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(1, 7);

        const highlightRes = await axios.get(`${API_BASE_URL}/api/posts/highlight/${INSTAGRAM_USER_ID}`);
        const icarPost = highlightRes.data?.post;

        if (icarPost) {
            introImage.value = icarPost.mediaUrl;
        } else {
            introImage.value = allPosts[0]?.mediaUrl || null;
        }
    } catch (err) {
        console.error("Nem sikerült betölteni az Instagram posztokat:", err);
        posts.value = [];
        const key = mapInstagramMessageToKey("Nem sikerült betölteni az Instagram posztokat. Próbálja meg később!");
        window.showToast?.(t(currentLanguage, key || "instagramPostsError"), "error");
    }
}
