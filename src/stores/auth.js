import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token'))
  const usuario = ref(JSON.parse(localStorage.getItem('admin_usuario') || 'null'))

  async function login(email, password) {
    const respuesta = await api.post('/admin/login', { email, password })
    token.value = respuesta.data.token
    usuario.value = respuesta.data.usuario

    localStorage.setItem('admin_token', token.value)
    localStorage.setItem('admin_usuario', JSON.stringify(usuario.value))
  }

  async function logout() {
    try {
      await api.post('/admin/logout')
    } finally {
      token.value = null
      usuario.value = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_usuario')
    }
  }

  return { token, usuario, login, logout }
})