<template>
  <nav class="navbar navbar-expand-lg app-navbar fixed-top">
    <div class="container-fluid app-navbar-inner">
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
        <span class="menu-toggle-icon" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="mobile-menu-heading d-lg-none">Il tuo spazio</div>
        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-calendar3" aria-hidden="true"></i>
              <span>Calendario</span>
              <i
                class="bi bi-arrow-up-right nav-link-arrow"
                aria-hidden="true"
              ></i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/expenses">
              <i class="bi bi-receipt" aria-hidden="true"></i>
              <span>Tabella</span>
              <i
                class="bi bi-arrow-up-right nav-link-arrow"
                aria-hidden="true"
              ></i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/chart">
              <i class="bi bi-bar-chart-line" aria-hidden="true"></i>
              <span>Statistiche</span>
              <i
                class="bi bi-arrow-up-right nav-link-arrow"
                aria-hidden="true"
              ></i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/groups">
              <i class="bi bi-people" aria-hidden="true"></i>
              <span>Gruppi</span>
              <i
                class="bi bi-arrow-up-right nav-link-arrow"
                aria-hidden="true"
              ></i>
            </router-link>
          </li>
        </ul>

        <div class="navbar-actions">
          <button
            class="theme-toggle"
            type="button"
            :aria-pressed="isDarkTheme"
            :aria-label="
              isDarkTheme ? 'Attiva tema chiaro' : 'Attiva tema scuro'
            "
            @click="toggleTheme"
          >
            <i
              class="bi"
              :class="isDarkTheme ? 'bi-sun-fill' : 'bi-moon-stars-fill'"
              aria-hidden="true"
            ></i>
            <span>{{ isDarkTheme ? 'Tema chiaro' : 'Tema scuro' }}</span>
          </button>
          <router-link v-if="!userLogged" class="btn btn-light" to="/login">
            Accedi
          </router-link>
          <router-link v-if="!userLogged" class="btn btn-primary" to="/signup">
            Registrati
          </router-link>

          <button
            @click="$emit('logout')"
            v-if="userLogged"
            class="btn btn-outline-dark"
          >
            <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Collapse from 'bootstrap/js/dist/collapse'
import { isDarkTheme, setTheme } from '../../utils/theme'

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
  emits: ['logout'],
  data() {
    return {
      bsCollapse: null,
      isDarkTheme,
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
    toggleTheme() {
      setTheme(!this.isDarkTheme)
    },
    isMenuOpen() {
      const collapseElement = this.$el.querySelector('#navbarNav')
      return collapseElement && collapseElement.classList.contains('show')
    },
    handleMenuClick(event) {
      if (event.target.closest('.nav-link, .btn')) {
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
  },
}
</script>

<style scoped>
.app-navbar {
  min-height: 72px;
  padding: 0.65rem clamp(0.75rem, 3vw, 2.5rem);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(20, 32, 55, 0.08);
  box-shadow: 0 8px 30px rgba(20, 32, 55, 0.06);
  backdrop-filter: blur(16px);
}

.app-navbar-inner {
  max-width: 1440px;
}

.navbar-brand img {
  border-radius: 50%;
}

.navbar-brand {
  color: #18233a;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.navbar-toggler {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  border: 0;
  border-radius: 0.95rem;
  background: #f2f1ff;
  box-shadow: none !important;
}

.menu-toggle-icon {
  display: grid;
  width: 1.15rem;
  gap: 4px;
}

.menu-toggle-icon span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: #5146e5;
  transition:
    transform 180ms ease,
    opacity 140ms ease;
}

.navbar-toggler[aria-expanded='true'] .menu-toggle-icon span:first-child {
  transform: translateY(6px) rotate(45deg);
}

.navbar-toggler[aria-expanded='true'] .menu-toggle-icon span:nth-child(2) {
  opacity: 0;
}

.navbar-toggler[aria-expanded='true'] .menu-toggle-icon span:last-child {
  transform: translateY(-6px) rotate(-45deg);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0.2rem;
  padding: 0.6rem 0.85rem !important;
  border-radius: 0.75rem;
  color: #68748a;
  font-size: 0.92rem;
  font-weight: 650;
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.nav-link > .bi:first-child {
  width: 1.2rem;
  color: #8892a6;
  font-size: 1rem;
  text-align: center;
  transition: color 160ms ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #4f46e5;
  background: #f0efff;
}

.nav-link:hover > .bi:first-child,
.nav-link.router-link-active > .bi:first-child {
  color: #5146e5;
}

.nav-link-arrow {
  margin-left: auto;
  color: #9da6b7;
  font-size: 0.8rem;
  opacity: 0;
  transform: translate(-3px, 3px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.nav-link:hover .nav-link-arrow,
.nav-link.router-link-active .nav-link-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.navbar-actions {
  display: flex;
  gap: 0.6rem;
  margin-left: 0.5rem;
}

.navbar-actions .btn {
  border-radius: 0.8rem;
  padding: 0.55rem 1rem;
  font-size: 0.9rem;
  font-weight: 650;
}

.navbar-actions .btn-primary {
  border-color: #5146e5;
  background: #5146e5;
}

.navbar-actions .btn-outline-dark {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.theme-toggle {
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid #e7e9f1;
  border-radius: 0.8rem;
  background: #f7f8fc;
  color: #505c72;
  font-size: 0.88rem;
  font-weight: 650;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}

.theme-toggle:hover {
  border-color: #d8d4ff;
  background: #f0efff;
  color: #5146e5;
}

.theme-toggle .bi {
  color: #5146e5;
  font-size: 1rem;
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    margin-top: 0.75rem;
    padding: 1.15rem;
    border: 1px solid rgba(223, 228, 237, 0.9);
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 18px 48px rgba(27, 39, 65, 0.14);
    backdrop-filter: blur(18px);
  }

  .mobile-menu-heading {
    margin: 0.1rem 0.7rem 0.65rem;
    color: #929bb0;
    font-size: 0.69rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .navbar-nav {
    gap: 0.2rem;
    margin: 0 !important;
    padding: 0;
  }

  .nav-link {
    min-height: 3.15rem;
    margin: 0;
    padding: 0.75rem 0.8rem !important;
    border: 1px solid transparent;
    border-radius: 0.9rem;
    color: #344158;
    font-size: 0.97rem;
  }

  .nav-link.router-link-active {
    border-color: #e7e4ff;
    background: linear-gradient(110deg, #f1efff, #f8f7ff);
  }

  .navbar-actions {
    gap: 0.65rem;
    margin: 0.95rem 0 0;
    padding-top: 0.9rem;
    border-top: 1px solid #edf0f5;
  }

  .navbar-actions .btn {
    min-height: 3rem;
    flex: 1;
    justify-content: center;
  }

  .theme-toggle {
    min-height: 3rem;
    flex: 1;
  }

  .navbar-actions .btn-outline-dark {
    flex: initial;
    width: 100%;
  }
}

:global(html[data-theme='dark'] .app-navbar) {
  background: rgba(18, 24, 38, 0.94);
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.24);
}

:global(html[data-theme='dark'] .navbar-brand) {
  color: #edf0fa;
}

:global(html[data-theme='dark'] .nav-link) {
  color: #a4aec3;
}

:global(html[data-theme='dark'] .nav-link > .bi:first-child) {
  color: #8995ad;
}

:global(html[data-theme='dark'] .nav-link:hover),
:global(html[data-theme='dark'] .nav-link.router-link-active) {
  color: #b9b3ff;
  background: rgba(112, 101, 245, 0.16);
}

:global(html[data-theme='dark'] .nav-link:hover > .bi:first-child),
:global(html[data-theme='dark'] .nav-link.router-link-active > .bi:first-child),
:global(html[data-theme='dark'] .theme-toggle .bi) {
  color: #aaa3ff;
}

:global(html[data-theme='dark'] .navbar-collapse) {
  border-color: #30394c;
  background: rgba(24, 31, 47, 0.98);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.4);
}

:global(html[data-theme='dark'] .mobile-menu-heading) {
  color: #8995ad;
}

:global(html[data-theme='dark'] .nav-link.router-link-active) {
  border-color: rgba(133, 123, 255, 0.24);
  background: linear-gradient(
    110deg,
    rgba(112, 101, 245, 0.18),
    rgba(112, 101, 245, 0.08)
  );
}

:global(html[data-theme='dark'] .navbar-actions) {
  border-top-color: #30394c;
}

:global(html[data-theme='dark'] .navbar-actions .btn-light),
:global(html[data-theme='dark'] .theme-toggle) {
  border-color: #3a455c;
  background: #242d40;
  color: #e2e7f2;
}

:global(html[data-theme='dark'] .navbar-actions .btn-light:hover),
:global(html[data-theme='dark'] .theme-toggle:hover) {
  border-color: #7065f5;
  background: #303951;
}

:global(html[data-theme='dark'] .navbar-actions .btn-outline-dark) {
  border-color: #536078;
  color: #e2e7f2;
}

@media (max-width: 575.98px) {
  .app-navbar {
    min-height: 64px;
    padding-right: 0.85rem;
    padding-left: 0.85rem;
  }

  .navbar-brand {
    font-size: 1rem;
  }

  .navbar-brand img {
    width: 28px;
    height: 28px;
  }

  .navbar-collapse {
    margin-top: 0.65rem;
    padding: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-toggle-icon span,
  .nav-link,
  .nav-link-arrow,
  .nav-link > .bi:first-child {
    transition: none;
  }
}
</style>
