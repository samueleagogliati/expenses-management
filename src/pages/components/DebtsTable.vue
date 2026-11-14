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
        class="btn btn-sm clean-btn"
        :class="{ invisible: !hasCompletedDebts }"
        @click="deleteDisabledDebt"
      >
        <i class="bi bi-eraser me-1"></i>
        Pulisci completati
      </button>
    </div>
    <div
      class="row debt-item align-items-center py-3 px-2"
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
        <button class="icon-btn" type="button" aria-label="Modifica" @click="$emit('edit-debt', debt)">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="icon-btn" type="button" :aria-label="debt.disabled ? 'Riattiva' : 'Segna come saldato'" @click="toggleDisabled(debt)">
          <i class="bi" :class="debt.disabled ? 'bi-eye' : 'bi-eye-slash'"></i>
        </button>
        <button class="icon-btn danger" type="button" aria-label="Elimina" @click="deleteDebt(debt)">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import callService from '../../services/api'
import { toast } from 'vue3-toastify'
import { formatEuro } from '../../utils/number'
import { format } from 'date-fns'

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

const emit = defineEmits(['refresh-debts', 'edit-debt'])

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
  return format(new Date(date), 'dd/MM/yy')
}

const printDebt = (debt) => {
  return `${debt.payer.firstname} deve a ${debt.receiver.firstname} ${formatEuro(debt.price)} di`
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
  overflow-y: auto;
}

.debt-item {
  border-bottom: 1px solid var(--app-border);
  transition: background-color 140ms ease;
}

.debt-item:hover {
  background-color: color-mix(in srgb, var(--app-primary) 5%, transparent);
}

.clean-btn {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: #ef4444;
}

.clean-btn:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.icon-btn {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  margin-left: 0.15rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: var(--app-muted);
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.icon-btn:hover {
  background: color-mix(in srgb, var(--app-primary) 12%, transparent);
  color: var(--app-primary);
}

.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
</style>
