<template>
  <Navbar :userLogged="userLogged" :user="user"></Navbar>
  <router-view
    @login="loginDone"
    :user="user"
    style="margin-top: 80px"
  ></router-view>
</template>

<script>
import { jwtDecode } from 'jwt-decode'
import Navbar from './pages/components/Navbar.vue'
import axios from 'axios'
import callService from './services/api'
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
    loginDone() {
      this.userLogged = true
      this.checkTokenValidity()
    },
    checkTokenValidity() {
      const token = localStorage.getItem('token')
      if (!token) {
        return false
      }
      const decodedToken = jwtDecode(token)
      this.getUser(decodedToken.id)
      const currentTime = Date.now() / 1000
      if (decodedToken.exp < currentTime) {
        return false
      }
      return true
    },
    async getUser(userId) {
      this.user = await callService('users.getUser', { id: userId })
    },
  },
  mounted() {
    this.userLogged = this.checkTokenValidity()
  },
}
</script>

<style></style>
