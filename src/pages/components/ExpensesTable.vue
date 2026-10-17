<template>
  <Table
    ref="table"
    :items="expenses"
    :columns="columns"
    v-if="expenses && expenses.length > 0"
    :summaryRowEnabled="true"
  >
  </Table>
</template>

<script>
import Table from './Table.vue'

export default {
  components: {
    Table,
  },
  props: {
    expenses: {
      type: Array,
      default: [],
    },
    categories: {
      type: Array,
      default: [],
    },
  },
  computed: {
    columns() {
      return [
        {
          label: 'Categoria',
          field: 'category',
          filterOptions: {
            styleClass: 'class1',
            enabled: true,
            placeholder: ' ',
            filterDropdownItems: this.categories.map(
              (category) => category.description,
            ),
            trigger: 'enter',
            customFilter: false,
          },
        },
        {
          label: 'Descrizione',
          field: 'description',
          footerFn: () => {
            return '<strong class="text-dark d-block text-end">Totale</strong>'
          },
          filterOptions: {
            styleClass: 'class1',
            enabled: true,
            placeholder: ' ',
            trigger: 'enter',
            customFilter: false,
          },
        },
        {
          label: 'Prezzo',
          field: 'price',
          filterOptions: {
            styleClass: 'class1',
            enabled: true,
            placeholder: ' ',
            trigger: 'enter',
            customFilter: false,
          },
          type: 'decimal',
          formatFn: this.formatPrice,
          footerFn: () => {
            return `<strong class="text-dark d-block text-end">${this.formatPrice(this.totalExpenses)}</strong>`
          },
        },
        {
          label: 'Data',
          field: 'date',
          filterOptions: {
            styleClass: 'class1',
            enabled: true,
            placeholder: ' ',
            trigger: 'enter',
            customFilter: true,
            filterValue: '',
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
            customFilter: false,
          },
        },
      ]
    },
    totalExpenses() {
      if (!this.expenses || this.expenses.length === 0) {
        return 0
      }
      return this.expenses.reduce(
        (sum, expense) => sum + Number(expense.price),
        0,
      )
    },
  },
  methods: {
    formatPrice: function (value) {
      if (value === null || value === undefined) return ''
      const numberValue = Number(value)
      if (isNaN(numberValue)) return ''
      return numberValue.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'EUR',
      })
    },
  },
}
</script>
