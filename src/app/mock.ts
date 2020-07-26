export let mockRepository = {
    articulos: [
        {
            id: 1,
            nombre: "Un articulo con descripcion moderada",
            cantidad: 100,
            precio: 12345
        },
        {
            id: 2,
            nombre: "Un articulo con una descripcion extremadamente larga, especifica, detallada y supercalifragilisticoespialidosa",
            cantidad: 10,
            precio: 10.00
        },
        {
            id: 3,
            nombre: "Un articulo simple",
            cantidad: 1,
            precio: 198.99
        }
    ],
    descuentos: [
        {
            key: 1,
            value: 30.01
        }
    ],
    zonasDeEntrega: [
        'Cid Campeador',
        'Torino'
    ]
}