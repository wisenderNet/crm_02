import request from 'src/service/request'

export function ListarWhatsapps(whatsAppId) {
  return request({
    url: '/whatsapp/',
    method: 'get'
  })
}

export function ReiniciarConexoes() {
  return request({
    url: '/whatsapp/reiniciar',
    method: 'post'
  })
}

export function adminListarWhatsapps (whatsAppId) {
  return request({
    url: '/admin/channels',
    method: 'get'
  })
}

export function StartWhatsappSession (whatsAppId) {
  return request({
    url: `/whatsappsession/${whatsAppId}`,
    method: 'post'
  })
}

export function DeleteWhatsappSession(whatsAppId) {
  return request({
    url: `/whatsappsession/${whatsAppId}`,
    method: 'delete'
  })
}

export function RequestNewQrCode(data) {
  return request({
    url: `/whatsappsession/${data.id}`,
    method: 'put',
    data
  })
}

export function GetWhatSession(whatsAppId) {
  return request({
    url: `/whatsapp/${whatsAppId}`,
    method: 'get'
  })
}

export function UpdateWhatsapp(whatsAppId, data) {
  return request({
    url: `/whatsapp/${whatsAppId}`,
    method: 'put',
    data
  })
}

export function CriarWhatsapp(data) {
  return request({
    url: '/whatsapp',
    method: 'post',
    data
  })
}

export function DeletarWhatsapp(whatsAppId) {
  return request({
    url: `/whatsapp/${whatsAppId}`,
    method: 'delete'
  })
}

export function UpdateOpenIAWhatsapp(whatsAppId, data) {
  return request({
    url: `/whatsapp/updateOpenIA/${whatsAppId}`,
    method: 'put',
    data
  })
}

// api.put(`/whatsapp/${whatsAppId}`, {
//   name: values.name,
//   isDefault: values.isDefault,
// });
