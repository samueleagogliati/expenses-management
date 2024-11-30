<template>
  <div>
    <VueGoodTable
      max-height="100%"
      max-width="100%"
      :columns="columns"
      :rows="items"
      styleClass="vgt-table striped bordered condensed compact"
      :search-options="{
        enabled: false,
        trigger: 'enter',
        placeholder: 'Cerca',
      }"
      :sort-options="{
        enabled: true,
        initialSortBy: {field: 'date', type: 'asc'}
      }"
      :pagination-options="{
        enabled: true,
        mode: 'records',
        perPage: 20,
        position: 'top',
        dropdownAllowAll: false,
        nextLabel: 'Prossima',
        prevLabel: 'Precedente',
        ofLabel: 'of',
        rowsPerPageLabel: 'Righe',
        infoFn: (params) => `Pagina ${params.currentPage}`, 
      }"
    >

      <template #table-row="props">
        <span v-if="props.column.label ==''">
          <button class="btn" @click="deleteRow(props.row.id)"><i class="fa-solid fa-trash text-muted"></i></button>
        </span>
      </template>

      <template #column-filter="{ column }">
        <VueDatePicker  
          v-if="column.filterOptions.customFilter" 
          locale="it" 
          :enable-time-picker="false" 
          :dateInputFormat="'dd-MM-yyyy'"
          v-model="date"
          @update:model-value="ciao"
        >
        </VueDatePicker>
      </template>
      
    </VueGoodTable>
  </div>

</template>
  
<script>
  import { format } from 'date-fns'
  import { VueGoodTable } from 'vue-good-table-next';
  import 'vue-good-table-next/dist/vue-good-table-next.css'
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css'
  import axios from 'axios'
  export default {
    props: {
      columns: {
        type: Array,
      },
      items: {
        type: Array,
      }
    },
    components: {
      VueGoodTable,
      VueDatePicker
    },
    data(){
      return {
        date: null,
      }
    },
    methods: {
      ciao(){
        this.columns[3].filterOptions.filterValue = ""
        this.columns[3].filterOptions.filterValue = format(this.date, 'dd/MM/yyyy')
      },
      async deleteRow(expense_id){
        if (confirm("Sei sicuro di voler eliminare questa spesa?")) {
          try {
            let resp = await axios.delete('http://localhost:5000/expenses/' + expense_id)
            if (resp.status === 200){
              alert("Spesa eliminata")
              window.location.reload()
              }
          } 
          catch (error) {
            alert("Si è verificato un errore durante l'eliminazione dell'expense")
            console.error("Errore durante l'eliminazione dell'expense:", error)
          }
        }
      },
    }
  }
</script>


<style lang="scss" scoped>
:deep(#vgt-table){
  td{
    padding: 0 10px;
  }
}

:deep(.vgt-wrap__footer){
  background-color: red;
}



</style>

  