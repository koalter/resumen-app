import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Articulo } from './Articulo';
import { mock_articulos } from './mock';
import { CONSTANTS } from './Constants';

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
  entrega = NaN;
  
  get CONSTANTS() { return CONSTANTS }

  ngOnInit() {
    this.sumar();
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    console.log(pdfMake);
  }

  add() {
    if (this.cantidad && this.precio) {
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

  async exportar() {
    console.log(this.entrega);
    const documentDefinition = {
      background: {
        image: await this.getBase64ImageFromURL('../assets/fondo.jpg'),
        width: 368
      },
      content: [
        { text: CONSTANTS[0], fontSize: 18, bold: true },
        {
          table: {
            headerRows: 1,
            body: this.buildTableBody()
          },
          layout: 'noBorders'
        }
      ]
    };
    pdfMake.createPdf(documentDefinition).open();
    // pdfMake.createPdf(documentDefinition).download('helloworld.pdf');
  }

  private buildTableBody(): object[] {
    let table: object[] = [];
    let thead = [
      { text: '' }, 
      { text: CONSTANTS[1], alignment: 'right', bold: true }, 
      { text: CONSTANTS[2], alignment: 'right', bold: true }
    ];
    let subtotal: object[] = [];
    
    table.push(thead);

    this.articulos.forEach(art => {
      table.push([
        { text: art.nombre }, 
        { text: art.cantidad+'u.', alignment: 'right' }, 
        { text: '$ '+art.precio, alignment: 'right' }
      ]);
    });

    table.push([{ text: '', colSpan: 3, margin: [0, 0, 0, 16] }]);

    if (this.totalCantidad > 0 && this.subtotal > 0) {
      subtotal = [
        { text: CONSTANTS[3], alignment: 'right' }, 
        { text: this.totalCantidad.toString()+'u.', alignment: 'right' }, 
        { text: '$ '+this.subtotal.toString(), alignment: 'right' }
      ];
      table.push(subtotal);
    }

    table.push([{ text: CONSTANTS[4], alignment: 'right' }, {}, {}]);
    
    this.listaDescuentos.forEach(des => {
      table.push([{ text: des.toString(), colSpan: 3, alignment: 'right' }, {}, {}]);
    });

    table.push([
      { text: CONSTANTS[5], alignment: 'right', bold: true }, 
      { text: '$ '+this.precioFinal.toString(), colSpan: 2, alignment: 'right', bold: true }
    ]);

    table.push([
      { text: CONSTANTS[6], margin: [0, 24, 0, 0], alignment: 'right' }, 
      { text: CONSTANTS[this.entrega], alignment: 'right', colSpan: 2, margin: [24, 24, 0, 0] }
    ]);
    return table;
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }
}
