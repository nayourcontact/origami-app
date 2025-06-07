import {ref} from "vue";
import axios from "axios";
import {API_BASE_URL} from "../config";
import {t} from "../locales";

const consentGiven = ref(false);

function mapOrderBackendMessageToKey(message) {
    const map = {
        "Name, email, and order details are required.": "errorAllFieldsRequired",
        "Order submitted successfully.": "orderSuccess",
        "Failed to send order confirmation email.": "errorOrderEmailFailed",
    };

    return map[message] || null;
}

export default function useOrderForm(currentLanguage) {
    const name = ref("");
    const email = ref("");
    const details = ref("");
    const notes = ref("");

    const errorMessage = ref("");
    const successMessage = ref("");
    const invalidFields = ref([]);

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    async function submitOrder() {
        if (!consentGiven.value) {
            errorMessage.value = t(currentLanguage.value, "errorConsentRequired");
            window.showToast?.(errorMessage.value, "error");
            return;
        }

        errorMessage.value = "";
        successMessage.value = "";
        invalidFields.value = [];

        if (!name.value || !email.value || !details.value) {
            errorMessage.value = t(currentLanguage.value, "errorAllFieldsRequired");
            window.showToast?.(errorMessage.value, "error");

            if (!name.value) invalidFields.value.push("name");
            if (!email.value) invalidFields.value.push("email");
            if (!details.value) invalidFields.value.push("details");

            return;
        }

        if (!isValidEmail(email.value)) {
            errorMessage.value = t(currentLanguage.value, "errorInvalidEmail");
            window.showToast?.(errorMessage.value, "error");
            invalidFields.value.push("email");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/order`, {
                name: name.value,
                email: email.value,
                details: details.value,
                notes: notes.value,
            });

            const message = "Order submitted successfully.";
            const key = mapOrderBackendMessageToKey(message);

            successMessage.value = t(currentLanguage.value, key || "orderSuccess");
            window.showToast?.(successMessage.value, "info");

            name.value = "";
            email.value = "";
            details.value = "";
            notes.value = "";
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            console.error(validationErrors);

            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                invalidFields.value = validationErrors.map(e => e.param).filter(Boolean);
                errorMessage.value = validationErrors.map(e => e.msg).filter(Boolean).join(" ");
                console.error("[VALIDATION ERRORS]", errorMessage.value);
                window.showToast?.(errorMessage.value, "error");
                return;
            }

            const message = err.response?.data?.message;
            const key = mapOrderBackendMessageToKey(message);
            errorMessage.value = t(currentLanguage.value, key || "errorOrder");
            window.showToast?.(errorMessage.value, "error");
        }
    }

    return {
        name,
        email,
        details,
        notes,
        errorMessage,
        successMessage,
        invalidFields,
        submitOrder,
        consentGiven,
    };
}
