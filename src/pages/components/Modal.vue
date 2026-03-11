<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div :class="['modal-dialog', dialogClass]">
      <div class="modal-content" :style="contentStyle">
        <div class="modal-header w-100">
          <slot name="header">
            <h5 class="modal-title">{{ title }}</h5>
          </slot>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modalId: { type: String, required: true },
  title: { type: String, default: '' },
  dialogClass: { type: String, default: 'modal-lg modal-dialog-scrollable' },
  contentStyle: { type: Object, default: () => ({}) },
})
defineEmits(['close'])
</script>
