# NSFW FastStack

### What does it stands for?

|  Letter | Technology|
|----|-----|
|  N | Node|
|  S | Svelte|
|  F | Fastify|
|  W | MongoDB

### Why W stands for MongoDB?
Because W fits here properly. W is basically M with left up in the air.

### Why Node?
You can use  PHP if you have issue with Node.

### Why Svelte?
It is faster than Vue and React. And one of the easiest.

### Why Fastify?
It is faster than Express.

### Why MongoDB?
It is good.


---------------
# Run

In root folder:
```
yarn dev
yarn start 
```

In _frontend folder:
```
yarn dev
yarn build
```

output of svelte is in public/build folder

# Routes

```
app/routes
```

http://localhost:3000/api/person/list

http://localhost:3000/api/person/list/id

http://localhost:3000/api/person/add/name/cnic

---------------

## Docs from Routes Folder

Prefix 'app' where routes is written.

Routes define routes within your application. Fastify provides an
easy path to a microservice architecture, in the future you might want
to independently deploy some of those.

In this folder you should define all the routes that define the endpoints
of your web application.
Each service is a [Fastify
plugin](https://www.fastify.io/docs/latest/Plugins/), it is
encapsulated (it can have its own independent plugins) and it is
typically stored in a file; be careful to group your routes logically,
e.g. all `/users` routes in a `users.js` file. We have added
a `root.js` file for you with a '/' root added.

If a single file become too large, create a folder and add a `index.js` file there:
this file must be a Fastify plugin, and it will be loaded automatically
by the application. You can now add as many files as you want inside that folder.
In this way you can create complex routes within a single monolith,
and eventually extract them.

If you need to share functionality between routes, place that
functionality into the `plugins` folder, and share it via
[decorators](https://www.fastify.io/docs/latest/Decorators/).

If you're a bit confused about using `async/await` to write routes, you would
better take a look at [Promise resolution](https://www.fastify.io/docs/latest/Routes/#promise-resolution) for more details.
