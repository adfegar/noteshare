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
      const note = JSON.parse(lastMessage.data)
      // set a random id just for react key
      note.id = crypto.randomUUID()
      const updatedReceivedNotes = [...receivedNotes, note]
      setReceivedNotes(updatedReceivedNotes)
    }
  }, [lastMessage])

  // custom functions to handle message actions
  function joinRoom (room) {
    const message = {
      action: 'join-room',
      message: room
    }
    sendJsonMessage(message)
  }

  function sendMessage (note) {
    const messageJSON = {
      action: 'send-message',
      message: note
    }
    sendJsonMessage(messageJSON)
  }

  return { receivedNotes, joinRoom, sendMessage }
}
