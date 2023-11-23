import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { WS_PREFIX } from '../consts'

const WSActions = {
  JoinRoomAction: 'join-room',
  SendNoteAction: 'send-note',
  EditNoteAction: 'edit-note',
  DeleteNoteAction: 'delete-note',
  EditRoomAction: 'edit-room',
  DeleteRoomAction: 'delete-room'
}

export function useWS () {
  const [lastReceivedNote, setLastReceivedNote] = useState()
  const [lastEditedNote, setLastEditedNote] = useState()
  const [lastDeletedNote, setLastDeletedNote] = useState()
  const [lastEditedRoom, setLastEditedRoom] = useState()
  const [lastDeletedRoom, setLastDeletedRoom] = useState()
  const { sendJsonMessage, lastMessage } = useWebSocket(
    WS_PREFIX,
    {
      share: true,
      shouldReconnect: () => false,
      onOpen: () => console.log('connected to WS'),
      onClose: () => console.log('Disconnected from WS')
    }
  )
  // every time a note is sent, append it to receivedNotes array
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage.data)
      if (message.action === WSActions.SendNoteAction) {
        setLastReceivedNote(message.message)
      } else if (message.action === WSActions.EditNoteAction) {
        setLastEditedNote(message.message)
      } else if (message.action === WSActions.DeleteNoteAction) {
        setLastDeletedNote(message.message)
      } else if (message.action === WSActions.EditRoomAction) {
        setLastEditedRoom(message.message)
      } else if (message.action === WSActions.DeleteRoomAction) {
        setLastDeletedRoom(message.message)
      }
    }
  }, [lastMessage?.data])

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

  function deleteRoomWS (room) {
    const message = {
      action: WSActions.DeleteRoomAction,
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

  function deleteNote (note) {
    const message = {
      action: WSActions.DeleteNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  return { lastReceivedNote, lastEditedNote, lastDeletedNote, lastEditedRoom, lastDeletedRoom, joinRoom, editRoom, deleteRoomWS, sendNote, editNote, deleteNote }
}
