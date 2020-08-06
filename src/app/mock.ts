import { TipoDescuento } from './Descuento';

export let mockRepository = {
    articulos: [
        {
            id: 1,
            nombre: "Un articulo con descripcion moderada",
            cantidad: 100,
            precio: 12345,
            cambio: false,
            tipo: TipoDescuento[0]
        },
        {
            id: 2,
            nombre: "Un articulo con una descripcion extremadamente larga, especifica, detallada y supercalifragilisticoespialidosa",
            cantidad: 10,
            precio: 10.00,
            cambio: true,
            tipo: TipoDescuento[1]
        },
        {
            id: 3,
            nombre: "Un articulo simple",
            cantidad: 1,
            precio: 198.99,
            cambio: false,
            tipo: TipoDescuento[2]
        }
    ],
    descuentos: [
        {
            key: 1,
            value: 30.01,
            tipo: 1
        }
    ],
    zonasDeEntrega: [
        'Cid Campeador',
        'Torino'
    ]
}