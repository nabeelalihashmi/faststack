'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const choopa_config = require('./config')


const fastify = require('fastify')({logger: true});

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  // prefix: '/public/', // optional: default '/'
})

fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'plugins'),
})

fastify.register(AutoLoad, {
  dir: path.join(__dirname, '/app/routes'),
})



// This is to use pen di siri mongoose

async function StartMongo() {
  const uri = choopa_config.MONGO_URI || null;
  if (uri != null) {
    const mongoose = require('mongoose');
    try {
      await mongoose.connect(uri)
      console.log('Mongodb Connected' )
    } catch (error) {
      console.log(error);
    }
  }
}

async function StartFastify() {
  try {
    const port = choopa_config.PORT || 3000
    await fastify.listen(port, () => {console.log('Server Started')})
  } catch (error) {
    console.log('error: ', error)
    process.exit(1)
  }
}


StartFastify();
StartMongo();


// module.exports = async function (fastify, opts) {

//   fastify.logger = true;


//   // Place here your custom code!
//   // This load fastify poly toly svelte
//   fastify.register(require('fastify-static'), {
//     root: path.join(__dirname, 'public'),
//     // prefix: '/public/', // optional: default '/'
//   })

//   // Do not touch the following lines

//   // This loads all plugins defined in plugins
//   // those should be support plugins that are reused
//   // through your application
//   fastify.register(AutoLoad, {
//     dir: path.join(__dirname, 'plugins'),
//     options: Object.assign({}, opts)
//   })

//   // This loads all plugins defined in routes
//   // define your routes in one of these
//   fastify.register(AutoLoad, {
//     dir: path.join(__dirname, '/app/routes'),
//     options: Object.assign({}, opts)
//   })



//   // This is to use pen di siri mongoose
//   const uri = process.env.MONGO_URI || null;
//   if (uri != null) {
//     const mongoose = require('mongoose');
//     try {
//       await mongoose.connect(uri)
//       console.log('mongodb connected')
//     } catch (error) {
//       console.log(error);
//     }
//   }

// }

