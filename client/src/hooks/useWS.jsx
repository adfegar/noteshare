import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { WS_PREFIX } from '../consts'

export function useWS () {
  const [receivedNotes, setReceivedNotes] = useState([])
  const { sendJsonMessage, lastMessage } = useWebSocket(
    WS_PREFIX,
    {
      share: true,
      shouldReconnect: () => true,
      onOpen: () => console.log('Connected to WS'),
      onClose: () => console.log('Disconnected from WS')
    }
  )
  // every time a note is sent, append it to receivedNotes array
  useEffect(() => {
    if (lastMessage) {
      const newNote = JSON.parse(lastMessage.data)
      const updatedReceivedNotes = [...receivedNotes, newNote]
      setReceivedNotes(updatedReceivedNotes)
    }
  }, [lastMessage])

  // custom functions to handle message actions
  function joinRoom (room) {
    const roomName = `r_${room.id}_${room.name}`
    const message = {
      action: 'join-room',
      message: {
        id: room.id,
        name: roomName
      }
    }
    sendJsonMessage(message)
  }

  function sendMessage (note) {
    const message = {
      action: 'send-message',
      message: note
    }
    sendJsonMessage(message)
  }

  return { receivedNotes, setReceivedNotes, joinRoom, sendMessage }
}
