export interface AddRoomRequest {
    name:string
    creator:number
}

export interface Room {
    id: number
    name: string
    invite: string
    creator: number
}
