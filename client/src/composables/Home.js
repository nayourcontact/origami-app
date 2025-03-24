import {ref} from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

import image1 from "../assets/images/481380548_1011302577517671_6178661449282385340_n.jpg";
import image2 from "../assets/images/481507709_554499343609416_3607355746556796657_n.jpg";
import image3 from "../assets/images/481686935_1700172133905983_1229115931246108137_n.jpg";
import image4 from "../assets/images/482523521_1394755978360160_8678528952687149298_n.jpg";
import image5 from "../assets/images/482601024_3910660735848857_6359899532700799832_n.jpg";
import image6 from "../assets/images/482729694_1453345856038176_4180568950418028172_n.jpg";

export const images = ref([image1, image2, image3, image4, image5, image6]);
export const intro = ref(null);
export const gallery = ref(null);
export const scrollContainer = ref(null);

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
