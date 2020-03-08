export class HavaGun {

    date: string
    day: string
    aciklama: string
    gunduz: string
    gece: string

    constructor(date: string, day: string, aciklama: string, gunduz: string, gece: string) {
        this.date = date
        this.day = day
        this.aciklama = aciklama
        this.gunduz = gunduz
        this.gece = gece
    }
}