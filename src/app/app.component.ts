import { Component } from '@angular/core';

import { Articulo } from './Articulo';
import { mock_articulos } from './mock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'resumen-app';
  articulos: Articulo[] = mock_articulos.slice();
  nombre: string;
  cantidad: string;
  precio: string;
  totalCantidad: number;
  subtotal: number;
  descuento: string;
  totalDescuento: number = 0;
  listaDescuentos: number[] = [];
  precioFinal: number;
  entrega = 0;

  ngOnInit() {
    this.sumar();
  }

  add() {
    let nuevoArticulo: Articulo = {
      id: this.articulos.length - 1,
      nombre: this.nombre ?? "Varios",
      cantidad: parseInt(this.cantidad),
      precio: parseFloat(this.precio)
    };
    console.log(nuevoArticulo);
    this.articulos.push(nuevoArticulo);
    this.nombre = '';
    this.cantidad = '';
    this.precio = '';
    this.sumar();
  }

  private sumar() {
    let totalCantidad: number = 0;
    let subtotal: number = 0;

    this.articulos.forEach(art => {
      totalCantidad += art.cantidad;
      subtotal += art.precio;
    });

    this.totalCantidad = totalCantidad;
    this.subtotal = subtotal;
    
    this.calcularTotal();
  }

  addDescuento() {
    let descuento: number = parseFloat(this.descuento);
    this.totalDescuento += descuento;
    this.listaDescuentos.push(descuento*(-1))
    this.descuento = '';

    this.calcularTotal();
  }

  private calcularTotal() {
    this.precioFinal = this.subtotal - this.totalDescuento;
  }

  public exportar() {
    console.log(this.entrega);
  }
}
