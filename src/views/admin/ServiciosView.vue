<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const servicios = ref([])
const cargando = ref(true)
const error = ref(null)

const nuevo = reactive({ nombre: '', duracion_minutos: null, precio: '' })
const creando = ref(false)
const errorCrear = ref(null)

async function cargar() {
  cargando.value = true
  try {
    const respuesta = await api.get('/admin/servicios')
    servicios.value = respuesta.data
  } catch (e) {
    error.value = 'No se pudieron cargar los servicios.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function crearServicio() {
  errorCrear.value = null
  if (!nuevo.nombre.trim() || !nuevo.duracion_minutos) return
  creando.value = true
  try {
    await api.post('/admin/servicios', {
      nombre: nuevo.nombre,
      duracion_minutos: nuevo.duracion_minutos,
      precio: nuevo.precio || null,
    })
    nuevo.nombre = ''
    nuevo.duracion_minutos = null
    nuevo.precio = ''
    await cargar()
  } catch (e) {
    errorCrear.value = 'No se pudo crear el servicio.'
  } finally {
    creando.value = false
  }
}

async function alternarActivo(servicio) {
  const nuevoValor = !servicio.activo
  servicio.activo = nuevoValor // optimista, se revierte si falla
  try {
    await api.patch(`/admin/servicios/${servicio.id}`, { activo: nuevoValor })
  } catch (e) {
    servicio.activo = !nuevoValor
  }
}
</script>

<template>
  <div class="min-h-screen bg-crema p-4 md:p-6">
    <div class="max-w-2xl mx-auto">
      <button @click="router.push({ name: 'admin-dashboard' })" class="text-sm text-gris hover:text-carbon mb-4">
        ‹ Volver a reservaciones
      </button>

      <h1 class="text-xl font-semibold text-carbon mb-6">Servicios</h1>

      <!-- Formulario de nuevo servicio -->
      <div class="bg-white rounded-2xl border border-borde p-4 mb-6">
        <p class="text-sm font-medium text-carbon mb-3">Agregar servicio</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <input
            v-model="nuevo.nombre"
            type="text"
            placeholder="Nombre"
            class="rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris sm:col-span-1"
          />
          <input
            v-model.number="nuevo.duracion_minutos"
            type="number"
            placeholder="Duración del servicio (minutos)"
            class="rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
          />
          <input
            v-model="nuevo.precio"
            type="number"
            placeholder="Precio (opcional)"
            class="rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
          />
        </div>
        <p v-if="errorCrear" class="text-xs text-red-600 mb-2">{{ errorCrear }}</p>
        <button
          @click="crearServicio"
          :disabled="creando"
          class="rounded-lg bg-carbon text-white px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          {{ creando ? 'Agregando...' : 'Agregar' }}
        </button>
      </div>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="servicios.length === 0" class="text-sm text-gris">Todavía no hay servicios.</p>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="s in servicios"
          :key="s.id"
          class="bg-white rounded-xl border border-borde p-4 flex items-center justify-between"
          :class="{ 'opacity-50': !s.activo }"
        >
          <div>
            <p class="text-sm font-medium text-carbon">{{ s.nombre }}</p>
            <p class="text-xs text-gris">{{ s.duracion_minutos }} min · ${{ s.precio ?? '—' }}</p>
          </div>
          <button
            @click="alternarActivo(s)"
            class="text-xs rounded-full px-3 py-1 border"
            :class="s.activo ? 'border-borde text-gris' : 'border-acento-borde bg-acento text-carbon'"
          >
            {{ s.activo ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>