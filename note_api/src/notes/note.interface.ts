export interface NoteResponse {
    id: number,
    title: string,
    content: string
}


export interface ApiResponse<T>{
    success: boolean,
    data: T,
    error?: string    
}