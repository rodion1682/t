<template>
  <div class="price-container">
    <div class="price-header">
      <div class="price-label">{{ $t(`Price`) }}</div>
      <div class="price-range">
        <div class="from-value">
          <div class="from">{{ $t(`From`) }}:</div>
          <div class="min-value">
            <img
              v-if="settingsStore.settings?.internal_currency?.image"
              :src="settingsStore.settings.internal_currency.image"
              alt="Currency"
              class="currency-icon"
            />
            {{ formattedDisplayMinValue }}
          </div>
        </div>

        <div class="to-value">
          <div class="to">{{ $t(`To`) }}:</div>
          <div class="max-value">
            <img
              v-if="settingsStore.settings?.internal_currency?.image"
              :src="settingsStore.settings.internal_currency.image"
              alt="Currency"
              class="currency-icon"
            />
            {{ formattedDisplayMaxValue }}
          </div>
        </div>
      </div>
    </div>
    <div class="slider-wrapper">
      <!-- Ensure MultiRangeSlider component is correctly imported and registered if not global -->
      <MultiRangeSlider
        v-if="isMounted"
        :baseClassName="'multi-range-slider'"
        :min="0"
        :max="100"
        :step="1"
        :ruler="false"
        :label="false"
        :minValue="logSliderMin"
        :maxValue="logSliderMax"
        @input="updateValues"
      />
      <div class="slider-labels">
        <div class="min-label">
          <img
            v-if="settingsStore.settings?.internal_currency?.image"
            :src="settingsStore.settings.internal_currency.image"
            alt="Currency"
            class="currency-icon"
          />
          0.00
        </div>
        <div class="max-label">
          <img
            v-if="settingsStore.settings?.internal_currency?.image"
            :src="settingsStore.settings.internal_currency.image"
            alt="Currency"
            class="currency-icon"
          />
          <!-- Display the fixed scale maximum with 2 decimal places -->
          {{ scaleMaximum.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MultiRangeSlider from 'multi-range-slider-vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { fiatToInternalCurrency } from '@/utils/helpers'

const props = defineProps({
  minValue: {
    type: Number,
    default: 0,
  },
  maxValue: {
    // This prop should represent the *absolute maximum possible value* for the scale
    type: Number,
    default: null, // Don't hardcode, will be calculated
  },
  initialMin: {
    // Optional: Set initial selected min value different from 0
    type: Number,
    default: 0,
  },
  initialMax: {
    // Optional: Set initial selected max value different from props.maxValue
    type: Number,
    default: null, // Default to props.maxValue if not provided
  },
})

const emit = defineEmits(['update-range'])

const settingsStore = useSettingsStore()
const isMounted = ref(false) // Prevent slider rendering before scale max is set

// --- State Variables ---

// The absolute maximum value the slider represents. Used for log scale calculations.
// Set once on mount based on props.maxValue and assumed to be fixed.
const scaleMaximum = ref(0)

// The current *selected* minimum value (actual price)
const displayMinValue = ref(0)
// The current *selected* maximum value (actual price)
const displayMaxValue = ref(0)

// The position of the min thumb on the slider (0-100, logarithmic)
const logSliderMin = ref(0)
// The position of the max thumb on the slider (0-100, logarithmic)
const logSliderMax = ref(100)

// Default max price in EUR
const DEFAULT_MAX_PRICE_EUR = 9999

// --- Computed Values for Display ---

const formattedDisplayMinValue = computed(() => {
  // Format with 2 decimal places
  return displayMinValue.value.toFixed(2)
})

const formattedDisplayMaxValue = computed(() => {
  // Format with 2 decimal places
  return displayMaxValue.value.toFixed(2)
})

// Calculate the actual max price based on internal currency settings
const calculateMaxPrice = () => {
  // Check if internal currency is enabled
  const isInternalCurrencyEnabled = settingsStore.settings?.internal_currency?.enabled;
  
  if (isInternalCurrencyEnabled) {
    // Get the exchange rate
    const exchangeRate = settingsStore.settings?.internal_currency?.exchange_rate_eur || 0.93;
    
    // Convert default max price to internal currency
    return Math.ceil(fiatToInternalCurrency(DEFAULT_MAX_PRICE_EUR, exchangeRate, 'EUR'));
  }
  
  return DEFAULT_MAX_PRICE_EUR;
}

// --- Logarithmic Scale Conversion Functions ---

// Convert actual value to logarithmic slider position (0-100)
const valueToSlider = value => {
  const max = scaleMaximum.value // Use the fixed scale maximum
  if (max <= 0) return 0 // Avoid division by zero or log(<=0)
  if (value <= 0) return 0
  // Clamp value to be <= max to prevent slider position > 100
  const clampedValue = Math.min(value, max)
  // Using natural log scale. Add 1 to avoid log(0).
  const logMax = Math.log(max + 1)
  if (logMax === 0) return 0 // Avoid division by zero if max is 0
  return Math.round((Math.log(clampedValue + 1) / logMax) * 100)
}

// Convert slider position (0-100) to actual value
const sliderToValue = position => {
  const max = scaleMaximum.value // Use the fixed scale maximum
  if (max <= 0) return 0
  // Convert back from log scale
  const logMax = Math.log(max + 1)
  const value = Math.exp((position / 100) * logMax) - 1
  // Clamp value to be within [0, max] and round to 2 decimal places for precision
  return Math.max(0, Math.min(max, parseFloat(value.toFixed(2))))
}

// --- Initialization ---

onMounted(() => {
  // 1. Calculate and set the fixed maximum for the scale
  const calculatedMaxPrice = calculateMaxPrice();
  
  // Always use the calculated max price as the scale maximum
  scaleMaximum.value = calculatedMaxPrice;

  // 2. Set the initial *selected* values
  // Use initialMin/initialMax if provided, otherwise default to 0 and scaleMaximum
  const initialSelectedMin = props.initialMin
  const initialSelectedMax =
    props.initialMax !== null ? 
    Math.min(props.initialMax, scaleMaximum.value) : 
    scaleMaximum.value

  displayMinValue.value = Math.max(
    0,
    Math.min(initialSelectedMin, scaleMaximum.value),
  )
  displayMaxValue.value = Math.max(
    0,
    Math.min(initialSelectedMax, scaleMaximum.value),
  )

  // Ensure min <= max
  if (displayMinValue.value > displayMaxValue.value) {
    // Swap them or set min to 0, depending on desired behavior
    displayMinValue.value = 0
  }

  // 3. Calculate initial slider thumb positions based on selected values and scale max
  logSliderMin.value = valueToSlider(displayMinValue.value)
  logSliderMax.value = valueToSlider(displayMaxValue.value)

  // 4. Allow slider rendering now that values are initialized
  // Use nextTick to ensure DOM updates before slider potentially tries to render
  nextTick(() => {
    isMounted.value = true
  })
})

// --- Watchers for External Changes (e.g., parent component resetting filters) ---

// Watch for changes in the *initial* min prop if you need to reset the slider externally
watch(
  () => props.initialMin,
  newVal => {
    if (!isMounted.value) return // Don't run before mount
    const newMin = Math.max(0, Math.min(newVal, displayMaxValue.value)) // Ensure valid range
    displayMinValue.value = newMin
    logSliderMin.value = valueToSlider(newMin)
    // Optionally emit update if external change should trigger it
    // emit('update-range', { min: displayMinValue.value, max: displayMaxValue.value });
  },
)

// Watch for changes in the *initial* max prop
watch(
  () => props.initialMax,
  newVal => {
    if (!isMounted.value) return // Don't run before mount
    
    // Important: Always allow selection up to the calculated maximum
    // Don't restrict to the initialMax from URL parameter
    const newMax = Math.min(
      newVal !== null ? newVal : scaleMaximum.value,
      scaleMaximum.value
    )
    
    // Always update displayMaxValue to the user-selected value,
    // which could be different from props.initialMax
    displayMaxValue.value = Math.max(displayMinValue.value, newMax)
    
    // Calculate the slider position based on the display value
    logSliderMax.value = valueToSlider(displayMaxValue.value)
  },
)

// Watch for changes in the settings (e.g., currency changes)
watch(
  () => settingsStore.settings?.internal_currency,
  () => {
    if (!isMounted.value) return // Don't run before mount
    
    // Recalculate the max price
    const calculatedMaxPrice = calculateMaxPrice();
    
    // Only update if the new max is higher than the current one
    if (calculatedMaxPrice > scaleMaximum.value) {
      scaleMaximum.value = calculatedMaxPrice;
      
      // If max value was at the previous maximum, update it to the new maximum
      if (displayMaxValue.value >= scaleMaximum.value - 1) {
        displayMaxValue.value = scaleMaximum.value;
        logSliderMax.value = 100; // Set to max
        
        // Emit the update
        emit('update-range', {
          min: parseFloat(displayMinValue.value.toFixed(2)),
          max: parseFloat(displayMaxValue.value.toFixed(2)),
        });
      }
    }
  },
  { deep: true }
)

// --- Event Handler for Slider Input ---

const updateValues = e => {
  // 1. Convert slider positions (0-100) back to actual values using the *fixed* scale maximum
  const actualMin = sliderToValue(e.minValue)
  const actualMax = sliderToValue(e.maxValue)

  // 2. Update the displayed values (these trigger the computed formatters)
  // Use Math.min/max to prevent potential crossing due to rounding/log conversion quirks
  displayMinValue.value = Math.min(actualMin, actualMax)
  
  // Always allow the max value to go up to scaleMaximum regardless of initialMax
  displayMaxValue.value = Math.max(actualMin, Math.min(actualMax, scaleMaximum.value))

  // 3. Emit the updated *actual* range with values rounded to 2 decimal places
  emit('update-range', {
    min: parseFloat(displayMinValue.value.toFixed(2)),
    max: parseFloat(displayMaxValue.value.toFixed(2)),
  })
}
</script>

<style lang="scss" scoped>
.price-container {
  display: flex;
  flex-direction: column;
  gap: 27px;
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.price-label {
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 56px;
}

.from-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.to-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.from,
.to {
  color: #f5f5f5;
  font-size: 20px;
  font-weight: 400;
}

.min-value,
.max-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  color: #f5f5f5;
  font-size: 20px;
}

.currency-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.slider-wrapper {
  position: relative;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  color: #f5f5f5;
  font-size: 14px;
  font-weight: 700;
}

.min-label,
.max-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
}

:deep(.multi-range-slider) {
  border: none;
  box-shadow: none;
  padding: 0;
  margin-top: 8px;
  margin-bottom: 11px;
  background: transparent;
}

:deep(.multi-range-slider .bar-left),
:deep(.multi-range-slider .bar-right) {
  background-color: #000000;
  box-shadow: none;
}

:deep(.multi-range-slider .bar) {
  background-color: #000000;
  border-radius: 12px;
  box-shadow: none;
}

:deep(.multi-range-slider .bar-inner) {
  height: 4px;
  transform: translateY(2px);
  background-color: #f5f5f5;
  border: none;
  box-shadow: none;
}

:deep(.multi-range-slider .thumb::before) {
  background-color: #faa720;
  border: none;
  box-shadow: none;
  height: 15px;
  width: 15px;
  margin: -4px;
}

:deep(.multi-range-slider .caption) {
  display: none !important;
}

@media (max-width: 768px) {
  .price-range {
    gap: 8px;
  }

  .from,
  .to,
  .min-value,
  .max-value {
    font-size: 20px;
  }

  .currency-icon {
    width: 24px;
    height: 24px;
  }

  .from-value {
    margin-right: 24px;
  }
}
</style>
