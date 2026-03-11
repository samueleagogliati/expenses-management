<template>
  <Notes :user="user" />
  <h1 class="text-center mt-2">{{ group?.name?.toUpperCase() }}</h1>
  <GroupDebtsForm @debt-saved="loadGroup" />

  <DebtsSummary
    v-if="group"
    :summary="group.debt_summary"
    :total="group.debt_total"
  />
  <div class="text-center my-4" v-if="groupDebts.length">
    <button
      class="btn btn-outline-dark"
      @click="showDebtsTable = !showDebtsTable"
    >
      <i
        class="fa-solid me-2"
        :class="showDebtsTable ? 'fa-eye-slash' : 'fa-eye'"
      ></i>
      {{ showDebtsTable ? 'Nascondi Dettaglio' : 'Mostra Dettaglio' }}
    </button>
  </div>
  <DebtsTable
    v-if="showDebtsTable && groupDebts.length"
    :group-debts="groupDebts"
    :group-id="groupId"
    @refresh-debts="loadGroup"
  ></DebtsTable>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import callService from '../services/api'
import Notes from './components/Notes.vue'
import GroupDebtsForm from './components/GroupDebtsForm.vue'
import DebtsSummary from './components/DebtsSummary.vue'
import DebtsTable from './components/DebtsTable.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})

const route = useRoute()
const groupId = route.params.group_id

const group = ref(null)
const groupDebts = ref([])
const showDebtsTable = ref(false)

onMounted(async () => {
  await loadGroup()
})

const loadGroup = async () => {
  group.value = await callService('groups.getGroup', { group_id: groupId })
  groupDebts.value = group.value.group_debts || []
}
</script>

<style lang="scss" scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}
</style>
