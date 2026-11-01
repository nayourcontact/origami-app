<template>
  <div class="admin-dashboard-wrapper">
    <aside class="sidebar">
      <button @click="activeTab = 'token'">🔐 Token kezelése</button>
      <button @click="activeTab = 'events'">📅 Események</button>
      <button @click="activeTab = 'orders'">📦 Megrendelések</button>
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
          <p>🔑 <strong>Token:</strong> {{ status.tokenInfo.configured ? 'Beállítva (rejtett)' : 'Nincs beállítva' }}</p>
          <p>🧷 <strong>Client Secret:</strong> Kizárólag szerveroldalon tárolva</p>
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

            <button class="dashboard-button" @click="saveNewToken">💾 Mentés</button>

            <p v-if="saveTokenMessage" class="text-green-600 font-medium mt-2">
              ✅ {{ saveTokenMessage }}
            </p>
          </div>
        </div>

        <!-- Token Status -->
        <div class="dashboard-card mb-4" @click="fetchStatus">
          <h2 class="dashboard-subtitle">📡 Token állapot</h2>

          <p v-if="status?.tokenInfo?.error" class="text-red-500">
            ⚠️ {{ status.tokenInfo.error }}
          </p>

          <p v-else-if="status?.tokenInfo?.valid" class="text-green-600">
            ✅ Token érvényes és működik
          </p>
        </div>

        <!-- Token Request -->
        <div class="dashboard-card mb-4 bg-blue-50 border border-blue-300">
          <h2 class="dashboard-subtitle text-blue-800">🔁 Új token igénylése</h2>
          <p class="text-sm text-gray-700 mb-2">
            A frissített tokenhez látogasd meg a <strong>Meta for Developers</strong> konzolt, jelentkezz be a saját Instagram fiókoddal, majd generálj új token-t a beépített „Generate Token” funkcióval.
          </p>

          <ol class="list-decimal list-inside text-gray-700 text-sm mb-3" style="color: #575757">
            <li>Nyisd meg az <strong>API Setup</strong> oldalt:</li>
            <li>Jelentkezz be az Instagram Business fiókkal</li>
            <li>Kattints a <strong>Generate Token</strong> gombra</li>
            <li>Másold ki az új access token-t, és illeszd be a fenti ✏️ szerkesztőbe</li>
          </ol>

          <a
              href="https://developers.facebook.com/apps/631657789690032/instagram-business/API-Setup/"
              target="_blank"
              class="dashboard-button bg-blue-600 text-white"
          >
            🌐 Nyisd meg az Instagram API Setup oldalt
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

      <!-- MEGRENDELÉSEK -->
      <section v-if="activeTab === 'orders'">
        <div class="dashboard-card">
          <h2 class="dashboard-subtitle">📦 Megrendelések</h2>
          <table class="gdpr-table">
            <thead>
            <tr>
              <th>🆔 Azonosító</th>
              <th>📧 Email</th>
              <th>👤 Név</th>
              <th>📅 Dátum</th>
              <th>📦 Részletek</th>
              <th>📝 Megjegyzés</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <td><code class="text-blue-600 font-mono">{{ order.orderId || order._id }}</code></td>
              <td>{{ order.email }}</td>
              <td>{{ order.name }}</td>
              <td><span class="text-gray-700">{{ formatDate(order.createdAt) }}</span></td>
              <td>{{ order.details }}</td>
              <td>{{ order.notes || "–" }}</td>
            </tr>
            </tbody>
          </table>

        </div>
      </section>

      <!-- ESEMÉNYEK -->
      <section v-if="activeTab === 'events'">
        <div class="dashboard-card">
          <h2 class="dashboard-subtitle">📅 Új esemény rögzítése</h2>

          <label class="dashboard-label">Esemény címe</label>
          <input v-model="eventForm.title" class="dashboard-input" />

          <label class="dashboard-label">Helyszín</label>
          <input v-model="eventForm.location" class="dashboard-input" />

          <label class="dashboard-label">Dátum</label>
          <input v-model="eventForm.eventDate" type="datetime-local" class="dashboard-input" />

          <label class="dashboard-label">Jegyár</label>
          <input v-model="eventForm.ticketPrice" class="dashboard-input" placeholder="Pl. 4500 Ft vagy Ingyenes" />

          <label class="dashboard-label">🖼️ Borítókép</label>
          <input
              type="file"
              accept="image/*"
              @change="onCoverImageChange"
              class="dashboard-input"
          />

          <label class="dashboard-label">🖼️🎬 Galéria képek / videók</label>
          <input
              type="file"
              accept="image/*,video/*"
              multiple
              @change="onGalleryChange"
              class="dashboard-input"
          />

          <label class="dashboard-label">Leírás</label>
          <textarea v-model="eventForm.description" rows="5" class="dashboard-input"></textarea>

          <button class="dashboard-button mt-4" @click="saveEvent">
            💾 Esemény mentése
          </button>
        </div>

        <div class="dashboard-card mt-6">
          <h2 class="dashboard-subtitle">📋 Összes esemény</h2>

          <div v-if="!sortedEvents.length">
            Még nincs rögzített esemény.
          </div>

          <div v-for="event in sortedEvents" :key="event._id || event.id" class="event-admin-item">
            <h3>{{ event.title }}</h3>

            <p>
              <strong>Státusz:</strong>
              <span :class="isUpcoming(event.eventDate) ? 'text-green-600' : 'text-gray-500'">
          {{ isUpcoming(event.eventDate) ? "Upcoming" : "Elmúlt" }}
        </span>
            </p>

            <p><strong>Dátum:</strong> {{ formatDate(event.eventDate) }}</p>
            <p><strong>Helyszín:</strong> {{ event.location }}</p>
            <p><strong>Jegyár:</strong> {{ event.ticketPrice || "Nincs megadva" }}</p>
            <p>{{ event.description }}</p>

            <div v-if="event.coverImageUrl">
              <img :src="event.coverImageUrl" class="event-preview" />
            </div>

            <div v-if="event.gallery?.length" class="event-gallery-preview">
              <div v-for="item in event.gallery" :key="item.url">
                <img
                    v-if="item.type === 'image'"
                    :src="item.url"
                    class="event-preview"
                />

                <video
                    v-else-if="item.type === 'video'"
                    :src="item.url"
                    controls
                    class="event-preview"
                ></video>
              </div>
            </div>

            <button class="dashboard-button danger mt-3" @click="deleteEvent(event._id || event.id)">
              🗑️ Törlés
            </button>
          </div>
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
