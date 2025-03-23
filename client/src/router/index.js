import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Gallery from "../views/Gallery.vue";
import Tutorial from "../views/Tutorial.vue";
import Order from "../views/Order.vue";
import NotFound from "../views/NotFound.vue";
import { t } from "../locales";

const getSavedLanguage = () =>
    localStorage.getItem("language") ||
    (navigator.language.startsWith("en") ? "en" : "hu");

const routes = [
    {
        path: "/:lang(hu|en)/home",
        component: Home,
        meta: {
            title: (lang) => t(lang, "homeTitle"),
            description: (lang) => t(lang, "homeDescription"),
        },
    },
    {
        path: "/:lang(hu|en)/gallery",
        component: Gallery,
        meta: {
            title: (lang) => t(lang, "galleryTitle"),
            description: (lang) => t(lang, "galleryDescription"),
        },
    },
    {
        path: "/:lang(hu|en)/tutorial",
        component: Tutorial,
        meta: {
            title: (lang) => t(lang, "tutorialTitle"),
            description: (lang) => t(lang, "tutorialDescription"),
        },
    },
    {
        path: "/:lang(hu|en)/order",
        component: Order,
        meta: {
            title: (lang) => t(lang, "orderTitle"),
            description: (lang) => t(lang, "orderDescription"),
        },
    },
    // NotFound nyelvi prefixszel
    {
        path: "/:lang(hu|en)/:pathMatch(.*)*",
        component: NotFound,
    },
    // NotFound nyelv nélkül (pl. ha valaki /valami-t ír be)
    {
        path: "/:pathMatch(.*)*",
        component: NotFound,
    }
];

const router = createRouter({
    history: createWebHashHistory(), // ⬅️ EZ a változtatás
    routes,
});

router.beforeEach((to, from, next) => {
    console.log("Navigating to:", to.fullPath);
    console.log("Route params:", to.params);

    const lang = to.params.lang;

    if (!lang || !['hu', 'en'].includes(lang)) {
        console.log("Invalid or missing lang param, skipping redirect.");
        return next({ path: '/hu/home' });
    }

    document.title =
        typeof to.meta.title === "function" ? to.meta.title(lang) : "Origami Alfredo";

    const description =
        typeof to.meta.description === "function"
            ? to.meta.description(lang)
            : "Origami művészet, oktatóanyagok és galéria.";

    updateMetaTag("description", description);
    updateMetaTag("og:title", document.title);
    updateMetaTag("og:description", description);
    updateMetaTag("twitter:title", document.title);
    updateMetaTag("twitter:description", description);

    next();
});

function updateMetaTag(name, content) {
    let tag =
        document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="${name}"]`);

    if (!tag) {
        tag = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
            tag.setAttribute("property", name);
        } else {
            tag.setAttribute("name", name);
        }
        document.head.appendChild(tag);
    }

    tag.setAttribute("content", content);
}

export default router;
