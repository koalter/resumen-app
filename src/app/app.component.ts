import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Articulo } from './Articulo';
import { Descuento } from './Descuento';
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

  private articulosId: number;
  private descuentosId: number;
  
  get CONSTANTS() { return CONSTANTS }
  get precioFinal() { return this.subtotal - this.totalDescuento }
  get zonasDeEntrega() { return !(environment.production) ? mockRepository.zonasDeEntrega.slice() : []}
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
          value: descuento
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
    console.log(this.entrega);
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
      { text: this.zonasDeEntrega[this.entrega], alignment: 'right', colSpan: 2, margin: [24, 20, 0, 0] }
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
