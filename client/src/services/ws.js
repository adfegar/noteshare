import { WS_PREFIX } from '../consts'
console.log(WS_PREFIX)
const ws = new WebSocket(WS_PREFIX)

ws.addEventListener('open', () => {
  console.log('Connected to ws')
})
ws.addEventListener('close', () => {
  console.log('Connection closed')
})
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  console.log(message.message)
})

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
