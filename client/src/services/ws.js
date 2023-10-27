/*
const ws = new WebSocket(WS_PREFIX)

ws.addEventListener('open', () => {
  console.log('Connected to ws')
})
ws.addEventListener('close', () => {
  console.log('Connection closed')
})
ws.addEventListener('message', (event) => {
  const note = JSON.parse(event.data)
  const newNoteElement = document.createElement('p')
  newNoteElement.innerHTML = note.content
  document.getElementById('notesRoot')
    .appendChild(newNoteElement)
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

export function disconnect () {
  const disconnectMessage = {
    action: 'disconnect',
    message: ''
  }
  ws.send(JSON.stringify(disconnectMessage))
  ws.close()
} */
