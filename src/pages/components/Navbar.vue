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
            <router-link class="nav-link" to="/debts">Debiti</router-link>
          </li>
        </ul>

        <!-- Sezione Login/Registrazione/Logout -->
        <div class="d-flex">
          <!-- Se non loggato -->
          <router-link v-if="!userLogged" class="btn btn-light me-2" to="/login"
            >Login</router-link
          >
          <router-link v-if="!userLogged" class="btn btn-light" to="/signup"
            >Registrazione</router-link
          >

          <!-- Se loggato -->
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
/* Personalizzazione del logo */
.navbar-brand img {
  border-radius: 50%;
}

/* Navbar Toggle (Hamburger Menu) */
.navbar-toggler-icon {
  background-color: #fff; /* Imposta il colore dell'icona dell'hamburger */
  border-radius: 2px; /* Aggiungi un po' di arrotondamento per renderlo più gradevole */
  width: 30px; /* Imposta la larghezza dell'icona */
  height: 3px; /* Imposta l'altezza dell'icona */
  background-color: #fff; /* Colore dell'icona, bianco per contrastare su sfondo scuro */
}

/* Navbar elementi */
.navbar-nav .nav-item {
  margin-right: 15px; /* Spaziatura tra i link */
}

.nav-link {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  font-weight: 500;
}

/* Bottoni Login/Registrazione/Logout */
.btn-light {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
}

/* Stile per schermi piccoli (mobile) */
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

  /* Allineamento del bottone di logout */
  .btn-light {
    margin-left: 10px;
  }
}

/* Personalizza l'aspetto del menu su schermi più grandi */
@media (min-width: 992px) {
  .navbar-nav {
    flex-direction: row;
  }

  .navbar-toggler {
    display: none; /* Nasconde l'icona hamburger su schermi più grandi */
  }
}
</style>
