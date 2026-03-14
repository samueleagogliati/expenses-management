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
import { Collapse } from 'bootstrap'

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
  data() {
    return {
      bsCollapse: null,
    }
  },
  mounted() {
    const collapseElement = this.$el.querySelector('#navbarNav')
    if (collapseElement) {
      // Inizializza l'istanza di Collapse di Bootstrap per poterla controllare via JS
      this.bsCollapse = new Collapse(collapseElement, {
        toggle: false,
      })
      // Aggiunge un listener al menu per chiuderlo quando si clicca un link o un pulsante
      collapseElement.addEventListener('click', this.handleMenuClick)
    }
    // Aggiunge un listener al documento per chiudere il menu se si clicca fuori dalla navbar
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    // Rimuove i listener quando il componente viene distrutto per evitare memory leak
    const collapseElement = this.$el.querySelector('#navbarNav')
    if (collapseElement) {
      collapseElement.removeEventListener('click', this.handleMenuClick)
    }
    document.removeEventListener('click', this.handleOutsideClick)
    if (this.bsCollapse) {
      this.bsCollapse.dispose()
    }
  },
  methods: {
    isMenuOpen() {
      const collapseElement = this.$el.querySelector('#navbarNav')
      return collapseElement && collapseElement.classList.contains('show')
    },
    handleMenuClick(event) {
      if (event.target.matches('.nav-link, .btn')) {
        if (this.isMenuOpen()) {
          this.bsCollapse.hide()
        }
      }
    },
    handleOutsideClick(event) {
      const isClickInsideNavbar = this.$el.contains(event.target)
      if (!isClickInsideNavbar && this.isMenuOpen()) {
        this.bsCollapse.hide()
      }
    },
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
