<template>
  <section class="admin-login-wrapper">
    <div class="admin-login-inner">
      <div class="admin-login-card">
        <h1 class="admin-login-title">Admin Bejelentkezés</h1>
        <form @submit.prevent="handleLogin" class="admin-login-form">
          <div>
            <label class="admin-login-label">Email cím</label>
            <input
                v-model="email"
                type="email"
                placeholder="admin@pelda.hu"
                class="admin-login-input"
                required
            />
          </div>
          <div>
            <label class="admin-login-label">Jelszó</label>
            <input
                v-model="password"
                type="password"
                placeholder="••••••"
                class="admin-login-input"
                required
            />
          </div>
          <button
              type="submit"
              class="admin-login-button"
          >
            Bejelentkezés
          </button>
          <p v-if="error" class="admin-login-error">{{ error }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import {API_BASE_URL} from "../config";

export default {
  name: 'AdminLogin',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
          email: this.email,
          password: this.password
        })

        const {token, role} = response.data

        localStorage.setItem('adminToken', token)
        localStorage.setItem('role', role)

        await this.$router.push('/admin/dashboard')
      } catch (err) {
        this.error = err.response?.data?.message || 'Hibás bejelentkezési adatok.'
      }
    }
  }
}
</script>

<style scoped src="../assets/styles/AdminLogin.css"></style>