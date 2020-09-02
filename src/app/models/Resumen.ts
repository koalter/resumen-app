import { Descuento } from './Descuento';
import { Articulo } from './Articulo';

export class Resumen {
    articulos: Articulo[];
    descuentos: Descuento[];
    entrega: string;
    cliente: string;

    constructor(articulos: Articulo[], descuentos: Descuento[]) {
        this.articulos = articulos != null ? articulos : new Array<Articulo>();
        this.descuentos = descuentos != null ? descuentos: new Array<Descuento>();
    }

    /**
     * Devuelve la cantidad total de articulos
     */
    public getCantidadTotal(): number {
        let cantidadTotal: number = 0;
        this.articulos.forEach(articulo => cantidadTotal += articulo.cantidad);
        return cantidadTotal;
    }

    /**
     * Devuelve el valor total de todos los articulos
     */
    public getSubtotal(): number {
        let subtotal: number = 0;
        this.articulos.forEach(articulo => subtotal += articulo.precio);
        return subtotal;
    }

    /**
     * Devuelve de valor total de los descuentos que se aplican
     */
    public getTotalDescuentos() {
        let totalDescuentos: number = 0;
        this.descuentos.forEach(descuento => totalDescuentos += descuento.value);
        return totalDescuentos;
    }

    /**
     * Devuelve el valor total de todos los articulos, incluyendo los descuentos
     */
    public getPrecioFinal() {
        let subtotal: number = this.getSubtotal();
        let totalDescuentos: number = this.getTotalDescuentos();
        return subtotal - totalDescuentos;
    }
}