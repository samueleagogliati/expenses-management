<template>
    <Table :items="expenses" :columns="columns" v-if="expenses && expenses.length > 0"> </Table>
</template>

<script>

import Table from './Table.vue'

export default {
    components: {
        Table
    },
    props: {
        expenses: {
            type: Array,
            default: []
        },
        categories: {
            type: Array,
            default: []
        },
    },
    data(){
        return {
            columns: [
                { 
                    label: 'Categoria', 
                    field: 'category', 
                    tdClass: 'align-middle',
                    filterOptions: {
                        styleClass: 'class1', 
                        enabled: true, 
                        placeholder: " ", 
                        filterDropdownItems: this.categories.map(category => category.description),
                        trigger: 'enter', 
                        customFilter: false
                    }
                },
                { 
                    label: 'Descrizione', 
                    field: 'description',
                    tdClass: 'align-middle',
                    filterOptions: {
                        styleClass: 'class1', 
                        enabled: true, 
                        placeholder: " ", 
                        trigger: 'enter', 
                        customFilter: false
                    }
                },
                { 
                    label: 'Prezzo', 
                    field: 'price',
                    tdClass: 'align-middle',
                    filterOptions: {
                        styleClass: 'class1', 
                        enabled: true, 
                        placeholder: " ", 
                        trigger: 'enter', 
                        customFilter: false
                    },
                    type: 'decimal',
                    formatFn: this.formatPrice,
                },
                {
                    label: 'Data',
                    field: 'date',
                    tdClass: 'align-middle',
                    filterOptions: {
                        styleClass: 'class1', 
                        enabled: true, 
                        placeholder: " ", 
                        trigger: 'enter',
                        customFilter: true,
                        filterValue: "",
                   
                    },
                    type: 'date',
                    dateInputFormat: 'dd/MM/yyyy',
                    dateOutputFormat: 'dd/MM/yyyy',
                },
                {
                    label: '',
                    field: 'btn',
                    sortable: false,
                    width: '50px',
                    html: true,
                    filterOptions: {
                        customFilter: false
                    },
                }
            ]
        }
    },
    methods: {
        formatPrice: function(value) {
            return  value + " €"
        },
    }
}
</script>
