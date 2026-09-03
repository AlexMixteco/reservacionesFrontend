<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const negocio = reactive({
  nombre: '',
  direccion: '',
  telefono_whatsapp: '',
  color_marca: '#1E1E1C',
})

const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    const respuesta = await api.get('/admin/negocio')
    negocio.nombre = respuesta.data.nombre ?? ''
    negocio.direccion = respuesta.data.direccion ?? ''
    negocio.telefono_whatsapp = respuesta.data.telefono_whatsapp ?? ''
    negocio.color_marca = respuesta.data.color_marca ?? '#1E1E1C'
  } catch (e) {
    error.value = 'No se pudo cargar la información del negocio.'
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  guardando.value = true
  error.value = null
  try {
    await api.patch('/admin/negocio', negocio)
    guardado.value = true
    setTimeout(() => (guardado.value = false), 2000)
  } catch (e) {
    error.value = 'No se pudo guardar. Verifica los datos.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-crema p-4 md:p-6">
    <div class="max-w-xl mx-auto">
      <button @click="router.push({ name: 'admin-dashboard' })" class="text-sm text-gris hover:text-carbon mb-4">
        ‹ Volver a reservaciones
      </button>

      <h1 class="text-xl font-semibold text-carbon mb-1">Mi negocio</h1>
      <p class="text-sm text-gris mb-6">Estos datos aparecen en las pantallas que ven tus clientes.</p>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>

      <div v-else class="bg-white rounded-2xl border border-borde p-4 flex flex-col gap-3">
        <div>
          <label class="text-xs text-gris">Nombre del negocio</label>
          <input
            v-model="negocio.nombre"
            type="text"
            class="w-full mt-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon"
          />
        </div>

        <div>
          <label class="text-xs text-gris">Dirección</label>
          <input
            v-model="negocio.direccion"
            type="text"
            class="w-full mt-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon"
          />
        </div>

        <div>
          <label class="text-xs text-gris">WhatsApp (con código de país, sin espacios ni signos)</label>
          <input
            v-model="negocio.telefono_whatsapp"
            type="text"
            placeholder="5215512345678"
            class="w-full mt-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
          />
        </div>

        <div>
          <label class="text-xs text-gris">Color de marca</label>
          <div class="flex items-center gap-2 mt-1">
            <input v-model="negocio.color_marca" type="color" class="w-10 h-10 rounded-lg border border-borde" />
            <span class="text-sm text-gris">{{ negocio.color_marca }}</span>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          @click="guardar"
          :disabled="guardando"
          class="rounded-lg bg-carbon text-white px-4 py-2 text-sm font-medium disabled:opacity-40 self-start"
        >
          {{ guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>