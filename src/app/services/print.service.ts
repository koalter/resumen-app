import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import { CONSTANTS } from '../models/Constants';
import { Resumen } from '../models/Resumen';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  public exportar(resumen: Resumen): any {
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
            body: this.buildTableBody(resumen)
          },
          layout: 'noBorders'
        },
        { text: '¡Muchas gracias por su compra!', fontSize: 18, bold: true, margin: [0, 26, 0, 0] }
      ],
      defaultStyle: {
        fontSize: 14
      }
    };
    
    return pdfMake.createPdf(documentDefinition);
  }

  private buildTableBody(resumen: Resumen): object[] {
    let table: object[] = [];
    let thead = [
      {}, 
      { text: CONSTANTS[8], alignment: 'right', bold: true },
      { text: CONSTANTS[1], alignment: 'right', bold: true }, 
      { text: CONSTANTS[2], alignment: 'right', bold: true }
    ];
    let rowSubtotal: object[] = [];
    
    table.push(thead);

    resumen.articulos.forEach(art => {
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
    let cantidadTotal = resumen.getCantidadTotal();
    let subtotal = resumen.getSubtotal();
    if (cantidadTotal > 0 && subtotal > 0) {
      rowSubtotal = [
        { text: CONSTANTS[3], alignment: 'right', margin: [0, 2, 0, 8], bold: true }, 
        {},
        { text: cantidadTotal.toString()+'u.', alignment: 'right', margin: [0, 2, 0, 8] }, 
        { text: '$ '+ subtotal.toString(), alignment: 'right', margin: [0, 2, 0, 8] }
      ];
      table.push(rowSubtotal);
    }

    // descuentos
    if (resumen.descuentos.length > 0) {
      table.push([{ text: CONSTANTS[4], alignment: 'right', italics: true }, {}, {}, {}]);
      resumen.descuentos.forEach(des => {
        table.push([
          {}, 
          { text: des.tipo, colspan: 3, alignment: 'right', color: 'green' }, 
          {},
          { text: (des.value*(-1)).toString(), alignment: 'right', color: 'green' }]);
      });
    }

    // total
    let precioFinal = resumen.getPrecioFinal();
    table.push([
      { text: CONSTANTS[5], alignment: 'right', bold: true, margin: [0, 8, 0, 0] }, 
      { text: '$ '+ precioFinal.toFixed(2), colSpan: 3, alignment: 'right', bold: true, margin: [0, 8, 0, 0] }
    ]);

    // punto de entrega
    if (resumen.entrega) {
      table.push([
        { text: CONSTANTS[6], margin: [0, 20, 0, 0], alignment: 'right' }, 
        { text: resumen.entrega, colSpan: 3, margin: [24, 20, 0, 0] }
      ]);
    }

    // cliente
    if (resumen.cliente) {
      table.push([
        { text: CONSTANTS[7], margin: [0, 18, 0, 0], alignment: 'right' }, 
        { text: resumen.cliente, colSpan: 3, margin: [24, 18, 0, 0] }
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
