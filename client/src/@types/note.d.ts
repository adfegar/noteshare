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

// DB Note model
export interface DBNote {
  id: number
  content: string
  color: string
  user_id: number
  room_id: number
  created_at: string
  edited_at: string
}

// Client's note object
export interface Note {
  id: number
  content: string
  color: string
  creator: string
  created_at: Date
  edited_at: Date
}
