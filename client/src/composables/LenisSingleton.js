// composables/LenisSingleton.js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { allowMotion } from "./performance.js";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;
let tickerAttached = false;
const tick = time => lenisInstance?.raf(time * 1000);

export function initLenis() {
    if (!allowMotion.value) return null;
    if (lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
        autoResize: true,
        smoothWheel: true,
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenisInstance.on("scroll", ScrollTrigger.update);

    if (!tickerAttached) {
        gsap.ticker.add(tick);
        tickerAttached = true;
    }

    return lenisInstance;
}

export function getLenis() {
    return lenisInstance;
}

export function refreshLenis() {
    if (!lenisInstance) return;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            lenisInstance?.resize?.();
            ScrollTrigger.refresh();
        });
    });
}

export function destroyLenis() {
    if (lenisInstance) lenisInstance.destroy();
    lenisInstance = null;
    if (tickerAttached) { gsap.ticker.remove(tick); tickerAttached = false; }
}