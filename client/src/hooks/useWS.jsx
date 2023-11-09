import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { WS_PREFIX } from '../consts'

const WSActions = {
  JoinRoomAction: 'join-room',
  SendNoteAction: 'send-note',
  EditNoteAction: 'edit-note',
  EditRoomAction: 'edit-room'
}

export function useWS () {
  const [receivedNotes, setReceivedNotes] = useState([])
  const [lastEditedNote, setLastEditedNote] = useState()
  const [lastEditedRoom, setLastEditedRoom] = useState()
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
      const message = JSON.parse(lastMessage.data)
      if (message.action === WSActions.SendNoteAction) {
        const updatedReceivedNotes = [...receivedNotes, message.message]
        setReceivedNotes(updatedReceivedNotes)
      } else if (message.action === WSActions.EditNoteAction) {
        setLastEditedNote(message.message)
      } else if (message.action === WSActions.EditRoomAction) {
        setLastEditedRoom(message.message)
      }
    }
  }, [lastMessage])

  // custom functions to handle message actions
  function joinRoom (room) {
    const roomName = `r_${room.id}_${room.name}`
    const message = {
      action: WSActions.JoinRoomAction,
      message: {
        id: room.id,
        name: roomName
      }
    }
    sendJsonMessage(message)
  }

  function editRoom (room) {
    const message = {
      action: WSActions.EditRoomAction,
      message: room
    }
    sendJsonMessage(message)
  }

  function sendNote (note) {
    const message = {
      action: WSActions.SendNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  function editNote (note) {
    const message = {
      action: WSActions.EditNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  return { receivedNotes, lastEditedNote, lastEditedRoom, setReceivedNotes, joinRoom, editRoom, sendNote, editNote }
}
