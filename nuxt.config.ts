// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'primevue/resources/themes/bootstrap4-dark-purple/theme.css'
  ],
  modules: [
    'nuxt-primevue'
  ],
  primevue: {
      /* Options */
  }
})
