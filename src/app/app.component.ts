import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Articulo } from './Articulo';
import { Descuento } from './Descuento';
import { CONSTANTS } from './Constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'resumen-app';
  articulos: Articulo[] = [];
  nombre: string;
  cantidad: string;
  precio: string;
  totalCantidad: number;
  subtotal: number;
  descuento: string;
  totalDescuento: number = 0;
  listaDescuentos: Descuento[] = [];
  precioFinal: number;
  entrega = NaN;
  cliente: string;

  private articulosId: number;
  private descuentosId: number;
  
  get CONSTANTS() { return CONSTANTS }

  ngOnInit() {
    this.sumar();
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.articulosId = this.articulos.length;
    this.descuentosId = this.listaDescuentos.length;
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
        precio: precio
      };

      this.articulos.push(nuevoArticulo);
      this.nombre = undefined;
      this.cantidad = undefined;
      this.precio = undefined;
      this.sumar();

      this.articulosId++;
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
    if (this.descuento) {
      let descuento: number = parseFloat(this.descuento);

      if (this.precioFinal - descuento > 0) {
        this.totalDescuento += descuento;
        
        let element: Descuento = {
          key: this.descuentosId,
          value: descuento*(-1)
        }
        this.listaDescuentos.push(element)
        this.descuento = undefined;
    
        this.calcularTotal();
  
        this.descuentosId++;
      }
    }
  }

  private calcularTotal() {
    this.precioFinal = this.subtotal - this.totalDescuento;
  }

  delete(array: any[], element: any) {
    let index = array.indexOf(element);
    array.splice(index, 1);
    this.refresh();
  }

  refresh() {
    this.totalCantidad = 0;
    this.subtotal = 0;
    this.totalDescuento = 0;

    this.articulos.forEach(a => {
      this.subtotal += a.precio;
      this.totalCantidad += a.cantidad;
    });
    this.listaDescuentos.forEach(d => {
      this.totalDescuento += (d.value*(-1));
    });

    this.calcularTotal();
  }

  async exportar() {
    const documentDefinition = {
      background: {
        image: await this.getBase64ImageFromURL('../assets/fondo.jpg'),
        width: 448
      },
      content: [
        { text: CONSTANTS[0], fontSize: 18, bold: true, margin: [0, 0, 0, 14] },
        {
          table: {
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
    pdfMake.createPdf(documentDefinition).open({}, window);
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

    table.push([{ text: '', colSpan: 3, margin: [0, 0, 0, 24] }]);

    if (this.totalCantidad > 0 && this.subtotal > 0) {
      subtotal = [
        { text: CONSTANTS[3], alignment: 'right' }, 
        { text: this.totalCantidad.toString()+'u.', alignment: 'right' }, 
        { text: '$ '+this.subtotal.toString(), alignment: 'right' }
      ];
      table.push(subtotal);
    }

    if (this.listaDescuentos.length > 0) {
      table.push([{ text: CONSTANTS[4], alignment: 'right' }, {}, {}]);
      this.listaDescuentos.forEach(des => {
        table.push([{ text: des.value.toString(), colSpan: 3, alignment: 'right' }, {}, {}]);
      });
    }

    // total
    table.push([
      { text: CONSTANTS[5], alignment: 'right', bold: true }, 
      { text: '$ '+this.precioFinal.toString(), colSpan: 2, alignment: 'right', bold: true }
    ]);

    // punto de entrega
    table.push([
      { text: CONSTANTS[6], margin: [0, 20, 0, 0], alignment: 'right' }, 
      { text: CONSTANTS[this.entrega], alignment: 'right', colSpan: 2, margin: [24, 20, 0, 0] }
    ]);

    // cliente
    table.push([
      { text: CONSTANTS[9], margin: [0, 18, 0, 0], alignment: 'right' }, 
      { text: this.cliente, colSpan: 2, margin: [24, 18, 0, 0] }
    ]);

    return table;
  }

  private getBase64ImageFromURL(url) {
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
