// composables/LenisSingleton.js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;
let tickerAttached = false;

export function initLenis() {
    if (lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
        autoResize: true,
        smoothWheel: true,
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenisInstance.on("scroll", ScrollTrigger.update);

    if (!tickerAttached) {
        gsap.ticker.add((time) => {
            lenisInstance?.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        tickerAttached = true;
    }

    return lenisInstance;
}

export function getLenis() {
    return lenisInstance;
}

export function refreshLenis() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            lenisInstance?.resize?.();
            ScrollTrigger.refresh();
        });
    });
}

export function destroyLenis() {
    if (!lenisInstance) return;
    lenisInstance.destroy();
    lenisInstance = null;
}