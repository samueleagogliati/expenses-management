<template>
  <Navbar
    :userLogged="userLogged"
    :user="user"
    @logout="logout"
  ></Navbar>
  <main class="app-content">
    <router-view
      v-if="!userLogged || user"
      @login="loginDone"
      :user="user"
    ></router-view>
  </main>
</template>

<script>
import { jwtDecode } from 'jwt-decode'
import Navbar from './pages/components/Navbar.vue'
import callService from './services/api'
import { getValidToken } from './utils/session'

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      userLogged: false,
      user: null,
    }
  },
  methods: {
    async checkTokenValidity() {
      const token = getValidToken()
      if (!token) return false

      try {
        const { id } = jwtDecode(token)
        this.user = await callService('users.getUser', { id })
        return true
      } catch (error) {
        console.error('Errore durante il caricamento della sessione:', error)
        localStorage.removeItem('token')
        this.user = null
        return false
      }
    },
    async loginDone() {
      this.userLogged = await this.checkTokenValidity()
    },
    logout() {
      localStorage.removeItem('token')
      this.user = null
      this.userLogged = false
      this.$router.push('/login')
    },
  },
  async mounted() {
    this.userLogged = await this.checkTokenValidity()
  },
}
</script>

<style></style>
