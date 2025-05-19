
export const DispatchMethod = {
    ETA_ONLY: 'ETA_ONLY' , 
    SCORED: 'SCORED' 
}
export type DispatchMethod = typeof DispatchMethod[keyof typeof DispatchMethod];