import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Articulo } from './Articulo';
import { Descuento, TipoDescuento } from './Descuento';
import { mockRepository } from './mock';
import { CONSTANTS } from './Constants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'resumen-app';
  articulos: Articulo[] = !(environment.production) ? mockRepository.articulos.slice() : [];
  listaDescuentos: Descuento[] = !(environment.production) ? mockRepository.descuentos.slice() : [];
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

  private articulosId: number;
  private descuentosId: number;
  
  get TipoDescuento() { return TipoDescuento }
  get CONSTANTS() { return CONSTANTS }
  get precioFinal() { return this.subtotal - this.totalDescuento }
  get zonasDeEntrega() { return mockRepository.zonasDeEntrega.slice() }
  get totalDescuento() { 
    let sum = 0;
    this.listaDescuentos.forEach(d => sum += d.value);
    return sum;
  }

  ngOnInit() {
    this.refresh();
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.articulosId = this.articulos.length;
    this.descuentosId = this.listaDescuentos.length;
    console.log(TipoDescuento['Combo']);
  }

  add() {
    if (this.precio) {
      let nombre = this.nombre ?? "Varios";
      let cantidad = this.cantidad ? parseInt(this.cantidad) : 1;
      let precio = parseFloat(this.precio) * cantidad; 

      let nuevoArticulo: Articulo = {
        id: this.articulosId,
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        cambio: this.cambio,
        tipo: this.tipo
      };

      this.articulos.push(nuevoArticulo);
      this.nombre = undefined;
      this.cantidad = undefined;
      this.precio = undefined;
      this.refresh();

      this.articulosId++;
    }
  }

  addDescuento() {
    if (this.descuento) {
      let descuento: number = parseFloat(this.descuento);

      if (this.precioFinal - descuento >= 0) {
        
        let element: Descuento = {
          key: this.descuentosId,
          value: descuento,
          tipo: TipoDescuento[this.tipoDescuento]
        }
        this.listaDescuentos.push(element)
        this.descuento = undefined;
  
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

    this.articulos.forEach(a => {
      this.subtotal += a.precio;
      this.totalCantidad += a.cantidad;
    });
  }

  generarBoleta_click() {
    if (this.precioFinal > 0) {
      this.exportar();
    } else {
      alert(`No es posible generar una boleta por valor ${this.precioFinal}`);
    }
  }

  private async exportar() {
    const documentDefinition = {
      background: {
        image: this.generarFondo(),
        opacity: 0.5
      },
      content: [
        { text: CONSTANTS[0], fontSize: 18, bold: true, margin: [0, 0, 0, -5] },
        {
          table: {
            widths: [200, 80, 80, 80],
            headerRows: 1,
            body: this.buildTableBody()
          },
          layout: 'noBorders'
        },
        { text: '¡Muchas gracias por su compra!', fontSize: 18, bold: true, margin: [0, 26, 0, 0] }
      ],
      defaultStyle: {
        fontSize: 14
      }
    };
    
    const pdf = pdfMake.createPdf(documentDefinition);
    pdf.open();
    if (environment.production) {
      pdf.download();
    }
  }

  private buildTableBody(): object[] {
    let table: object[] = [];
    let thead = [
      {}, 
      { text: CONSTANTS[11], alignment: 'right', bold: true },
      { text: CONSTANTS[1], alignment: 'right', bold: true }, 
      { text: CONSTANTS[2], alignment: 'right', bold: true }
    ];
    let subtotal: object[] = [];
    
    table.push(thead);

    this.articulos.forEach(art => {
      let nombre: string = art.nombre;
      if (!art.cambio) {
        nombre = nombre + "\n" + "*SIN CAMBIO*"
      }

      table.push([
        { text: nombre, margin: [0, 10, 0, 10] }, 
        { text: art.tipo, alignment: 'right', margin: [0, 10, 0, 10] }, 
        { text: art.cantidad+'u.', alignment: 'right', margin: [0, 10, 0, 10] }, 
        { text: '$ '+art.precio, alignment: 'right', margin: [0, 10, 0, 10] }
      ]);
    });

    table.push([{ text: '', colSpan: 4, margin: [0, 0, 0, 24] }]);

    // subtotal
    if (this.totalCantidad > 0 && this.subtotal > 0) {
      subtotal = [
        { text: CONSTANTS[3], alignment: 'right', margin: [0, 2, 0, 8], bold: true }, 
        {},
        { text: this.totalCantidad.toString()+'u.', alignment: 'right', margin: [0, 2, 0, 8] }, 
        { text: '$ '+this.subtotal.toString(), alignment: 'right', margin: [0, 2, 0, 8] }
      ];
      table.push(subtotal);
    }

    // descuentos
    if (this.listaDescuentos.length > 0) {
      table.push([{ text: CONSTANTS[4], alignment: 'right', italics: true }, {}, {}, {}]);
      this.listaDescuentos.forEach(des => {
        table.push([
          {}, 
          { text: TipoDescuento[des.tipo], colspan: 3, alignment: 'right', color: 'green' }, 
          {},
          { text: (des.value*(-1)).toString(), alignment: 'right', color: 'green' }]);
      });
    }

    // total
    table.push([
      { text: CONSTANTS[5], alignment: 'right', bold: true, margin: [0, 8, 0, 0] }, 
      { text: '$ '+this.precioFinal.toFixed(2), colSpan: 3, alignment: 'right', bold: true, margin: [0, 8, 0, 0] }
    ]);

    // punto de entrega
    let puntoDeEntrega = this.entrega != -1 ? this.zonasDeEntrega[this.entrega] : this.otro;
    if (puntoDeEntrega) {
      table.push([
        { text: CONSTANTS[6], margin: [0, 20, 0, 0], alignment: 'right' }, 
        { text: puntoDeEntrega, colSpan: 3, margin: [24, 20, 0, 0] }
      ]);
    }

    // cliente
    if (this.cliente) {
      table.push([
        { text: CONSTANTS[7], margin: [0, 18, 0, 0], alignment: 'right' }, 
        { text: this.cliente, colSpan: 3, margin: [24, 18, 0, 0] }
      ]);
    }

    return table;
  }

  private generarFondo() {
    let canvas = document.createElement('canvas');
    let height: number = 860;
    let width: number = 600;
    let size: number = 15;

    canvas.height = height;
    canvas.width = width;
    
    let context = canvas.getContext('2d');

    for (let y = 0;y <= height;y += size) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    for (let x = 0;x <= width;x += size) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }

    context.strokeStyle = "cyan";
    context.lineWidth = 0.5;
    context.stroke();

    return canvas.toDataURL('image/jpg');
  }
}
