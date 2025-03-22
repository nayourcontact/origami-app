import { computed, defineProps, defineEmits, ref } from "vue";
import { useRoute } from "vue-router";
import { t } from "../locales";

export function BaseButton() {
    const props = defineProps({
        variant: { type: String, default: "primary" },
        size: { type: String, default: "sm" },
        icon: { type: String, default: "" },
        fullWidth: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        tooltip: { type: String, default: "" },
    });

    const emit = defineEmits(["click"]);
    const showTooltip = ref(false);
    const route = useRoute();

    const currentLanguage = computed(() => route.params.lang || "hu");

    const hasLabel = computed(() => !!props.tooltip || !!props.icon);

    const handleClick = () => {
        if (!props.disabled) emit("click");
    };

    const translatedTooltip = computed(() =>
        props.tooltip ? t(currentLanguage.value, props.tooltip) : ""
    );

    const variantClass = computed(() => ({
        primary: "bg-transparent text-gray-800 hover:bg-gray-200",
        secondary: "bg-transparent text-gray-900 hover:bg-gray-300",
        outline: "bg-transparent text-gray-700 border border-transparent hover:bg-gray-400 hover:text-white",
        gradient: "bg-transparent text-gray-900 hover:bg-gray-200",
    }[props.variant] || "text-gray-800 hover:bg-gray-200"));

    const sizeClass = computed(() => ({
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
    }[props.size] || "px-4 py-2 text-base"));

    return {
        variantClass,
        sizeClass,
        fullWidth: props.fullWidth,
        disabled: props.disabled,
        icon: props.icon,
        tooltip: props.tooltip,
        translatedTooltip,
        hasLabel,
        handleClick,
        showTooltip,
    };
}
