import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify!' };
});

const start = async () => {
  try {
    await fastify.listen({port: 3000, host: process.env.HOST });
    console.log('Server started at http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
