import { HavaGun } from "./HavaGunClass";

export class HavaDurumu {

    il_name: string
    son_guncelleme: string
    ruzgar: string
    ruzgar_yonu: string
    nem_orani: string
    gorus_mesafesi: string
    basinc: string
    gunlerList: Array<HavaGun>

    constructor(il_name: string, son_guncelleme: string, ruzgar: string, ruzgar_yonu: string, nem_orani: string, gorus_mesafesi: string, basinc: string, gunlerList: Array<HavaGun>) {
        this.il_name = il_name
        this.son_guncelleme = son_guncelleme
        this.ruzgar = ruzgar
        this.ruzgar_yonu = ruzgar_yonu
        this.nem_orani = nem_orani
        this.gorus_mesafesi = gorus_mesafesi
        this.basinc = basinc
        this.gunlerList = gunlerList
    }
}

