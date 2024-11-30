<template>
    <div class="" v-if="type=='success'">
        <div class="alert alert-success" role="alert">
            <strong>{{ message }}</strong>
        </div>
    </div>
    <div v-else>
        <div class="alert alert-danger" role="alert">
            <strong>Attenzione!</strong> {{message}}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String
        },
        message: {
            type: String
        }
    },
    name: 'AlertMessage'
    
}
</script>

<style>

</style>