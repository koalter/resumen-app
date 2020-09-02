import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { environment } from 'src/environments/environment';
import { AppService } from './services/app.service';
import { PrintService } from './services/print.service';
import { mockRepository } from './mock';
import { CONSTANTS } from './models/Constants';
import { Articulo } from './models/Articulo';
import { Resumen } from './models/Resumen';
import { Descuento, TipoDescuento } from './models/Descuento';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'resumen-app';
  totalCantidad: number;
  subtotal: number;
  entrega = NaN;
  otro: string;

  articuloActual: Articulo;
  descuentoActual: Descuento;
  resumen: Resumen;
  
  get TipoDescuento() { return TipoDescuento }
  get CONSTANTS() { return CONSTANTS }
  get zonasDeEntrega() { return mockRepository.zonasDeEntrega.slice() }

  constructor(
    private printService: PrintService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.resumen = new Resumen(
      !(environment.production) ? mockRepository.articulos.slice() : [],
      !(environment.production) ? mockRepository.descuentos.slice() : []
    );
    this.articuloActual = new Articulo();
    this.descuentoActual = new Descuento();

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  btnAgregarArticulo_click() {
    if (this.appService.agregarArticulo(this.articuloActual, this.resumen.articulos)) {
      this.articuloActual = new Articulo(this.articuloActual.cambio);
    }
  }

  btnAgregarDescuento_click() {
    if (this.appService.agregarDescuento(this.descuentoActual, this.resumen))
      this.descuentoActual = new Descuento();
  }

  btnEliminar_click(array: any[], elemento: any) {
    this.appService.eliminarUno(array, elemento);
  }
  
  btnGenerarBoleta_click() {
    let precioFinal = this.resumen.getPrecioFinal();
    if (precioFinal > 0) {
      this.resumen.entrega = this.entrega >= 0 ? this.zonasDeEntrega[this.entrega] : this.otro;
      let pdf = this.printService.exportar(this.resumen); 
      pdf.open();
      if (environment.production) {
        pdf.download();
      }
    } else {
      alert(`No es posible generar una boleta por valor ${precioFinal}`);
    }
  }
}
