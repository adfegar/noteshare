import { WS_PREFIX } from '../consts'
export const ws = new WebSocket(WS_PREFIX)

export function joinRoom (room) {
  const message = {
    action: 'join-room',
    message: room
  }
  ws.send(JSON.stringify(message))
}

export function leaveRoom () {
  const message = {
    action: 'leave-room'
  }

  ws.send(JSON.stringify(message))
}

export function sendMessage (message) {
  const messageJSON = {
    action: 'send-message',
    message
  }
  ws.send(JSON.stringify(messageJSON))
}

export function disconnect () {
  const disconnectMessage = {
    action: 'disconnect',
    message: ''
  }
  ws.send(JSON.stringify(disconnectMessage))
  ws.close()
}
