<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="login-container p-4">
      <validated-form
        form-id="login-form"
        :fields="validationFields"
        @success="login"
        @fail="showValidationError"
      >
        <div class="form-group control-wrapper">
          <label class="input-label" for="username">Username</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="username"
              v-model="username"
              autocomplete="off"
              class="form-control"
            />
          </div>
        </div>
        <div class="form-group control-wrapper">
          <label class="input-label" for="password">Password</label>
          <div class="input-wrapper">
            <input
              type="password"
              id="password"
              v-model="password"
              autocomplete="off"
              class="form-control"
            />
          </div>
        </div>

        <error-message
          class="mt-3"
          v-if="errorMessage"
          :message="errorMessage"
          @alertClosed="resetErrorMessage"
        ></error-message>

        <div class="d-flex justify-content-center">
          <button type="submit" class="btn--form">Login</button>
        </div>
      </validated-form>
    </div>
  </div>

  <div v-if="user" class="text-white">{{ user.firstname }}</div>
</template>

<script>
import ErrorMessage from './components/ErrorMessage.vue'
import ValidatedForm from './components/ValidatedForm.vue'
import callService from '../services/api'
import { toast } from 'vue3-toastify'
export default {
  components: {
    ErrorMessage,
    ValidatedForm,
  },
  data() {
    return {
      password: null,
      username: null,
      errorMessage: null,
    }
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  emits: ['login'],
  methods: {
    async login() {
      try {
        let params = {
          username: this.username,
          password: this.password,
        }
        let resp = await callService('users.login', params)
        let token = resp?.token
        localStorage.setItem('token', 'Bearer' + token)
        if (resp.success) {
          this.$emit('login')
          this.$router.push('/')
        } else {
          this.errorMessage = 'Credenziali non valide, riprova!'
        }
      } catch (error) {
        if (error) {
          this.errorMessage = 'Credenziali non valide, riprova!'
        } else {
          this.errorMessage =
            'Si è verificato un errore durante il login. Riprova più tardi.'
        }
      }
    },
    resetErrorMessage() {
      this.errorMessage = null
    },
  },
  computed: {
    validationFields() {
      return [
        {
          selector: '#username',
          rules: [
            {
              rule: 'required',
              errorMessage: 'Il campo username è obbligatorio',
            },
          ],
        },
        {
          selector: '#password',
          rules: [
            {
              rule: 'required',
              errorMessage: 'Il campo password è obbligatorio',
            },
          ],
        },
      ]
    },
  },
  watch: {
    user(newValue, oldValue) {},
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
.login-container {
  width: 100%;
  max-width: 400px;
  background-color: #f9f9f9;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
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
  border-radius: 35px;
  &:focus,
  &:hover {
    background: color.adjust(#111, $lightness: 13%);
  }
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

@media (max-width: 768px) {
  .login-container {
    width: 80%;
    padding: 15px;
  }

  .btn--form {
    width: 100%;
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}
</style>
