import { ref, watch } from 'vue'

export const useMultiDropdown = (props, emit) => {
  const selectedValues = ref([])

  watch(selectedValues, newValues => {
    emit('update:modelValue', newValues)
  })

  watch(
    () => props.modelValue,
    newValue => {
      if (Array.isArray(newValue)) {
        selectedValues.value = newValue
      } else if (newValue) {
        selectedValues.value = [newValue]
      } else {
        selectedValues.value = []
      }
    },
    { immediate: true },
  )

  return {
    selectedValues,
  }
}
