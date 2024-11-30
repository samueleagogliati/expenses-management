<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 fixed-top">
    <div class="container">
      <div class="d-flex align-items-center">
        <router-link to="/" class="navbar-brand">
          <img src="/logo.jpeg" alt="Logo" width="30" height="30" class="d-inline-block align-top">
          Gestione Spese
        </router-link>
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Calendario</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/expenses">Tabella</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/chart">Statistiche</router-link>
          </li>
        </ul>
      </div>
      <div>
        <router-link v-if="!userLogged" class="btn btn-light me-2" to="/login">Login</router-link>
        <button @click="logout" v-if="userLogged" class="btn btn-light me-2">Logout</button>
        <router-link v-if="!userLogged" class="btn btn-light" to="/signup">Registrazione</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    userLogged: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      alert("Logout effettuato")
      window.location.reload()
    },
  },

  mounted() {
  }
}
</script>

<style scoped>
</style>
