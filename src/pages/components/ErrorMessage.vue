<template>
  <div v-if="visible" class="alert alert-danger alert-dismissible">
    <strong>Attenzione</strong> {{ message }}
    <button @click="hideAlert" type="button" class="btn-close" aria-label="Chiudi avviso"></button>
  </div>
</template>

<script>
export default {
    props:{
        message: {
            type: String,
            default: null
        }
    },
    data (){
        return {
            visible: true
        }
    },
    methods: {
        hideAlert(){
            this.visible = false
            this.$emit('alertClosed')
        }
    },
    watch: {
        message(newValue, oldValue) {
            if (newValue !== null) {
                this.visible = true
            }
        }
    }
}
</script>

<style>

</style>