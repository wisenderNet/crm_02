import request from 'src/service/request'

export function ConsultarTickets (params) {
  return request({
    url: '/tickets',
    method: 'get',
    params
  })
}

export function ConsultarDadosTicket (params) {
  return request({
    url: `/tickets/${params.id}`,
    method: 'get',
    params
  })
}

export function ConsultarLogsTicket (params) {
  return request({
    url: `/tickets/${params.ticketId}/logs`,
    method: 'get',
    params
  })
}

export function AtualizarStatusTicket (ticketId, status, userId) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      status,
      userId
    }
  })
}

export function AtualizarTicket (ticketId, data) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data
  })
}

export function LocalizarMensagens (params) {
  return request({
    url: `/messages/${params.ticketId}`,
    method: 'get',
    params
  })
}

export function CountMensage (params) {
  return request({
    url: '/count/messages',
    method: 'get',
    params
  })
}
export function EnviarMensagemTexto (ticketId, data) {
  return request({
    url: `/messages/${ticketId}`,
    method: 'post',
    data
  })
}

export function EncaminharMensagem (messages, contato) {
  const data = {
    messages,
    contact: contato
  }
  return request({
    url: '/forward-messages/',
    method: 'post',
    data
  })
}

export function DeletarMensagem (mensagem) {
  return request({
    url: `/messages/${mensagem.messageId}`,
    method: 'delete',
    data: mensagem
  })
}

export function CriarTicket (data) {
  return request({
    url: '/tickets',
    method: 'post',
    data
  })
}

export function EditarMensagem (mensagem) {
  return request({
    url: `/messages/edit/${mensagem.messageId}`,
    method: 'post',
    data: mensagem
  })
}

export function ReagirMensagem (data) {
  return request({
    url: '/messages/reactions/${data.messageId}',
    method: 'post',
    data
  })
}

export function FecharemMassaTickets (data) {
  return request({
    url: '/tickets/close-tickets',
    method: 'post',
    data
  })
}

export function ApagaremMassaTickets (data) {
  return request({
    url: '/tickets/del-tickets',
    method: 'post',
    data
  })
}

export function ListarAgendamento(params) {
  return request({
    url: '/schedule',
    method: 'get',
    params
  })
}
