import api from "../../../server/utils/axios.js";
import {API_BASE_URL, INSTAGRAM_USER_ID} from "../config.js";

export default {
    data() {
        return {
            status: null,
            languageFile: null,
            changed: false,
            searchQuery: "",
            locale: "hu",
            selectedLocale: "hu",
            languageModalOpen: false,
            saving: false
        };
    },
    computed: {
        filteredEntries() {
            if (!this.languageFile || typeof this.languageFile !== 'object' || !this.searchQuery.trim()) return [];

            const query = this.searchQuery.toLowerCase()
            return Object.entries(this.languageFile).filter(
                ([key, value]) =>
                    key.toLowerCase().includes(query) ||
                    String(value).toLowerCase().includes(query)
            )
        }
    },
    methods: {
        preventLeave(e) {
            if (this.changed) {
                e.preventDefault();
                e.returnValue = "";
            }
        },
        onLocaleChange() {
            this.locale = this.selectedLocale;
            this.fetchLanguageFile();
        },
        async fetchStatus() {
            try {
                const res = await api.get(`${API_BASE_URL}/api/admin/status`, {
                    params: {
                        userId: INSTAGRAM_USER_ID
                    }
                });
                this.status = res.data;
                console.log(res.data);
            } catch (err) {
                this.status = null;
                console.error("Státusz hiba:", err);
                queueMicrotask(() => {
                    window.showToast?.("A rendszer állapotát nem sikerült lekérni.", "error");
                });
            }
        },
        async fetchLanguageFile() {
            try {
                const res = await api.get(`${API_BASE_URL}/api/admin/language/${this.locale}`);
                this.languageFile = res.data;
                this.changed = false;
                window.showToast?.("Nyelvi fájl sikeresen betöltve.", "info");
            } catch (err) {
                this.languageFile = null;
                console.error("Nyelvi fájl hiba:", err);
                queueMicrotask(() => {
                    window.showToast?.("Nem sikerült betölteni a nyelvi fájlt. Próbáld újra később.", "error");
                });
            }
        },
        updateTranslation(key, value) {
            this.languageFile = {
                ...this.languageFile,
                [key]: value
            };
            this.changed = true;
        },
        async saveLanguageFile(event) {
            if (event?.preventDefault) event.preventDefault();

            if (!this.languageFile || typeof this.languageFile !== 'object') {
                window.showToast?.("Érvénytelen nyelvi fájl – nem lehet menteni.", "error");
                return;
            }

            this.saving = true;
            try {
                await api.put(`${API_BASE_URL}/api/admin/language/${this.locale}`, this.languageFile);
                window.showToast?.("A nyelvi fájl sikeresen elmentve.", "info");
                this.changed = false;
                console.log("Mentés után, route:", this.$route.fullPath);
            } catch (err) {
                console.error(err);
                queueMicrotask(() => {
                    window.showToast?.("Nem sikerült elmenteni a nyelvi fájlt. Próbáld újra később.", "error");
                });
            } finally {
                this.saving = false;
            }
        },
        formatToken(token) {
            if (!token || token.length < 10) return '[Érvénytelen token]';
            return `${token.slice(0, 5)}...${token.slice(-5)}`;
        },
        maskSecret(secret) {
            if (!secret) return '[Nincs megadva]';
            return '•'.repeat(12); // vagy fix 12 db • karakter
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            if (isNaN(date)) return '[Érvénytelen dátum]';
            return date.toLocaleString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    },
    mounted() {
        window.addEventListener("beforeunload", this.preventLeave);
        this.fetchStatus();
        this.fetchLanguageFile();
    },
    beforeUnmount() {
        window.removeEventListener("beforeunload", this.preventLeave);
    }
};