import api, {clearCsrfToken} from "../axios.js";
import {API_BASE_URL, INSTAGRAM_USER_ID} from "../config.js";
import DOMPurify from "isomorphic-dompurify";

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
            saving: false,
            activeTab: 'token',
            loggingOut: false,
            newToken: '',
            saveTokenMessage: '',
            tokenModalOpen: false,
            gdprTable: [],
            orders: [],

            events: [],
            eventForm: {
                title: "",
                location: "",
                eventDate: "",
                ticketPrice: "",
                description: "",
                coverImage: null,
                gallery: [],
            },
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
        },
        sortedEvents() {
            return [...this.events].sort(
                (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
            );
        },
    },
    methods: {
        async logout() {
            if (this.loggingOut) return;
            this.loggingOut = true;
            try {
                await api.post('/api/admin/logout');
                clearCsrfToken();
                await this.$router.replace('/admin/login');
            } catch (err) {
                console.error('Kijelentkezés sikertelen:', err.response?.status || err.message);
                window.showToast?.('Nem sikerült kijelentkezni. Próbáld újra.', 'error');
            } finally {
                this.loggingOut = false;
            }
        },
        isUpcoming(date) {
            return new Date(date) >= new Date();
        },

        onCoverImageChange(event) {
            this.eventForm.coverImage = event.target.files?.[0] || null;
        },

        onGalleryChange(event) {
            this.eventForm.gallery = Array.from(event.target.files || []);
        },

        resetEventForm() {
            this.eventForm = {
                title: "",
                location: "",
                eventDate: "",
                ticketPrice: "",
                description: "",
                coverImage: null,
                gallery: [],
            };
        },

        async fetchEvents() {
            try {
                const res = await api.get(`${API_BASE_URL}/api/admin/events`);

                this.events = Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                console.error("Események betöltése sikertelen:", err);
                window.showToast?.("Nem sikerült betölteni az eseményeket.", "error");
            }
        },

        async saveEvent() {
            if (!this.eventForm.title || !this.eventForm.location || !this.eventForm.eventDate) {
                window.showToast?.("Cím, helyszín és dátum megadása kötelező.", "error");
                return;
            }

            try {
                const formData = new FormData();

                formData.append("title", this.eventForm.title);
                formData.append("location", this.eventForm.location);
                formData.append("eventDate", this.eventForm.eventDate);
                formData.append("ticketPrice", this.eventForm.ticketPrice || "");
                formData.append("description", this.eventForm.description || "");

                if (this.eventForm.coverImage) {
                    formData.append("coverImage", this.eventForm.coverImage);
                }

                for (const file of this.eventForm.gallery) {
                    formData.append("gallery", file);
                }

                await api.post(`${API_BASE_URL}/api/admin/events`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                window.showToast?.("Esemény sikeresen mentve.", "info");

                this.resetEventForm();
                await this.fetchEvents();
            } catch (err) {
                console.error("Esemény mentése sikertelen:", err);
                window.showToast?.("Nem sikerült elmenteni az eseményt.", "error");
            }
        },

        async uploadEventGallery(eventId, inputEvent) {
            const files = inputEvent.target.files;

            if (!files || !files.length) return;

            try {
                const formData = new FormData();

                for (const file of files) {
                    formData.append("gallery", file);
                }

                await api.post(`${API_BASE_URL}/api/admin/events/${eventId}/gallery`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                window.showToast?.("Galéria elemek sikeresen feltöltve.", "info");

                await this.fetchEvents();
            } catch (err) {
                console.error("Galéria feltöltése sikertelen:", err);
                window.showToast?.("Nem sikerült feltölteni a fotókat.", "error");
            }
        },

        async deleteEvent(eventId) {
            if (!confirm("Biztosan törlöd ezt az eseményt?")) return;

            try {
                await api.delete(`${API_BASE_URL}/api/admin/events/${eventId}`);

                window.showToast?.("Esemény törölve.", "info");

                await this.fetchEvents();
            } catch (err) {
                console.error("Esemény törlése sikertelen:", err);
                window.showToast?.("Nem sikerült törölni az eseményt.", "error");
            }
        },

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
                [key]: DOMPurify.sanitize(value, {
                    ALLOWED_TAGS: [],
                    ALLOWED_ATTR: []
                })
            };
            this.changed = true;
        },
        async fetchOrders() {
            try {
                const res = await api.get(`${API_BASE_URL}/api/admin/orders`);
                this.orders = res.data;
            } catch (err) {
                console.error("Nem sikerült betölteni a megrendeléseket:", err);
                window.showToast?.("Nem sikerült betölteni a megrendeléseket.", "error");
            }
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
        },
        async saveNewToken() {
            if (!this.newToken) {
                window.showToast?.("Token megadása kötelező.", "error");
                return;
            }

            try {
                // 60 nap múlva lejár (long-lived IG token élettartama)
                const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

                await api.post(`${API_BASE_URL}/api/token`, {
                    token: this.newToken,
                    userId: INSTAGRAM_USER_ID,
                    expiresAt
                });

                this.saveTokenMessage = "✅ Token sikeresen frissítve!";
                this.newToken = '';
                this.fetchStatus(); // új állapot betöltése
            } catch (err) {
                console.error("Token mentés hiba:", err);
                window.showToast?.("❌ Hiba történt a mentés során.", "error");
            }
        },
        downloadCSV() {
            const headers = [
                "Adatkezelés célja",
                "Jogalap",
                "Adatok típusa",
                "Kezelt adatok forrása",
                "Címzettek",
                "Tárolás ideje",
                "Tárolás helye",
                "Biztonsági intézkedések"
            ];

            const rows = this.gdprTable.map(r =>
                [
                    r.purpose,
                    r.legal,
                    r.dataType,
                    r.source,
                    r.recipient,
                    r.duration,
                    r.location,
                    r.security
                ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            );

            // UTF-8 BOM hozzáadása (\uFEFF)
            const bom = '\uFEFF';
            const csvContent = bom + [headers.join(','), ...rows].join('\n');

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "gdpr_nyilvantartas.csv";
            link.click();
        },
        async fetchGdprData() {
            try {
                const res = await api.get(`${API_BASE_URL}/api/admin/gdpr-export`);
                this.gdprTable = res.data;
            } catch (err) {
                console.error("GDPR adatok betöltése sikertelen:", err);
                window.showToast?.("Nem sikerült betölteni a GDPR adatokat.", "error");
            }
        }
    },
    mounted() {
        window.addEventListener("beforeunload", this.preventLeave);
        this.fetchStatus();
        this.fetchLanguageFile();
        this.fetchEvents();
    },
    beforeUnmount() {
        window.removeEventListener("beforeunload", this.preventLeave);
    },
    watch: {
        activeTab(val) {
            if (val === "gdprExport") {
                this.fetchGdprData();
            } else if (val === "orders") {
                this.fetchOrders();
            } else if (val === "events") {
                this.fetchEvents();
            }
        }
    }
};