import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'Terrmin — zero-friction meeting time finder',
      meta: [
        { name: 'description', content: 'Cari titik temu waktu meeting untuk tim remote lintas zona waktu, tanpa login, tanpa database.' },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    // '@nuxt/eslint',
    '@nuxt/fonts',
    // '@nuxtjs/color-mode',
  ],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  fonts: {
    families: [
      { name: 'IBM Plex Sans', provider: 'google' },
      { name: 'IBM Plex Mono', provider: 'google' },
      { name: 'Fraunces', provider: 'google'},
    ]
  },
})