import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PrintService } from './print.service';
import { Articulo } from './Articulo';
import { Descuento, TipoDescuento } from './Descuento';
import { mockRepository } from './mock';
import { CONSTANTS } from './Constants';
import { environment } from 'src/environments/environment';
import { Resumen } from './models/Resumen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'resumen-app';
  nombre: string;
  cantidad: string;
  precio: string;
  totalCantidad: number;
  subtotal: number;
  descuento: string;
  cliente: string;
  entrega = NaN;
  otro: string;
  tipoDescuento: string;
  tipo: string;
  cambio: boolean = false;

  articuloActual: Articulo;
  descuentoActual: Descuento;
  resumen: Resumen;

  private articulosId: number;
  private descuentosId: number;
  
  get TipoDescuento() { return TipoDescuento }
  get CONSTANTS() { return CONSTANTS }
  get precioFinal() { return this.resumen.getPrecioFinal() }
  get zonasDeEntrega() { return mockRepository.zonasDeEntrega.slice() }
  get totalDescuento() { 
    return this.resumen.getTotalDescuentos();
  }

  constructor(private printService: PrintService) {}

  ngOnInit() {
    this.resumen = new Resumen(
      !(environment.production) ? mockRepository.articulos.slice() : [],
      !(environment.production) ? mockRepository.descuentos.slice() : []
    );
    this.articuloActual = new Articulo();
    this.descuentoActual = new Descuento();

    this.refresh();
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.articulosId = this.resumen.articulos.length;
    this.descuentosId = this.resumen.descuentos.length;
  }

  add() {
    if (this.articuloActual.precio > 0) {
      let nombre = this.articuloActual.nombre ?? "Varios";
      let cantidad = this.articuloActual.cantidad ? this.articuloActual.cantidad : 1;
      let precio = this.articuloActual.precio * cantidad; 

      let nuevoArticulo: Articulo = {
        id: this.articulosId,
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        cambio: this.cambio,
        tipo: this.tipo
      };

      this.resumen.articulos.push(nuevoArticulo);
      this.articuloActual = new Articulo();
      this.refresh();

      this.articulosId++;
    }
  }

  addDescuento() {
    if (this.descuentoActual.value > 0) {
      let descuento: number = this.descuentoActual.value;

      if (this.precioFinal - descuento >= 0) {
        
        let element: Descuento = {
          key: this.descuentosId,
          value: descuento,
          tipo: TipoDescuento[this.tipoDescuento]
        }
        this.resumen.descuentos.push(element)
        this.descuentoActual = new Descuento();
  
        this.descuentosId++;
      }
    }
  }

  delete(array: any[], element: any) {
    let index = array.indexOf(element);
    array.splice(index, 1);
    this.refresh();
  }

  refresh() {
    this.totalCantidad = 0;
    this.subtotal = 0;

    this.resumen.articulos.forEach(a => {
      this.subtotal += a.precio;
      this.totalCantidad += a.cantidad;
    });
  }

  generarBoleta_click() {
    if (this.precioFinal > 0) {
      this.printService.exportar(this.resumen).subscribe(pdf => {
        pdf.open();
        if (environment.production) {
          pdf.download();
        }
      });
    } else {
      alert(`No es posible generar una boleta por valor ${this.precioFinal}`);
    }
  }
}
