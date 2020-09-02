import { Injectable } from '@angular/core';
import { Articulo } from '../models/Articulo';
import { Descuento } from '../models/Descuento';
import { Resumen } from '../models/Resumen';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  public agregarArticulo(articulo: Articulo, listaArticulos: Articulo[]): boolean {
    if (articulo != null && articulo.precio > 0 && listaArticulos != null) {
      let nombre = articulo.nombre ?? "Varios";
      let cantidad = articulo.cantidad ? articulo.cantidad : 1;
      let precio = articulo.precio * cantidad; 

      let nuevoArticulo: Articulo = {
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        cambio: articulo.cambio,
        tipo: articulo.tipo
      };

      listaArticulos.push(nuevoArticulo);

      return true;
    }

    return false;
  }

  public agregarDescuento(descuento: Descuento, resumen: Resumen): boolean {
    if (descuento != null && descuento.value > 0 && resumen != null && resumen.descuentos != null) {
      if (resumen.getPrecioFinal() - descuento.value >= 0) {
        let elemento: Descuento = {
          value: descuento.value,
          tipo: descuento.tipo
        }
        resumen.descuentos.push(elemento)
      }

      return true;
    }

    return false;
  }

  public eliminarUno(array: any[], element: any) {
    let index = array.indexOf(element);
    array.splice(index, 1);
  }
}
