<template>
  <div class="debts-list container mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="form-check form-switch" v-if="groupDebts.length > 0">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="disableAllCheck"
          v-model="disableAll"
        />
        <label class="form-check-label" for="disableAllCheck">
          Marca tutti come saldati
        </label>
      </div>
      <div v-else>&nbsp;</div>
      <button
        class="btn btn-outline-danger btn-sm"
        :class="{ invisible: !hasCompletedDebts }"
        @click="deleteDisabledDebt"
      >
        <i class="fa-solid fa-eraser me-1"></i>
        Pulisci completati
      </button>
    </div>
    <div
      class="row debt-item align-items-center py-2 border-bottom"
      v-for="debt in groupDebts"
      :key="debt.id"
    >
      <div class="col d-flex align-items-center">
        <p
          class="m-0 fs-6"
          :class="{ 'text-decoration-line-through': debt.disabled }"
        >
          <span class="text-muted small fst-italic me-2"
            >[{{ formatDate(debt.date) }}]</span
          >
          {{ printDebt(debt) }} <b>{{ debt.description }}</b>
        </p>
      </div>
      <div class="col-auto d-flex">
        <i
          class="fa-solid fa-eye-slash text-primary me-3"
          style="cursor: pointer"
          @click="toggleDisabled(debt)"
        ></i>
        <i
          class="fa-solid fa-trash text-danger"
          style="cursor: pointer"
          @click="deleteDebt(debt)"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import callService from '../../services/api'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'

const props = defineProps({
  groupDebts: {
    type: Array,
    default: () => [],
  },
  groupId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['refresh-debts'])

const hasCompletedDebts = computed(() => {
  return props.groupDebts.some((debt) => debt.disabled)
})

const allDisabled = computed(() => {
  if (!props.groupDebts || props.groupDebts.length === 0) {
    return false
  }
  return props.groupDebts.every((debt) => debt.disabled)
})

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YY')
}

const printDebt = (debt) => {
  return `${debt.payer.firstname} deve a ${debt.receiver.firstname} ${debt.price}€ di`
}

const disableAll = computed({
  get() {
    return allDisabled.value
  },
  set(shouldDisable) {
    const actionText = shouldDisable ? 'saldare' : 'riattivare'
    if (confirm(`Sei sicuro di voler ${actionText} tutti i debiti?`)) {
      bulkUpdateDebts(shouldDisable)
    }
  },
})

const bulkUpdateDebts = async (disabled) => {
  const resp = await callService('groupDebts.updateAllDebtsInGroup', {
    group_id: props.groupId,
    disabled: disabled,
  })
  if (resp.success) {
    toast.success(resp.message)
    emit('refresh-debts')
  } else {
    toast.error(resp.message || `Errore durante l'aggiornamento`)
  }
}

const toggleDisabled = async (debt) => {
  debt.disabled = !debt.disabled
  const resp = await callService('groupDebts.updateDebt', {
    id: debt.id,
    disabled: debt.disabled,
  })
  if (resp.success) {
    emit('refresh-debts')
  } else {
    toast.error("Errore durante l'aggiornamento")
    // revert change on error
    debt.disabled = !debt.disabled
  }
}

const deleteDebt = async (debt) => {
  if (confirm('Sei sicuro di voler eliminare questo debito?')) {
    const resp = await callService('groupDebts.deleteDebt', { id: debt.id })
    if (resp.success) {
      toast.success(resp.message)
      emit('refresh-debts')
    } else {
      toast.error(resp.message || "Errore durante l'eliminazione")
    }
  }
}

const deleteDisabledDebt = async () => {
  if (confirm('Sei sicuro di voler eliminare tutti i debiti completati?')) {
    const resp = await callService('groupDebts.deleteDisabledDebt', {
      group_id: props.groupId,
    })
    if (resp.success) {
      toast.success(resp.message)
      emit('refresh-debts')
    } else {
      toast.error(resp.message || "Errore durante l'eliminazione")
    }
  }
}
</script>

<style scoped>
.debts-list {
  max-height: 40vh;
  overflow-y: scroll;
}
</style>
