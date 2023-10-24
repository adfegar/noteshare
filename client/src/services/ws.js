import { WS_PREFIX } from '../consts'
export const ws = new WebSocket(WS_PREFIX)

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
