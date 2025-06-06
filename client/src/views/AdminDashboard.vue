<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Page Title -->
      <h1 class="text-3xl font-semibold text-gray-800">⚙️ Admin Control Panel</h1>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Token Status Card -->
        <div
            class="bg-white shadow-md rounded-xl p-5 hover:ring-2 hover:ring-blue-400 transition cursor-pointer"
            @click="fetchStatus"
        >
          <h2 class="text-lg font-medium text-gray-700 mb-2">📡 Token állapot</h2>
          <p class="text-sm">
            <span class="font-semibold">Állapot: </span>
            <span :class="status?.tokenInfo?.valid ? 'text-green-600' : 'text-red-600'">
              {{ status?.tokenInfo?.valid ? 'Érvényes' : 'Érvénytelen' }}
            </span>
          </p>
          <p v-if="status?.tokenInfo?.error" class="text-red-500 text-sm mt-1">
            ⚠️ {{ status.tokenInfo.error }}
          </p>
        </div>

        <!-- Language Editor Trigger -->
        <div
            class="bg-white shadow-md rounded-xl p-5 hover:ring-2 hover:ring-blue-400 transition cursor-pointer"
            @click="languageModalOpen = true"
        >
          <h2 class="text-lg font-medium text-gray-700">🌐 Nyelvi fájlok szerkesztése</h2>
          <p class="text-sm text-gray-500 mt-1">Aktuális nyelv: {{ locale.toUpperCase() }}</p>
        </div>

        <!-- Token Request Shortcut -->
        <div
            v-if="!status?.api"
            class="bg-red-100 border border-red-300 shadow-md rounded-xl p-5"
        >
          <h2 class="text-lg font-medium text-red-700 mb-2">🔁 Új token igénylése</h2>
          <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Facebook Graph Explorer megnyitása
          </a>
        </div>

        <!-- Token Info Card -->
        <div
            v-if="status?.tokenInfo"
            class="bg-white shadow-md rounded-xl p-5 space-y-2"
        >
          <h2 class="text-lg font-medium text-gray-700">🔐 Token információk</h2>
          <p class="text-sm"><strong>Token:</strong> <code class="break-all">{{ formatToken(status.tokenInfo.token) }}</code></p>
          <p class="text-sm"><strong>Client Secret:</strong> <code>{{ maskSecret(status.tokenInfo.clientSecret) }}</code></p>
          <p class="text-sm"><strong>Lejárat:</strong> <span class="text-blue-600">{{ formatDate(status.tokenInfo.expiresAt) }}</span></p>
        </div>
      </div>

      <!-- MODAL: Language File -->
      <div v-if="languageModalOpen" class="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
          <button class="absolute top-4 right-4 text-gray-500 hover:text-black" @click="languageModalOpen = false">✖</button>
          <h3 class="text-xl font-semibold mb-4">🌐 {{ locale.toUpperCase() }} nyelvi fájl szerkesztése</h3>

          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Nyelvi fájl kiválasztása:</label>
              <select v-model="selectedLocale" @change="onLocaleChange" class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="hu">Magyar</option>
                <option value="en">Angol</option>
              </select>
            </div>

            <div>
              <label class="block font-medium mb-1">Keresés:</label>
              <input
                  v-model="searchQuery"
                  placeholder="Keresés kulcsra vagy értékre..."
                  class="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div class="max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50 space-y-3">
              <div
                  v-if="filteredEntries.length > 0"
                  v-for="[key, value] in filteredEntries"
                  :key="key"
              >
                <label class="text-sm font-medium">{{ key }}</label>
                <input
                    :value="value"
                    @input="updateTranslation(key, $event.target.value)"
                    class="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                />
              </div>

              <p v-else class="text-sm text-gray-500 text-center">
                Keresés nélkül nincs megjelenített fordítás.
              </p>
            </div>

            <button
                type="button"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 disabled:opacity-50"
                :disabled="!changed"
                @click.prevent.stop="saveLanguageFile"
            >
              Mentés
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminDashboard from "../composables/AdminDashboard.js";

export default AdminDashboard;
</script>

<style scoped src="../assets/styles/AdminDashboard.css"></style>