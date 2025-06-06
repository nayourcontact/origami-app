import hu from "./locales/hu.json";
import en from "./locales/en.json";

const translations = {
    hu,
    en,
};

export const t = (lang, key) => {
    return translations?.[lang]?.[key] || key;
};

export default translations;
