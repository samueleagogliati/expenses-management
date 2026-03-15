<template>
  <div class="d-flex justify-content-center align-items-center main-bg">
    <div class="signup_container">
      <form id="signup-form" class="w-100">
        <div class="form-group">
          <label for="firstname">Nome</label>
          <input
            autocomplete="new-password"
            class="form-control"
            type="text"
            id="firstname"
            v-model="firstname"
            required
          />
        </div>
        <div class="form-group">
          <label for="lastname">Cognome</label>
          <input
            autocomplete="new-password"
            class="form-control"
            type="text"
            id="lastname"
            v-model="lastname"
            required
          />
        </div>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            autocomplete="new-password"
            class="form-control"
            type="text"
            name="username"
            id="username"
            v-model="username"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            autocomplete="new-password"
            class="form-control"
            type="email"
            name="email"
            id="email"
            v-model="email"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            autocomplete="new-password"
            class="form-control"
            type="password"
            name="password"
            id="password"
            v-model="password"
            required
          />
        </div>

        <error-message
          class="mt-4"
          v-if="errorMessage"
          :message="errorMessage"
          @alertClosed="resetErrorMessage"
        ></error-message>

        <div class="mt-3">
          <ul class="list-inline text-center">
            <li>
              <input class="btn btn--form" type="submit" value="Registrati" />
            </li>
            <li>
              <router-link class="signup_link mt-2" to="/login"
                >Sono già registrato</router-link
              >
            </li>
          </ul>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import JustValidate from 'just-validate'
import ErrorMessage from './components/ErrorMessage.vue'
import callService from '../services/api'

export default {
  components: {
    ErrorMessage,
  },
  data() {
    return {
      firstname: null,
      lastname: null,
      username: null,
      email: null,
      password: null,
      errorMessage: null,
    }
  },
  methods: {
    resetErrorMessage() {
      this.errorMessage = null
    },
    async register() {
      let params = {
        firstname: this.firstname,
        lastname: this.lastname,
        username: this.username,
        email: this.email,
        password: this.password,
      }
      let resp = await callService('users.signup', params)
      if (resp.success) {
        alert('Registrazione avvenuta con successo, effettuare il login')
        this.$router.push('/login')
      } else {
        this.errorMessage =
          'Registrazione non andata a buon fine, controllare i campi inseriti!'
      }
    },
  },
  mounted() {
    const validator = new JustValidate('#signup-form', {
      errorFieldCssClass: 'is-invalid',
      successFieldCssClass: 'is-valid',
      validateBeforeSubmitting: false,
    })
    validator
      .onFail((fields) => {
        this.errorMessage = 'Controllare i campi inseriti!'
      })
      .onSuccess((fields) => {
        this.register()
      })
      .addField('#firstname', [
        {
          rule: 'required',
          errorMessage: 'Il campo Nome è obbligatorio',
        },
      ])
      .addField('#lastname', [
        {
          rule: 'required',
          errorMessage: 'Il campo Cognome è obbligatorio',
        },
      ])
      .addField('#username', [
        {
          rule: 'required',
          errorMessage: 'Il campo Username è obbligatorio',
        },
      ])
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Il campo Email è obbligatorio',
        },
        {
          rule: 'email',
          errorMessage: 'Deve essere in formato email',
        },
      ])
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: 'Il campo Password è obbligatorio',
        },
        {
          rule: 'customRegexp',
          value:
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
          errorMessage:
            'la password deve contenere: minimo otto caratteri, almeno una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale.',
        },
      ])
  },
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

body {
  font:
    100% / 1.414 'Open Sans',
    'Roboto',
    arial,
    sans-serif;
}

.main-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.signup_container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 500px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: #555;
  margin-bottom: 5px;
  display: block;
}

.form-control {
  background-color: #f0f2f5;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 15px;
  transition: all 0.3s ease;
  &:focus {
    background-color: #fff;
    border-color: #764ba2;
    outline: none;
    box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.1);
  }
}

.btn--form {
  padding: 0.5rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(to right, #667eea, #764ba2);
  border: none;
  border-radius: 35px;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
  transition: all 0.3s ease;
  &:focus,
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.6);
  }
}

.signup_link {
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: #764ba2;
  transition: color 0.3s;
  &:focus,
  &:hover {
    color: #667eea;
  }
}
</style>
