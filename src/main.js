import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { repositoryModules } from './di/repositoryModules'

const app = createApp(App)
app.use(repositoryModules).mount('#app')