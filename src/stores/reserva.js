import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReservaStore = defineStore('reserva', () => {
  // El id del negocio de ejemplo (Dosse Barbería) — más adelante esto puede
  // venir de una ruta o subdominio cuando haya varios negocios reales.
  const negocioId = ref(import.meta.env.VITE_NEGOCIO_ID)

  const servicio = ref(null)      // objeto completo: { id, nombre, duracion_minutos, precio }
  const fecha = ref(null)         // 'AAAA-MM-DD'
  const hora = ref(null)          // 'HH:mm'
  const personal = ref(null)      // opcional, objeto { id, nombre } o null
  const requiereElegirProfesional = ref(false)

  const cliente = ref({
    nombre: '',
    telefono: '',
    email: '',
  })

  function seleccionarServicio(nuevoServicio) {
    servicio.value = nuevoServicio
  }

  function seleccionarDia(nuevaFecha) {
    fecha.value = nuevaFecha
  }

  function seleccionarHora(nuevaHora) {
    hora.value = nuevaHora
  }

  function guardarDatosCliente(datos) {
    cliente.value = { ...cliente.value, ...datos }
  }

    function seleccionarPersonal(nuevoPersonal) {
    personal.value = nuevoPersonal
  }

  function reiniciar() {
    servicio.value = null
    fecha.value = null
    hora.value = null
    personal.value = null
    cliente.value = { nombre: '', telefono: '', email: '' }
  }

  return {
    negocioId,
    servicio,
    fecha,
    hora,
    personal,
    cliente,
    seleccionarServicio,
    seleccionarDia,
    seleccionarHora,
    guardarDatosCliente,
    reiniciar,
    seleccionarPersonal,
    requiereElegirProfesional,
  }
})