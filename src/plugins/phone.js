import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'

export const phonePlugin = {
  install(app, options = {}) {
    app.use(VueTelInput, options)
  },
}
