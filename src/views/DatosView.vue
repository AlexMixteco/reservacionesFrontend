<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasoLayout from '../components/PasoLayout.vue'
import api from '../services/api'
import { useReservaStore } from '../stores/reserva'

const router = useRouter()
const store = useReservaStore()

const nombre = ref(store.cliente.nombre)
const telefono = ref(store.cliente.telefono)
const email = ref(store.cliente.email)
const comentario = ref('')
const enviando = ref(false)
const error = ref(null)

onMounted(() => {
  if (!store.servicio || !store.fecha || !store.hora) {
    router.replace({ name: 'servicio' })
  }
})

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const fechaLegible = computed(() => {
  if (!store.fecha) return ''
  const [y, m, d] = store.fecha.split('-').map(Number)
  return `${d} de ${MESES[m - 1]}`
})

const formularioValido = computed(() => nombre.value.trim() && telefono.value.trim())

async function confirmarReserva() {
  if (!formularioValido.value) return
  error.value = null
  enviando.value = true

  store.guardarDatosCliente({
    nombre: nombre.value,
    telefono: telefono.value,
    email: email.value,
  })

  try {
    const respuesta = await api.post(`/negocios/${store.negocioId}/reservaciones`, {
      servicio_id: store.servicio.id,
      fecha: store.fecha,
      hora: store.hora,
      nombre_cliente: nombre.value,
      telefono_cliente: telefono.value,
      email_cliente: email.value || null,
      comentario_cliente: comentario.value || null,
      personal_id: store.personal?.id || null,
    })

    router.push({ name: 'confirmacion', params: { token: respuesta.data.token_gestion } })
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.errors?.hora) {
      error.value = e.response.data.errors.hora[0]
    } else {
      error.value = 'No se pudo crear la reserva, intenta de nuevo.'
    }
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <PasoLayout :paso="store.requiereElegirProfesional ? 5 : 4" :total="store.requiereElegirProfesional ? 5 : 4">
    <h1 class="text-xl font-semibold text-carbon mb-1">Tus datos</h1>
    <p class="text-sm text-gris mb-4">Solo para confirmar tu reserva</p>

    <div class="flex flex-col gap-3">
      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre completo"
        class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
      />
      <input
        v-model="telefono"
        type="tel"
        placeholder="WhatsApp / Teléfono"
        class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
      />
      <input
        v-model="email"
        type="email"
        placeholder="Email (opcional)"
        class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
      />
      <textarea
        v-model="comentario"
        rows="3"
        placeholder="¿Algo que debamos saber? (opcional)"
        class="w-full rounded-xl border border-borde bg-white px-4 py-3 text-sm text-carbon placeholder:text-gris"
      ></textarea>
      
    </div>

    <div class="mt-4 rounded-xl border border-acento-borde bg-acento p-4 flex flex-col gap-2 text-sm text-carbon">
      <span>✂️ {{ store.servicio?.nombre }}</span>
      <span>📅 {{ fechaLegible }}</span>
      <span>🕐 {{ store.hora }} hrs</span>
    </div>

    <p v-if="error" class="text-sm text-red-600 mt-3">{{ error }}</p>

    <button
      @click="confirmarReserva"
      :disabled="!formularioValido || enviando"
      class="w-full mt-4 rounded-xl bg-carbon text-white py-3 text-sm font-medium disabled:opacity-40"
    >
      {{ enviando ? 'Confirmando...' : 'Confirmar reserva' }}
    </button>
  </PasoLayout>
</template>