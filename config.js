'use strict'

const config = {
    MONGO_URL: process.env.GARKBIT_MONGO_URL ? process.env.GARKBIT_MONGO_URL : 'mongodb://localhost:27017/garkbit',
    GARKBIT_URL: process.env.GARKBIT_URL ? process.env.GARKBIT_URL : 'http://127.0.0.1:3000',
    API_URL: process.env.GARKBIT_API_URL ? process.env.GARKBIT_API_URL : 'http://127.0.0.1:3000/api',
    COMBINE_GALLERIES: process.env.GARKBIT_COMBINE_GALLERIES ? process.env.GARKBIT_COMBINE_GALLERIES : true,
    JWT_SECRET: 'THIS IS THE LEAST SECRET CODE EVER',
}

export default config;
