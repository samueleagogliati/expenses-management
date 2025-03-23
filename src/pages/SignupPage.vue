<template>
  <div class="d-flex justify-content-center align-items-center">
    <div class="signup_container p-4">
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
      let resp = await axios.post('http://localhost:5001/signup', params)
      console.log(resp)
      if (resp.status === 201 || resp.status === 200) {
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
  background: #e9e9e9;
}

.signup_container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; /* Centra verticalmente */
  box-shadow: 0px 3px 7px rgb(0, 0, 0);
  width: 50%;
}

.container_child {
  width: 100%;
  background: #fafafa;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #3b3a3a;
}

.form-control {
  background-color: transparent;
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-radius: 0;
  &:focus {
    border-color: #111;
    outline: none;
    box-shadow: none;
  }
}

.btn--form {
  padding: 0.5rem 2.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
  background: #111;
  border-radius: remy(35px);
  &:focus,
  &:hover {
    background: color.adjust(#111, $lightness: 13%);
  }
}

.signup_link {
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: underline;
  color: #999;
  &:focus,
  &:hover {
    color: color.adjust(#999, $lightness: -13%);
  }
}
</style>
