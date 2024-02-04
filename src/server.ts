import {Config, MASTER_TOKEN_PATH, Message, MessageType, Nullable, mergeConfigs, packageName} from './common';
import crypto from 'node:crypto';
import Fastify, {FastifyReply, FastifyRequest} from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWS from '@fastify/websocket';
import path from 'node:path';


const defaultConfig: Config = {
  secret: undefined,
  host: '0.0.0.0',
  port: 80,
  staticDir: './public',
};
const tokenLength = 32;
let masterToken = '';

const setMasterToken = (request: FastifyRequest, reply: FastifyReply, secret: Nullable<string>) => {
  const secretInRequest = (request.query as { secret: string }).secret;
  const isValidSecret = !secret || secretInRequest === secret;
  if (!isValidSecret) {
    reply.redirect('/');
    return;
  }

  masterToken = crypto.randomBytes(tokenLength).toString('base64url');
  reply.send({token: masterToken});
};

export const setupServer = async (config: Config) => {
  const {secret, host, port, staticDir} = mergeConfigs(defaultConfig, config) as {[P in keyof Config]: NonNullable<Config[P]>};

  const fastify = Fastify({
    logger: false
  });


  // Serve static files.
  fastify.register(fastifyStatic, {
    root: path.resolve(staticDir),
    prefix: '/',
  });

  // Serve websocket server.
  // Need to await registering before listening to the route.
  await fastify.register(fastifyWS);
  fastify.get('/ws', {websocket: true}, (connection) => {

    // bound to fastify server
    connection.socket.on('open', () => {
      console.log('ws connection');
    });
    connection.socket.on('message', rawData => {
      try {
        const message = JSON.parse(rawData.toString('utf-8'));
        if (!(message.masterToken === masterToken)) {
          return;
        }
        console.log('Message from Master detected: ', message.message);
        fastify.websocketServer.clients.forEach((socket) => {
          const outboundMessage: Message = {type: MessageType.state, message: message.message};
          socket.send(JSON.stringify(outboundMessage));
        });
      } catch {
        console.error(packageName + ' Unparsable packets from a socket.');
        connection.socket.close();
      }
    });
  });

  // Set up master token.
  fastify.get(MASTER_TOKEN_PATH, (request, reply) => {
    setMasterToken(request, reply, secret);
    return;
  });

  fastify.listen({host, port}, (err) => {
    if (err) {
      console.error(packageName + 'Unexpected error while listening on address.');
      console.error(err);
      process.exit(1);
    }
  });
};
