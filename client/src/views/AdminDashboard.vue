<template>
  <div class="admin-dashboard-wrapper">
    <aside class="sidebar">
      <button @click="activeTab = 'token'">🔐 Token kezelése</button>
      <button @click="activeTab = 'languageEditor'">🌐 Nyelvi fájlok</button>
      <button @click="activeTab = 'gdprExport'">🗃️ Adatkezelés (GDPR)</button>
    </aside>

    <main class="dashboard-main">
      <h1 class="dashboard-title">⚙️ Admin Control Panel</h1>

      <!-- TOKENS -->
      <section v-if="activeTab === 'token'">
        <!-- Token Info -->
        <div v-if="status?.tokenInfo" class="dashboard-card space-y-2">
          <h2 class="dashboard-subtitle">🔐 Token információk</h2>
          <p>🔑 <strong>Token:</strong> <code class="break-all">{{ formatToken(status.tokenInfo.token) }}</code></p>
          <p>🧷 <strong>Client Secret:</strong> <code>{{ maskSecret(status.tokenInfo.clientSecret) }}</code></p>
          <p>⏳ <strong>Lejárat:</strong> <span class="text-blue-600">{{ formatDate(status.tokenInfo.expiresAt) }}</span>
          </p>

          <button class="dashboard-button mt-4" @click="tokenModalOpen = true">✏️ Token módosítása</button>
        </div>

        <!-- Token szerkesztő MODAL -->
        <div v-if="tokenModalOpen" class="modal-overlay">
          <div class="modal">
            <button class="close-button" @click="tokenModalOpen = false">✖</button>
            <h3 class="text-xl font-semibold mb-4">✏️ Token módosítása</h3>

            <label class="dashboard-label">🔑 Új token:</label>
            <input v-model="newToken" placeholder="🔓 Access Token..." class="dashboard-input"/>

            <label class="dashboard-label">🧷 Új Client Secret:</label>
            <input v-model="newClientSecret" placeholder="🛡️ Client Secret..." class="dashboard-input"/>

            <button class="dashboard-button" @click="saveNewToken">💾 Mentés</button>

            <p v-if="saveTokenMessage" class="text-green-600 font-medium mt-2">
              ✅ {{ saveTokenMessage }}
            </p>
          </div>
        </div>

        <!-- Token Status -->
        <div class="dashboard-card mb-4" @click="fetchStatus">
          <h2 class="dashboard-subtitle">📡 Token állapot</h2>
          <p v-if="status?.tokenInfo?.error" class="text-red-500">⚠️ {{ status.tokenInfo.error }}</p>
        </div>

        <!-- Token Request -->
        <div v-if="!status?.api" class="dashboard-card mb-4 bg-red-100 border border-red-300">
          <h2 class="dashboard-subtitle text-red-700">🔁 Új token igénylése</h2>
          <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              class="dashboard-button bg-red-500 text-white"
          >
            🌐 Facebook Graph Explorer megnyitása
          </a>
        </div>
      </section>

      <!-- LANGUAGE -->
      <section v-if="activeTab === 'languageEditor'">
        <div>
          <h2 class="dashboard-subtitle">🌐 Nyelvi fájlok szerkesztése ({{ locale.toUpperCase() }})</h2>

          <label class="dashboard-label">🌍 Nyelv kiválasztása:</label>
          <select v-model="selectedLocale" @change="onLocaleChange" class="dashboard-select">
            <option value="hu">🇭🇺 Magyar</option>
            <option value="en">🇬🇧 Angol</option>
          </select>

          <label class="dashboard-label">🔎 Keresés:</label>
          <input v-model="searchQuery" placeholder="🔍 Keresés kulcsra vagy értékre..." class="dashboard-input"/>

          <div class="dashboard-scrollable">
            <div v-for="[key, value] in filteredEntries" :key="key" class="dashboard-input-group">
              <label class="dashboard-label">🔑 {{ key }}</label>
              <input :value="value" @input="updateTranslation(key, $event.target.value)" class="dashboard-input"/>
            </div>
          </div>

          <button class="dashboard-button" :disabled="!changed" @click.prevent.stop="saveLanguageFile">💾 Mentés</button>
        </div>
      </section>

      <!-- GDPR EXPORT -->
      <section v-if="activeTab === 'gdprExport'">
        <div class="dashboard-card">
          <h2 class="dashboard-subtitle">🗃️ Adatkezelési nyilvántartás (GDPR)</h2>

          <table class="gdpr-table">
            <thead>
            <tr>
              <th>🎯 Cél</th>
              <th>⚖️ Jogalap</th>
              <th>📂 Adatok típusa</th>
              <th>📥 Forrás</th>
              <th>🎯 Címzettek</th>
              <th>🕒 Tárolás ideje</th>
              <th>🌍 Hely</th>
              <th>🛡️ Védelem</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in gdprTable" :key="row.purpose">
              <td>{{ row.purpose }}</td>
              <td>{{ row.legal }}</td>
              <td>{{ row.dataType }}</td>
              <td>{{ row.source }}</td>
              <td>{{ row.recipient }}</td>
              <td>{{ row.duration }}</td>
              <td>{{ row.location }}</td>
              <td>{{ row.security }}</td>
            </tr>
            </tbody>
          </table>

          <button class="dashboard-button mt-4" @click="downloadCSV">📥 Letöltés CSV-ben</button>
        </div>
      </section>

    </main>
  </div>
</template>

<script>
import AdminDashboard from "../composables/AdminDashboard.js";
import "../assets/styles/AdminDashboard.css";

export default AdminDashboard;
</script>
