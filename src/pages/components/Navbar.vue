<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 fixed-top">
    <div class="container-fluid" style="width: 98%">
      <router-link to="/" class="navbar-brand">
        <img
          src="/logo.jpeg"
          alt="Logo"
          width="30"
          height="30"
          class="d-inline-block align-top"
        />
        Gestione Spese
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu nav che si nasconde su schermi piccoli -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Calendario</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/expenses">Tabella</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/chart">Statistiche</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/groups">Gruppi</router-link>
          </li>
        </ul>

        <div class="d-flex">
          <router-link v-if="!userLogged" class="btn btn-light me-2" to="/login"
            >Login</router-link
          >
          <router-link v-if="!userLogged" class="btn btn-light" to="/signup"
            >Registrazione</router-link
          >

          <button @click="logout" v-if="userLogged" class="btn btn-light ms-2">
            Logout
          </button>
        </div>
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
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      alert(' effettuato')
      window.location.reload()
    },
  },
}
</script>

<style scoped>
.navbar-brand img {
  border-radius: 50%;
}

.navbar-toggler-icon {
  background-color: #fff;
  border-radius: 2px;
  width: 30px;
  height: 3px;
  background-color: #fff;
}

.navbar-nav .nav-item {
  margin-right: 15px;
}

.nav-link {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  font-weight: 500;
}

.btn-light {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
}

@media (max-width: 767px) {
  .navbar-nav {
    text-align: center;
  }

  .navbar-nav .nav-item {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .d-flex {
    justify-content: center;
  }

  .btn-light {
    margin-left: 10px;
  }
}

@media (min-width: 992px) {
  .navbar-nav {
    flex-direction: row;
  }

  .navbar-toggler {
    display: none;
  }
}
</style>
