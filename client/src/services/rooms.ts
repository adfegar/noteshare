import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { instance } from './interceptors'
import { User } from '../@types/user'
import { AddRoomRequest, Room } from '../@types/room'
import { Note, DBNote } from '../@types/note'
import { APIError } from '../@types/api'

export async function addRoom(room: AddRoomRequest): Promise<Room> {
    const addRoomResult: { data: Room | APIError, status: Number }
        = await instance.post(`${API_PREFIX}/rooms`, room)

    if (addRoomResult.status !== 201) {
        const error = <APIError>addRoomResult.data
        throw new Error(error.error)
    }
    const addedRoom = <Room>addRoomResult.data
    return addedRoom
}

export async function updateRoom(roomId: number, newName: string): Promise<void> {
    const updateRoomResult = await instance.put(`${API_PREFIX}/rooms/${roomId}`, { name: newName })

    if (updateRoomResult.status !== 200) {
        const error = <APIError>updateRoomResult.data
        throw new Error(error.error)
    }
}

export async function deleteRoom(roomId: number): Promise<void> {
    const deleteRoomResult = await instance.delete(`${API_PREFIX}/rooms/${roomId}`)

    if (deleteRoomResult.status !== 200) {
        const error = <APIError>deleteRoomResult.data
        throw new Error(error.error)
    }
}

export async function addUserToRoom(roomId: number): Promise<void> {
    const addUserToRoomResult = await instance.post(`${API_PREFIX}/users/${Cookies.get('user_id')}/add-to-room`,
        { room_id: Number(roomId) })

    if (addUserToRoomResult.status !== 200) {
        const error = <APIError>addUserToRoomResult.data
        throw new Error(error.error)
    }
}

export async function getRoomByInviteCode(inviteCode: string): Promise<Room> {
    const roomResponse: { data: Room | APIError, status: Number }
        = await instance.get(`${API_PREFIX}/rooms/${inviteCode}`)

    if (roomResponse.status !== 200) {
        const error = <APIError>roomResponse.data
        throw new Error(error.error)
    }

    const rooms = <Room>roomResponse.data
    return rooms
}

export async function getUserRooms(userId: number): Promise<Room[]> {
    const roomsResponse: { data: Room[] | APIError, status: Number }
        = await instance.get(`${API_PREFIX}/users/${userId}/rooms`)

    if (roomsResponse.status !== 200) {
        const error = <APIError>roomsResponse.data
        throw new Error(error.error)
    }

    const rooms = <Room[]>roomsResponse.data
    return rooms
}

export async function getRoomUsers(roomId: number): Promise<User[]> {
    const usersResponse: { data: User[] | APIError, status: Number }
        = await instance.get(`${API_PREFIX}/rooms/${roomId}/users`)

    if (usersResponse.status !== 200) {
        const error = <APIError>usersResponse.data
        throw new Error(error.error)
    }

    const users = <User[]>usersResponse.data
    return users
}

export async function getRoomNotes(roomId: number): Promise<Note[]> {
    const roomNotesResult: { data: DBNote[] | APIError, status: Number }
        = await instance.get(`${API_PREFIX}/rooms/${roomId}/notes`)

    if (roomNotesResult.status !== 200) {
        const error = <APIError>roomNotesResult.data
        throw new Error(error.error)
    }

    const roomUsers = await getRoomUsers(roomId)
    const roomNotes = <DBNote[]>roomNotesResult.data
    const resultNotes: Note[] = []
    if (roomNotes != null) {
        roomNotes.forEach(roomNote => {
            const note: Note = {
                id: roomNote.id,
                content: roomNote.content,
                color: roomNote.color,
                creator: roomUsers.find(user => user.id === roomNote.user_id)!.username
            }
            resultNotes.push(note)
        })
        return resultNotes
    } else {
        return []
    }
}

