<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasoLayout from '../components/PasoLayout.vue'
import api from '../services/api'
import { useReservaStore } from '../stores/reserva'

const router = useRouter()
const store = useReservaStore()

const horarios = ref([])
const horaElegida = ref(null)
const cargando = ref(true)
const error = ref(null)

onMounted(async () => {
  // Si por alguna razón llegan aquí sin haber elegido servicio/día antes,
  // los regresamos al paso 1 en vez de tronar con datos incompletos.
  if (!store.servicio || !store.fecha) {
    router.replace({ name: 'servicio' })
    return
  }

  try {
    const respuesta = await api.get(`/negocios/${store.negocioId}/disponibilidad`, {
      params: {
        servicio_id: store.servicio.id,
        fecha: store.fecha,
      },
    })
    horarios.value = respuesta.data.horarios_disponibles
  } catch (e) {
    error.value = 'No se pudo cargar la disponibilidad.'
  } finally {
    cargando.value = false
  }
})

function elegirHora(hora) {
  horaElegida.value = hora
}

function continuar() {
  if (!horaElegida.value) return
  store.seleccionarHora(horaElegida.value)
  router.push({ name: 'datos' })
}
</script>

<template>
  <PasoLayout :paso="3" :total="4">
    <h1 class="text-xl font-semibold text-carbon mb-1">Elige una hora</h1>
    <p class="text-sm text-gris mb-4">Horarios disponibles</p>

    <p v-if="cargando" class="text-sm text-gris">Cargando horarios...</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="horarios.length === 0" class="text-sm text-gris">
      No hay horarios disponibles ese día. Regresa y elige otra fecha.
    </p>

    <div v-else class="grid grid-cols-3 gap-2">
      <button
        v-for="hora in horarios"
        :key="hora"
        @click="elegirHora(hora)"
        class="rounded-xl border py-3 text-sm text-center"
        :class="horaElegida === hora
          ? 'bg-carbon text-white border-carbon'
          : 'bg-white text-carbon border-borde hover:border-gris'"
      >
        {{ hora }}
      </button>
    </div>

    <button
      @click="continuar"
      :disabled="!horaElegida"
      class="w-full mt-6 rounded-xl bg-carbon text-white py-3 text-sm font-medium disabled:opacity-40"
    >
      Continuar
    </button>
  </PasoLayout>
</template>