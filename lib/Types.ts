export interface Tasks {
    id : number,
    title : string,
    min_freq_per_week : number,
    status : boolean,
    curr_freq? : number
}