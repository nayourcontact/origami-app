<script setup>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import {RouterView} from 'vue-router';
</script>

<template>
  <Navbar/>
  <div class="pt-16 pb-16">
    <RouterView/>
  </div>
  <Footer/>
</template>
