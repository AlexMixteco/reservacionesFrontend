<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref(null)
const enviando = ref(false)

async function iniciarSesion() {
  error.value = null
  enviando.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'admin-dashboard' })
  } catch (e) {
    error.value = e.response?.data?.errors?.email?.[0] ?? 'No se pudo iniciar sesión.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-crema flex items-center justify-center p-6">
    <form @submit.prevent="iniciarSesion" class="w-full max-w-sm">
      <h1 class="text-xl font-semibold text-carbon mb-1">Panel administrativo</h1>
      <p class="text-sm text-gris mb-6">Zierra</p>

      <div class="flex flex-col gap-3">
        <input
          v-model="email"
          type="email"
          placeholder="Correo"
          class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600 mt-3">{{ error }}</p>

      <button
        type="submit"
        :disabled="enviando"
        class="w-full mt-4 rounded-xl bg-carbon text-white py-3 text-sm font-medium disabled:opacity-40"
      >
        {{ enviando ? 'Entrando...' : 'Iniciar sesión' }}
      </button>
    </form>
  </div>
</template>