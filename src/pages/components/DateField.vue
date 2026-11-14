<template>
  <VueDatePicker
    :model-value="modelValue"
    model-type="yyyy-MM-dd"
    format="dd/MM/yyyy"
    locale="it"
    :week-start="1"
    :enable-time-picker="false"
    :clearable="false"
    :dark="isDarkTheme"
    :teleport="true"
    :offset="8"
    auto-apply
    hide-input-icon
    :input-class-name="inputClass"
    :placeholder="placeholder"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { isDarkTheme } from '../../utils/theme'

defineProps({
  modelValue: { type: String, default: null },
  placeholder: { type: String, default: 'gg/mm/aaaa' },
  inputClass: { type: String, default: 'df-input' },
})
const emit = defineEmits(['update:modelValue'])

const onUpdate = (value) => {
  if (value) emit('update:modelValue', value)
}
</script>

<style>
.dp__theme_light {
  --dp-background-color: #ffffff;
  --dp-text-color: #202a3d;
  --dp-hover-color: #f0efff;
  --dp-hover-text-color: #202a3d;
  --dp-hover-icon-color: #5146e5;
  --dp-primary-color: #5146e5;
  --dp-primary-disabled-color: #b7b1f5;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #a3acbd;
  --dp-border-color: #e7ebf2;
  --dp-menu-border-color: #e7ebf2;
  --dp-border-color-hover: #8178f2;
  --dp-border-color-focus: #5146e5;
  --dp-disabled-color: #f4f6fa;
  --dp-disabled-color-text: #b4bccb;
  --dp-icon-color: #738096;
  --dp-highlight-color: rgb(81 70 229 / 10%);
  --dp-font-family: inherit;
  --dp-border-radius: 0.75rem;
  --dp-cell-border-radius: 0.6rem;
  --dp-menu-min-width: 17rem;
  --dp-font-size: 0.9rem;
  --dp-cell-size: 2.15rem;
  --dp-input-padding: 0.5rem 0.85rem;
}

.dp__theme_dark {
  --dp-font-family: inherit;
  --dp-border-radius: 0.75rem;
  --dp-cell-border-radius: 0.6rem;
  --dp-menu-min-width: 17rem;
  --dp-font-size: 0.9rem;
  --dp-cell-size: 2.15rem;
  --dp-input-padding: 0.5rem 0.85rem;
}

.dp__menu {
  border-radius: 1rem;
  box-shadow: 0 18px 48px rgba(20, 28, 48, 0.2);
}

.dp__calendar_header_item {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dp__today {
  border-color: var(--dp-primary-color);
}

.dp__active_date {
  box-shadow: 0 4px 10px rgba(81, 70, 229, 0.35);
}

.dp__input.df-input {
  min-height: 2.85rem;
  border-radius: 0.75rem;
  font-weight: 600;
}

.dp__input.df-input.df-small {
  min-height: 2.2rem;
  padding-block: 0.3rem;
  font-size: 0.85rem;
}

.dp__input_wrap {
  width: 100%;
}
</style>
