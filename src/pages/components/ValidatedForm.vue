<template>
  <form :id="formId" novalidate>
    <slot></slot>
  </form>
</template>

<script>
import JustValidate from 'just-validate'

export default {
  props: {
    formId: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
  },
  emits: ['success', 'fail'],
  mounted() {
    this.validator = new JustValidate(`#${this.formId}`, {
      errorFieldCssClass: 'is-invalid',
      successFieldCssClass: 'is-valid',
      validateBeforeSubmitting: true,
    })

    this.fields.forEach(({ selector, rules }) => {
      this.validator.addField(document.querySelector(selector), rules)
    })

    this.validator
      .onFail((fields) => this.$emit('fail', fields))
      .onSuccess((fields) => {
        this.$emit('success', fields)
        this.validator.destroy()
      })
  },
  beforeUnmount() {
    if (this.validator) {
      this.validator.destroy()
    }
  },
}
</script>
