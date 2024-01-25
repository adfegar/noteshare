import { type Note } from './note'

export interface Message {
  action: string
  message: Note | Room
}
