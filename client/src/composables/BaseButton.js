import {computed, ref} from "vue";
import {t} from "../locales";
import {useRoute} from "vue-router";

export function useBaseButton(props, emit) {
    const showTooltip = ref(false);
    const route = useRoute();
    const currentLanguage = computed(() => route.params.lang || "hu");

    const hasLabel = computed(() => !!props.tooltip || !!props.icon);

    const handleClick = () => {
        if (!props.disabled && !props.loading) emit("click");
    };

    const translatedTooltip = computed(() =>
        props.tooltip ? t(currentLanguage.value, props.tooltip) : ""
    );

    const variantClass = computed(() =>
        ({
            primary: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
            outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
            gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90",
        }[props.variant] || "bg-blue-600 text-white hover:bg-blue-700")
    );

    const sizeClass = computed(() =>
        ({
            sm: "px-3 py-2 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-5 py-3 text-lg",
        }[props.size] || "px-4 py-2 text-base")
    );

    return {
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
    };
}
