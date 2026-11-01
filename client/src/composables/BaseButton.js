import { computed, ref, watch, onUnmounted } from "vue";
import { gsap } from "gsap";
import { allowMotion } from "./performance.js";
import { t } from "../locales";
import { useRoute } from "vue-router";

export function useBaseButton(props, emit) {
    const showTooltip = ref(false);
    const buttonRef = ref(null);
    let breatheTween = null;
    let breatheDelay = null;
    let isHovering = false;

    const route = useRoute();
    const currentLanguage = computed(() => route.params.lang || "hu");

    const stopBreathe = () => {
        if (breatheDelay) {
            breatheDelay.kill();
            breatheDelay = null;
        }

        if (breatheTween) {
            breatheTween.kill();
            breatheTween = null;
        }
    };

    const startBreathe = (button) => {
        if (breatheTween) {
            breatheTween.kill();
            breatheTween = null;
        }

        breatheDelay = null;

        if (!allowMotion.value || !isHovering || buttonRef.value !== button) return;

        breatheTween = gsap.to(button, {
            scale: 1.035,
            y: -4.8,
            duration: 1.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            overwrite: false,
        });
    };

    const getEls = () => {
        const button = buttonRef.value;

        return {
            button,
            icon: button?.querySelector(".button-icon"),
            leftFold: button?.querySelector(".button-fold-left"),
            rightFold: button?.querySelector(".button-fold-right"),
        };
    };

    const resetFolds = (leftFold, rightFold) => {
        gsap.set([leftFold, rightFold].filter(Boolean), {
            x: 0,
            y: "-50%",
            scale: 0.2,
            rotate: 0,
            opacity: 0,
        });
    };

    const animatePress = () => {
        if (!allowMotion.value || !buttonRef.value || props.disabled || props.loading) return;

        stopBreathe();

        const { button, icon } = getEls();

        gsap.killTweensOf([button, icon].filter(Boolean));

        const tl = gsap.timeline();

        tl.to(button, {
            scale: 0.975,
            y: -1,
            rotate: 0,
            duration: 0.08,
            ease: "power2.out",
        });

        if (icon) {
            tl.to(icon, {
                scale: 0.94,
                rotate: -4,
                duration: 0.08,
                ease: "power2.out",
            }, "<");
        }

        tl.to(button, {
            scale: 1.01,
            y: -3,
            rotate: -0.25,
            duration: 0.24,
            ease: "power3.out",
        });

        if (icon) {
            tl.to(icon, {
                scale: 1.05,
                rotate: -3,
                duration: 0.24,
                ease: "power3.out",
            }, "<");
        }
    };

    const handleMouseEnter = () => {
        if (!allowMotion.value || !buttonRef.value || props.disabled || props.loading) return;

        isHovering = true;

        if (breatheDelay) {
            breatheDelay.kill();
            breatheDelay = null;
        }

        const { button, icon, leftFold, rightFold } = getEls();

        gsap.killTweensOf([button, icon, leftFold, rightFold].filter(Boolean));
        resetFolds(leftFold, rightFold);

        gsap.to(button, {
            y: -3,
            rotate: -0.25,
            scale: 1.01,
            duration: 0.38,
            ease: "power3.out",
            overwrite: "auto",
        });

        if (icon) {
            gsap.to(icon, {
                y: -1,
                rotate: -4,
                scale: 1.05,
                duration: 0.42,
                ease: "power3.out",
                overwrite: "auto",
            });
        }

        const foldTl = gsap.timeline({ defaults: { overwrite: "auto" } });

        if (leftFold) {
            foldTl.fromTo(leftFold,
                {
                    x: 0,
                    y: "-50%",
                    scale: 0.2,
                    rotate: -28,
                    opacity: 0,
                },
                {
                    x: -20,
                    y: "-50%",
                    scale: 1,
                    rotate: -90,
                    opacity: 1,
                    duration: 0.32,
                    ease: "power3.out",
                },
                0
            );
        }

        if (rightFold) {
            foldTl.fromTo(rightFold,
                {
                    x: 0,
                    y: "-50%",
                    scale: 0.2,
                    rotate: 28,
                    opacity: 0,
                },
                {
                    x: 20,
                    y: "-50%",
                    scale: 1,
                    rotate: 90,
                    opacity: 1,
                    duration: 0.32,
                    ease: "power3.out",
                },
                0.14
            );
        }

        breatheDelay = gsap.delayedCall(0.36, () => {
            startBreathe(button);
        });
    };

    const handleMouseLeave = () => {
        if (!buttonRef.value) return;
        if (!allowMotion.value) { resetOnDisable(); return; }

        isHovering = false;
        stopBreathe();

        const { button, icon, leftFold, rightFold } = getEls();

        gsap.killTweensOf([button, icon, leftFold, rightFold].filter(Boolean));

        gsap.to(button, {
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 0.34,
            ease: "power2.out",
            overwrite: "auto",
            clearProps: "transform",
        });

        if (icon) {
            gsap.to(icon, {
                y: 0,
                rotate: 0,
                scale: 1,
                duration: 0.34,
                ease: "power2.out",
                overwrite: "auto",
                clearProps: "transform",
            });
        }

        gsap.to([leftFold, rightFold].filter(Boolean), {
            x: 0,
            y: "-50%",
            scale: 0.2,
            rotate: 0,
            opacity: 0,
            duration: 0.24,
            ease: "power2.inOut",
            overwrite: "auto",
        });
    };

    function resetOnDisable() {
        if (allowMotion.value) return;
        isHovering = false;
        stopBreathe();
        const {button, icon, leftFold, rightFold} = getEls();
        const els = [button, icon, leftFold, rightFold].filter(Boolean);
        gsap.killTweensOf(els);
        if (els.length) gsap.set(els, {clearProps: 'transform,opacity,visibility'});
    }
    const stopModeWatch = watch(allowMotion, resetOnDisable, {flush: 'sync'});
    onUnmounted(() => {
        stopModeWatch();
        isHovering = false;
        stopBreathe();
        const {button, icon, leftFold, rightFold} = getEls();
        gsap.killTweensOf([button, icon, leftFold, rightFold].filter(Boolean));
    });

    const handleClick = () => {
        if (props.disabled || props.loading) return;

        animatePress();
        emit("click");
    };

    const translatedTooltip = computed(() =>
        props.tooltip ? t(currentLanguage.value, props.tooltip) : ""
    );

    const hasLabel = computed(() => !!props.tooltip || !!props.icon);

    const variantClass = computed(() =>
        ({
            primary: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
            outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
            gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90",
            "footer-icon": "footer-icon",
            "footer-pill": "footer-pill",
        }[props.variant] || "bg-blue-600 text-white hover:bg-blue-700")
    );

    const sizeClass = computed(() => {
        if (props.variant === "footer-icon" || props.variant === "footer-pill") {
            return "";
        }

        return ({
            sm: "px-3 py-2 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-5 py-3 text-lg",
        }[props.size] || "px-4 py-2 text-base");
    });

    return {
        buttonRef,
        icon: props.icon,
        fullWidth: props.fullWidth,
        disabled: props.disabled,
        tooltip: props.tooltip,
        loading: props.loading,
        showTooltip,
        hasLabel,
        translatedTooltip,
        variantClass,
        sizeClass,
        handleClick,
        handleMouseEnter,
        handleMouseLeave,
    };
}