<template>
  <div class="q-pa-md">
    <transition-group appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut">
      <template v-for="(mensagem, index) in mensagens">
        <hr v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)">
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div :key="`ref-${mensagem.createdAt}`"
            ref="lastMessageRef"
            id="lastMessageRef"
            style="float: 'left', background: 'black', clear: 'both'" />
        </template>
        <div :key="`chat-message-${mensagem.id}`"
          :id="`chat-message-${mensagem.id}`" />
        <q-chat-message :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? ($q.dark.isActive ? 'green-2' : 'green-1') : ($q.dark.isActive ? 'blue-2' : 'blue-1')"
          :class="{ pulseIdentications: identificarMensagem == `chat-message-${mensagem.id}` }">
          <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
          <div style="min-width: 100px; max-width: 350px;"
            :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''">
            <q-checkbox v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                  'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                  'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe
                }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click.native="verificarEncaminharMensagem(mensagem)"
              :value="false" />

            <q-icon class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                  'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                  'text-positive': !['pending', 'canceled'].includes(mensagem.status)
                }"
              v-if="mensagem.scheduleDate">
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">
                  Mensaje programada
                </div>
                <div class="row col"
                  v-if="mensagem.isDeleted">
                  <q-chip color="red-3"
                    icon="mdi-trash-can-outline">
                    Envío cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1"
                    icon="mdi-calendar-import">
                    Creado en: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1"
                    icon="mdi-calendar-start">
                    Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>
            <div v-if="mensagem.edited" class="text-italic">
            Editada: {{ mensagem.edited }}
            </div>
            <div v-if="mensagem.edited" class="text-italic">
             Mensaje anterior:<br>
            </div>
            <div v-if="mensagem.isDeleted"
              class="text-italic">
              Mensaje eliminada en {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div>
            <div v-if="isGroupLabel(mensagem)"
              class="q-mb-sm"
              style="display: flex; color: rgb(59 23 251); fontWeight: 500;">
              {{ isGroupLabel(mensagem) }}
            </div>
            <div v-if="mensagem.quotedMsg"
              :class="{ 'textContentItem': !mensagem.isDeleted, 'textContentItemDeleted': mensagem.isDeleted }">
              <MensagemRespondida style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="f
                                                                                                                carMensagem"
                :mensagem="mensagem.quotedMsg" />
            </div>
            <q-btn v-if=" !mensagem.isDeleted && isShowOptions "
              class="absolute-top-right mostar-btn-opcoes-chat"
              dense
              flat
              ripple
              round
              icon="mdi-chevron-down">
              <q-menu square
                auto-close
                anchor="bottom left"
                self="top left">
                <q-list style="min-width: 100px">
                  <q-item :disable=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) "
                    clickable
                    @click="citarMensagem(mensagem)">
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) ">
                      Disponible solo para WhatsApp y Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item clickable
                    @click="encaminharMensagem(mensagem)">
                    <q-item-section>Reenviar</q-item-section>
                  </q-item>
                  <q-item clickable
                    @click="marcarMensagensParaEncaminhar(mensagem)">
                    <q-item-section>Marcar (reenviar varias)</q-item-section>
                  </q-item>

                  <q-item :disable=" !['whatsapp'].includes(ticketFocado.channel) " clickable @click="mensagemReacao = mensagem; modalEmojiOpen = true" v-if="ticketFocado.channel === 'whatsapp'">
                  <q-item-section>Reaccionar</q-item-section>
                  </q-item>

                  <q-item
                    @click="AbrirmodaleditarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe  && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'">
                    <q-item-section>
                      <q-item-label>Editar Mensaje</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item @click="deletarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe"
                    :disable="isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger'">
                    <q-item-section>
                      <q-item-label>Eliminar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon v-if="mensagem.fromMe"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name="ackIcons[mensagem.ack]"
              size="1.2em"
              :color="mensagem.ack >= 3 ? 'blue-12' : ''" />
            <template v-if="mensagem.mediaType === 'audio'">
              <div style="width: 330px; heigth: 300px">
                <audio class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="download playbackrate volume">
                  <source :src="mensagem.mediaUrl"
                    type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'contactMessage'">
                <div style="min-width: 250px;">
                <ContatoCard
                :mensagem="mensagem"
                @openContactModal="openContactModal"
                />
                <ContatoModal
                :value="modalContato"
                :contact="currentContact"
                @close="closeModal"
                @saveContact="saveContact"
                />
                </div>
            </template>
            <template v-if="mensagem.mediaType === 'locationMessage'">
              <q-img
                @click="openGoogleMaps(mensagem.body)"
                :src="getMapThumbnail(mensagem.body)"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
            </template>
            <template v-if="mensagem.mediaType === 'liveLocationMessage'">
              <q-img
                @click="openGoogleMaps(mensagem.body)"
                :src="getMapThumbnail(mensagem.body)"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
            <div style="color: red;">*Todavía no es posible mostrar la ubicación en tiempo real en este dispositivo. Abre WhatsApp en tu móvil para verlo correctamente.</div>
            </template>
            <template v-if="mensagem.mediaType === 'interactiveMessage'">
            <div style="color: red;">*No es posible mostrar este mensaje en este dispositivo. Abre WhatsApp en tu móvil para ver el mensaje.</div>
            </template>
            <template v-if="mensagem.mediaType === 'pollCreationMessageV3'">
            <div style="color: red;">*No es posible mostrar este mensaje en este dispositivo. Abre WhatsApp en tu móvil para ver el mensaje.</div>
            </template>
            <template v-if="mensagem.mediaType === 'productMessage'">
            <div style="color: red;">*No es posible mostrar este mensaje en este dispositivo. Abre WhatsApp en tu móvil para ver el mensaje.</div>
            </template>
            <template v-if="mensagem.mediaType === 'image' && !mensagem.mediaUrl.includes('.webp')">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;" />
              <VueEasyLightbox moveDisabled
                :visible="abrirModalImagem"
                :imgs="urlMedia"
                :index="mensagem.ticketId || 1"
                @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaType === 'image' && mensagem.mediaUrl.includes('.webp')">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="200px"
                width="200px"
                class="q-mt-md"
                style="cursor: pointer;" />
              <VueEasyLightbox moveDisabled
                :visible="abrirModalImagem"
                :imgs="urlMedia"
                :index="mensagem.ticketId || 1"
                @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaType === 'video'">
              <video :src="mensagem.mediaUrl"
                controls
                class="q-mt-md"
                style="objectFit: cover;
                  width: 330px;
                  height: 150px;
                  borderTopLeftRadius: 8px;
                  borderTopRightRadius: 8px;
                  borderBottomLeftRadius: 8px;
                  borderBottomRightRadius: 8px;
                ">
                </video>
            </template>
            <template v-if="mensagem.mediaType === 'buttonsMessage'">
              <div style="margin-top:20px" v-html="formatarBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'listMessage'">
              <div style="margin-top:20px" v-html="formatarBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="!['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType) && mensagem.mediaUrl">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <iframe v-if="isPDF(mensagem.mediaUrl)"
                  frameBorder="0"
                  scrolling="no"
                  style="
                    width: 330px;
                    height: 150px;
                    overflow-y: hidden;
                    -ms-overflow-y: hidden;
                  "
                  class="no-scroll hide-scrollbar"
                  :src="mensagem.mediaUrl"
                  id="frame-pdf">
                  Descargue el PDF
                  <!-- alt : <a href="mensagem.mediaUrl"></a> -->
                </iframe>
                <q-btn type="a"
                  :color="$q.dark.isActive ? '' : 'grey-3'"
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded  text-grey-9 ellipsis"
                  download
                  :target="isPDF(mensagem.mediaUrl) ? '_blank' : ''"
                  :href="mensagem.mediaUrl">
                  <q-tooltip v-if="mensagem.mediaUrl"
                    content-class="text-bold">
                    Descargar: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs ">
                    <div class="ellipsis col-grow q-pr-sm"
                      style="max-width: 290px">
                      {{ formatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
            </template>
            <div v-linkified
              v-if="!['listMessage', 'buttonsMessage', 'productMessage', 'contactMessage', 'application', 'locationMessage', 'liveLocationMessage', 'interactiveMessage', 'pollCreationMessageV3'].includes(mensagem.mediaType)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap">
              <div v-html="formatarMensagemWhatsapp(mensagem.body)">
              </div>
            </div>

          </div>
        </q-chat-message>
      </template>
    </transition-group>
<q-dialog v-model="modalEmojiOpen">
  <q-card>
    <q-card-section class="row q-gutter-sm">
      <!-- Exibe os 6 emojis principais -->
      <q-btn v-for="emoji in principaisEmojis" :key="emoji" flat @click="selectEmoji(emoji, mensagemReacao)">
        {{ emoji }}
      </q-btn>

      <!-- Botão circular com o ícone "+" -->
      <q-btn
        flat
        round
        icon="add"
        size="sm"
        class="q-ml-sm"
        @click="expandirEmojis = !expandirEmojis"
      />

      <!-- Exibe o restante dos emojis se expandirEmojis for verdadeiro -->
      <div v-if="expandirEmojis">
        <VEmojiPicker
          style="width: 40vw"
          :showSearch="false"
          :emojisByRow="calculateEmojisByRow()"
          labelSearch="Localizar..."
          lang="es"
          @select="onInsertSelectEmoji"
        />
      </div>
    </q-card-section>
  </q-card>
</q-dialog>
  <q-dialog v-model="showModaledit">
  <q-card>
    <q-card-section>
      <div class="text-h6">Editar Mensaje</div>
    </q-card-section>
    <q-card-section>
      <q-input filled v-model="mensagemAtual.body" label="Mensaje" />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Cancelar" color="negative" v-close-popup />
      <q-btn label="Guardar" color="primary" @click="salvarMensaje" />
    </q-card-actions>
  </q-card>
</q-dialog>
  </div>
</template>

<script>
import mixinCommon from './mixinCommon'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida'
import ContatoCard from './ContatoCard.vue'
import ContatoModal from './ContatoModal.vue'
import { VEmojiPicker } from 'v-emoji-picker'
const downloadImageCors = axios.create({
  baseURL: process.env.URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})
import { DeletarMensagem, EditarMensagem, ReagirMensagem } from 'src/service/tickets'
import { Base64 } from 'js-base64'
export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagem: {
      type: Object,
      required: true
    },
    mensagens: {
      type: Array,
      default: () => []
    },
    mensagensParaEncaminhar: {
      type: Array,
      default: () => []
    },
    size: {
      type: [String, Number],
      default: '5'
    },
    isLineDate: {
      type: Boolean,
      default: true
    },
    isShowOptions: {
      type: Boolean,
      default: true
    },
    ativarMultiEncaminhamento: {
      type: Boolean,
      default: false
    },
    replyingMessage: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      modalEmojiOpen: false,
      mensagemReacao: null,
      expandirEmojis: false,
      principaisEmojis: ['👍', '❤️', '😂', '😮', '😢', '👏'],
      mensagemAtual: { body: '' },
      showModaledit: false,
      modalContato: false,
      currentContact: {},
      abrirModalImagem: false,
      urlMedia: '',
      identificarMensagem: null,
      ackIcons: { // Se ACK == 3 ou 4 entao color green
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all'
      }
    }
  },
  components: {
    VueEasyLightbox,
    MensagemRespondida,
    ContatoCard,
    ContatoModal,
    VEmojiPicker
  },
  methods: {
    onInsertSelectEmoji(emoji) {
      if (this.mensagemReacao) {
        const reactionData = {
          messageId: this.mensagemReacao.messageId,
          ticketId: this.mensagemReacao.ticketId,
          reaction: emoji.data
        }
        this.selectEmoji(reactionData.reaction, this.mensagemReacao)
      } else {
        console.error('Ningún mensaje fue seleccionado para reacción.')
      }
      this.modalEmojiOpen = false
    },
    async selectEmoji(emoji, mensagem) {
      if (mensagem) {
        const reactionData = {
          messageId: mensagem.messageId,
          ticketId: mensagem.ticketId,
          reaction: emoji
        }
        await ReagirMensagem(reactionData)
        this.mensagem = null
      } else {
        console.error('Ningún mensaje fue seleccionado para reacción.')
      }
      this.modalEmojiOpen = false
    },
    calculateEmojisByRow() {
      const screenWidth = window.innerWidth
      if (screenWidth < 600) {
        return 5
      } else if (screenWidth >= 600 && screenWidth < 1200) {
        return 10
      } else {
        return 20
      }
    },
    async salvarMensaje () {
      try {
        const updatedMessage = await EditarMensagem({
          id: this.mensagemAtual.id,
          messageId: this.mensagemAtual.messageId,
          body: this.mensagemAtual.body
        })
        // console.log('Mensaje editado con éxito')
        this.showModaledit = false
        this.atualizarMensaje(updatedMessage)
      } catch (error) {
        console.error('Error al editar el mensaje', error.message)
        this.$notificarErro('No se pudo editar el mensaje')
      }
    },
    atualizarMensaje (updatedMessage) {
      const index = this.mensagens.findIndex(mensagem => mensagem.id === updatedMessage.id)
      if (index !== -1) {
        this.mensagens.splice(index, 1, updatedMessage)
      }
    },
    AbrirmodaleditarMensagem (mensagem) {
      this.mensagemAtual = mensagem
      this.showModaledit = true
    },
    openContactModal (contact) {
      this.currentContact = contact
      this.modalContato = true
    },
    closeModal () {
      this.modalContato = false
    },
    saveContact (contact) {
      // console.log('Contato salvo:', contact)
      // Aqui você pode adicionar a lógica para salvar o contato
    },
    getMapThumbnail(body) {
      const [thumbnail] = body.split('|')
      return thumbnail
    },
    openGoogleMaps(body) {
      const [, mapLink] = body.split('|')
      window.open(mapLink, '_blank')
    },
    verificarEncaminharMensagem (mensagem) {
      const mensagens = [...this.mensagensParaEncaminhar]
      const msgIdx = mensagens.findIndex(m => m.id === mensagem.id)
      if (msgIdx !== -1) {
        mensagens.splice(msgIdx, 1)
      } else {
        if (this.mensagensParaEncaminhar.length > 9) {
          this.$notificarErro('Permitido un máximo de 10 mensajes.')
          return
        }
        mensagens.push(mensagem)
      }
      this.$refs[`box-chat-message-${mensagem.id}`][0].value = !this.$refs[`box-chat-message-${mensagem.id}`][0].value
      this.$emit('update:mensagensParaEncaminhar', mensagens)
    },
    marcarMensagensParaEncaminhar (mensagem) {
      this.$emit('update:mensagensParaEncaminhar', [])
      this.$emit('update:ativarMultiEncaminhamento', !this.ativarMultiEncaminhamento)
      // this.verificarEncaminharMensagem(mensagem)
    },
    isPDF (url) {
      if (!url) return false
      const split = url.split('.')
      const ext = split[split.length - 1]
      return ext === 'pdf'
    },
    isGroupLabel (mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    returnCardContato (str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    isDesactivatDelete (msg) {
      // if (msg) {
      //   return (differenceInMinutes(new Date(), new Date(+msg.timestamp)) > 5)
      // }
      return false
    },
    async buscarImageCors (imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers['content-type'] })
        )
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro('¡Ocurrió un error!', error)
      }
      this.loading = false
    },
    citarMensagem (mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      this.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    encaminharMensagem (mensagem) {
      this.$emit('mensagem-chat:encaminhar-mensagem', mensagem)
    },
    deletarMensagem (mensagem) {
      if (this.isDesactivatDelete(mensagem)) {
        this.$notificarErro('No fue posible eliminar el mensaje después de 5 minutos de su envío.')
      }
      // const diffHoursDate = differenceInHours(
      //   new Date(),
      //   parseJSON(mensagem.createdAt)
      // )
      // if (diffHoursDate > 2) {
      //   // throw new AppError("No delete message afeter 2h sended");
      // }
      const data = { ...mensagem }
      this.$q.dialog({
        title: '¡Atención! ¿Realmente deseas eliminar el mensaje?',
        message: 'Los mensajes antiguos no serán eliminados en el cliente.',
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarMensagem(data)
          .then(res => {
            this.loading = false
            mensagem.isDeleted = true
          })
          .catch(error => {
            this.loading = false
            console.error(error)
            this.$notificarErro('No fue posible eliminar el mensaje', error)
          })
      }).onCancel(() => {
      })
    },
    focarMensagem (mensagem) {
      const id = `chat-message-${mensagem.id}`
      this.identificarMensagem = id
      this.$nextTick(() => {
        const elem = document.getElementById(id)
        elem.scrollIntoView()
      })
      setTimeout(() => {
        this.identificarMensagem = null
      }, 5000)
    }
  },
  mounted () {
    this.scrollToBottom()
    window.addEventListener('resize', this.onResize)
    // this.$refs.audioMessage.forEach(element => {
    //   element.playbackRate = 2
    // })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  destroyed() {}
}
</script>

<style lang="scss">
.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.emoji-picker {
  width: 100%;
}

@media (min-width: 600px) {
  .emoji-picker {
    width: 50vw;
  }
}

</style>
