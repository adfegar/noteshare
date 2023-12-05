export interface AddNoteRequest {
  content: string
  color: string
  user_id: number
  room_id: number
}

export interface UpdateNoteRequest {
  content: string
  color: string
}

export interface DBNote {
  id: number
  content: string
  color: string
  user_id: number
  room_id: number
}

export interface Note {
  id: number
  content: string
  color: string
  creator: string
}
