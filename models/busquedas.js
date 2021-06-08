const fs = require( 'fs' );
const axios = require( 'axios' );

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        // Capitalizar Camel Case
        return  this.historial.map( registro => {
            // Dividir cada registro en un arreglo de palabras
            let palabras = registro.split(' ');

            // Capitalizar la primera letra de cada palabra
            const palabrasCapitalizadas = palabras.map( palabra => {
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            } );

            let registroFormateado = "";
        
            // Unir el arreglo de palabras en un string
            palabrasCapitalizadas.forEach( palabraCap => {
                registroFormateado = registroFormateado + palabraCap + " ";
            });

            // Mapear el string de registro por el registro capitalizado
            return registroFormateado;
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad( lugar = '' ) {
        
        try {
            // peticion http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await intance.get();
    
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch ( error ) {
            return [];
        }
    }

    async climaLugar( lat, lon ) {

        try {
            // peticion http
            const intance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            });

            const resp = await intance.get();

            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch ( error ) {
            console.log( error );
        }
    }

    agregarHistorial( lugar = '' ) {
        
        if ( this.historial.includes( lugar.toLowerCase() ) ) {
            return;
        }

        this.historial.unshift( lugar.toLowerCase() );

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
           historial: this.historial 
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    }

    leerDB() {

        if( !fs.existsSync( this.dbPath ) ) {
            return null;
        }

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const historial = JSON.parse( info );

        this.historial = historial.historial;
    }
}

module.exports = Busquedas;