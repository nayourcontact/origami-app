import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import BaseButton from './components/BaseButton.vue';
//import '@studio-freight/lenis/dist/lenis.css'

createApp(App)
    .component('BaseButton', BaseButton)
    .use(router)
    .mount('#app');
