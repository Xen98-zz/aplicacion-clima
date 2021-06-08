require('dotenv').config({path: './tokens.env'});
const { inquirerMenu, pausa, leerInput, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {

    const busquedas = new Busquedas();
    let opcion;

    do {
        opcion = await inquirerMenu();

        switch( opcion ) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput( 'Ciudad: ' );
                
                // Buscar los lugar
                const lugares = await busquedas.ciudad( termino );
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if (id === '0') continue;

                const lugarSeleccionado = lugares.find( lugar => lugar.id === id );
                
                // Guardar en DB
                busquedas.agregarHistorial( lugarSeleccionado.nombre );
                
                // Clima
                const clima = await busquedas.climaLugar( lugarSeleccionado.lat, lugarSeleccionado.lng );

                // Mostrar resultados
                console.clear();
                console.log( '\nInformacion de la ciudad\n'.cyan );
                console.log( 'Ciudad: ', lugarSeleccionado.nombre);
                console.log( 'Lat: ', lugarSeleccionado.lat);
                console.log( 'Lng: ', lugarSeleccionado.lng);
                console.log( 'Temperatura: ', clima.temp);
                console.log( 'Minima: ', clima.min);
                console.log( 'Máxima: ', clima.max);
                console.log( 'Descripción: ', clima.desc);
            break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                // busquedas.historial.forEach( (lugar, i) => {
                    const idx = `${i + 1}.`.cyan;
                    console.log(`${ idx } ${ lugar }`);
                });

                busquedas.leerDB();

            break

        }

        if (opcion !== 0)
            await pausa();
    } while ( opcion !== 0 );
}

main();