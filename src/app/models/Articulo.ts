export class Articulo {
    nombre: string;
    cantidad: number;
    precio: number;
    cambio: boolean;
    tipo: string;

    constructor(cambio: boolean = false) {
        this.cambio = cambio;
    }
}