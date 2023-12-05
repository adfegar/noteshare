import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { WS_PREFIX } from '../consts'
import Cookies from 'js-cookie'
import { type Room } from '../@types/room'
import { type Note } from '../@types/note'

const WSActions = {
  JoinRoomAction: 'join-room',
  SendNoteAction: 'send-note',
  EditNoteAction: 'edit-note',
  DeleteNoteAction: 'delete-note',
  EditRoomAction: 'edit-room',
  DeleteRoomAction: 'delete-room'
}

interface UseWSResponse {
  lastReceivedNote: Note | undefined
  lastEditedNote: Note | undefined
  lastDeletedNote: Note | undefined
  lastEditedRoom: Room | undefined
  lastDeletedRoom: Room | undefined
  joinRoom: (room: Room) => void
  editRoom: (room: Room) => void
  deleteRoomWS: (room: Room) => void
  sendNote: (note: Note) => void
  editNote: (note: Note) => void
  deleteNote: (note: Note) => void
}

export function useWS (): UseWSResponse {
  const [lastReceivedNote, setLastReceivedNote] = useState<Note>()
  const [lastEditedNote, setLastEditedNote] = useState<Note>()
  const [lastDeletedNote, setLastDeletedNote] = useState<Note>()
  const [lastEditedRoom, setLastEditedRoom] = useState<Room>()
  const [lastDeletedRoom, setLastDeletedRoom] = useState<Room>()
  const { sendJsonMessage, lastMessage } = useWebSocket(
    WS_PREFIX,
    {
      share: true,
      shouldReconnect: () => false,
      onOpen: () => {
        console.log('connected to WS')

        const initMessage = {
          action: 'init-client',
          message: {
            access_token: Cookies.get('access_token'),
            userId: Number(Cookies.get('user_id'))
          }
        }
        sendJsonMessage(initMessage)
      },
      onClose: () => { console.log('Disconnected from WS') }
    }
  )
  // every time a note is sent, append it to receivedNotes array
  useEffect((): void => {
    if (lastMessage !== null) {
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
  function joinRoom (room: Room): void {
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

  function editRoom (room: Room): void {
    const message = {
      action: WSActions.EditRoomAction,
      message: room
    }
    sendJsonMessage(message)
  }

  function deleteRoomWS (room: Room): void {
    const message = {
      action: WSActions.DeleteRoomAction,
      message: room
    }
    sendJsonMessage(message)
  }

  function sendNote (note: Note): void {
    const message = {
      action: WSActions.SendNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  function editNote (note: Note): void {
    const message = {
      action: WSActions.EditNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  function deleteNote (note: Note): void {
    const message = {
      action: WSActions.DeleteNoteAction,
      message: note
    }
    sendJsonMessage(message)
  }

  return { lastReceivedNote, lastEditedNote, lastDeletedNote, lastEditedRoom, lastDeletedRoom, joinRoom, editRoom, deleteRoomWS, sendNote, editNote, deleteNote }
}
