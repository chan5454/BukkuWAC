import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
    timeout: 2000,
    position: "top-right",
};

const app = createApp(App);

app.use(Toast, options);

app.mount('#app');
