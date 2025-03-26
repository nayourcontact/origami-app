import {ref} from "vue";
import axios from "axios";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import {API_BASE_URL, INSTAGRAM_USER_ID} from "../config.js";

export const introImage = ref(null);
export const posts = ref(null);
export const intro = ref(null);
export const gallery = ref(null);
export const scrollContainer = ref(null);
export const bio = ref("Travel with me to the World of Origami!");

export function initAnimations({intro, gallery}) {
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
    /*
    gsap.to(intro.value.querySelectorAll("h1, p, button"), {
        opacity: 1,
        y: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power2.out",
    });

    gsap.from(gallery.value, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: gallery.value,
            start: "top 80%",
            toggleActions: "play none none none",
        },
    });

     */
}

export async function initBio() {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/biography/${INSTAGRAM_USER_ID}`);
        bio.value = res.data?.user?.biography || '';
    } catch (err) {
        console.error("Could not retrieve the Instagram bio:", err);
    }
}

export async function initNewPosts() {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/${INSTAGRAM_USER_ID}`);
        const allPosts = res.data?.posts || [];
        posts.value = allPosts
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 6);

        const icarCaption = `Icar (Ίκαρος)`;
        const icarPost = allPosts.find(
            (post) => post.caption?.includes(icarCaption)
        );
        if (icarPost) {
            introImage.value = icarPost.mediaUrl;
        }
    } catch (err) {
        console.error("Could not retrieve the latest Instagram posts:", err);
    }
}

