import { createRouter, createWebHistory } from 'vue-router'
import ServicioView from '../views/ServicioView.vue'
import DiaView from '../views/DiaView.vue'
import HoraView from '../views/HoraView.vue'
import DatosView from '../views/DatosView.vue'
import ConfirmacionView from '../views/ConfirmacionView.vue'
import GestionView from '../views/GestionView.vue'
import ReprogramarView from '../views/ReprogramarView.vue'
import LoginView from '../views/admin/LoginView.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'servicio', component: ServicioView },
    { path: '/dia', name: 'dia', component: DiaView },
    { path: '/hora', name: 'hora', component: HoraView },
    { path: '/datos', name: 'datos', component: DatosView },
    { path: '/confirmacion/:token', name: 'confirmacion', component: ConfirmacionView },
    { path: '/reserva/:token', name: 'gestion', component: GestionView },
    { path: '/reserva/:token/reprogramar', name: 'reprogramar', component: ReprogramarView },
    { path: '/admin/login', name: 'admin-login', component: LoginView },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: DashboardView,
      meta: { requiereAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiereAuth && !auth.token) {
    return { name: 'admin-login' }
  }
})

export default router