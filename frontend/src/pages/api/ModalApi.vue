<template>
  <q-dialog persistent
    :value="modalApi"
    @hide="fecharModal"
    @show="abrirModal">
    <q-card style="min-width: 80vw; width: 80vw"
      class="q-pa-lg">
      <q-card-section>
        <div class="text-h6">{{  apiEdicao.id ? 'Editar' : 'Crear'  }} Configuración API</div>
      </q-card-section>
      <q-card-section>
        <fieldset class="q-pa-md full-width">
          <legend class="q-px-sm">Datos API</legend>
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input square
                outlined
                v-model="api.name"
                label="Nombre de la API"
                @blur="$v.api.name.$touch"
                :error="$v.api.name.$error" />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select square
                outlined
                emit-value
                map-options
                label="Enviar por"
                color="primary"
                v-model="api.sessionId"
                :options="cSessions"
                :input-debounce="700"
                option-value="id"
                option-label="name"
                @blur="$v.api.sessionId.$touch"
                :error="$v.api.sessionId.$error"
                input-style="width: 280px; max-width: 280px;"
                error-message="Obligatorio" />
            </div>

          </div>
        </fieldset>

        <q-checkbox v-if="api.id"
          v-model="api.isActive"
          label="Activo" />
      </q-card-section>
      <q-card-actions align="right"
        class="q-mt-md">
        <q-btn
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md" />
        <q-btn
          label="Guardar"
          color="primary"
          @click="handleAPI" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { mapGetters } from 'vuex'
import { required, url } from 'vuelidate/lib/validators'
const isValidURL = (v) => url(v) || !v
import { CriarAPI, EditarAPI } from 'src/service/api'
export default {
  name: 'ModalFila',
  props: {
    modalApi: {
      type: Boolean,
      default: false
    },
    apiEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      api: {
        id: null,
        name: null,
        sessionId: null,
        urlServiceStatus: null,
        urlMessageStatus: null,
        authToken: null,
        isActive: true
      }
    }
  },
  validations: {
    api: {
      name: { required },
      sessionId: { required },
      authToken: {},
      urlServiceStatus: { isValidURL },
      urlMessageStatus: { isValidURL }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions () {
      return this.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted)
    }
  },
  methods: {
    resetarApi () {
      this.api = {
        id: null,
        queue: null,
        isActive: true
      }
    },
    fecharModal () {
      this.resetarApi()
      this.$emit('update:apiEdicao', { id: null })
      this.$emit('update:modalApi', false)
    },
    abrirModal () {
      if (this.apiEdicao.id) {
        this.api = { ...this.apiEdicao }
      } else {
        this.resetarApi()
      }
    },
    async handleAPI () {
      this.$v.api.$touch()
      if (this.$v.api.$error) {
        this.$notificarErro('Verifique los campos obligatorios e inconsistencias.')
        return
      }
      try {
        this.loading = true
        if (this.api.id) {
          const { data } = await EditarAPI(this.api)
          this.$emit('modal-api:editada', data)
          this.$notificarSucesso('API Editada')
        } else {
          const { data } = await CriarAPI(this.api)
          this.$emit('modal-api:criada', data)
          this.$notificarSucesso('API creada')
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('¡Ocurrió un error!', error)
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
