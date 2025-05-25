
export const DispatchStrategy = {
    ETA_ONLY: 'ETA_ONLY' , 
    SCORED: 'SCORED' 
}
export type DispatchStrategy = typeof DispatchStrategy[keyof typeof DispatchStrategy];