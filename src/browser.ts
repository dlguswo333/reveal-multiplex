import {type RevealState} from 'reveal.js';
import {MASTER_TOKEN_KEY, MASTER_TOKEN_PATH, Message, MessageType, packageName} from './common.js';

export interface MasterSocket {
  pushState: (message: string | object | number) => void;
}

export interface ClientSocket {
  subscribeState: (cb: (state: RevealState) => unknown) => void;
}

const wsUrl = new URL('/ws', location.origin);
wsUrl.protocol = 'ws';
wsUrl.pathname = '/ws';

/**
 * Return if this browser is a master.
 */
export const getIsMaster = (): boolean => {
  // Blindly check if the key in local stroage exists.
  // There will be no meaning to query the server if the browser is actually a master.
  // This package is for the simplicity anyway.
  const isMaster = !!window.localStorage.getItem(MASTER_TOKEN_KEY);
  return isMaster;
};

const createMasterSocket = (): MasterSocket => {
  const socket = new WebSocket(wsUrl);

  socket.onerror = (err) => {
    console.error(err);
  };


  return {
    pushState: (value) => {
      try {
        const message: Message = {
          type: MessageType.state,
          message: value,
          masterToken: localStorage.getItem(MASTER_TOKEN_KEY) as string,
        };
        socket.send(JSON.stringify(message));
      } catch (e) {
        console.error(packageName + 'Unexpected error occurred while outbound message');
        console.error(e);
      }
    },
  };
};

const createClientSocket = (): ClientSocket => {
  const socket = new WebSocket(wsUrl);

  socket.onerror = (err) => {
    console.error(err);
  };

  return {
    subscribeState: (callback) => {
      socket.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === MessageType.state) {
            const message = data.message;
            callback(message.state);
          }
        } catch (e) {
          console.error(packageName + 'Unexpected error occurred while handling inbound message');
          console.error(e);
        }
      };
    },
  };
};

export const setupMaster = (reveal: Reveal.Api) => {

  const socket = createMasterSocket();

  const post = () => {
    const message = {
      state: reveal.getState(),
    };
    socket.pushState(message);
  };

  reveal.on('slidechanged', post);
  reveal.on('fragmentshown', post);
  reveal.on('fragmenthidden', post);
  reveal.on('overviewhidden', post);
  reveal.on('overviewshown', post);
  reveal.on('paused', post);
  reveal.on('resumed', post);
};

export const setupClient = (reveal: Reveal.Api) => {
  const socket = createClientSocket();

  const callback = (state: RevealState) => {
    console.log('callback');
    reveal.setState(state);
  };

  socket.subscribeState(callback);
};


export const setupMasterToken = async () => {
  const searchParams = new URL(window.location.href, window.location.origin).searchParams;
  const moveToRoot = () => window.location.href = '/';
  if (!searchParams.get('secret')) {
    // The param must exist even if the secret is an empty string.
    return;
  }

  const url = new URL(MASTER_TOKEN_PATH, window.location.origin);
  url.search = searchParams.toString();
  const fetchResult = await fetch(url);
  if (!(fetchResult.ok && fetchResult.status.toString().startsWith('2'))) {
    moveToRoot();
    return;
  }

  const response = await fetchResult.json();
  localStorage.setItem(MASTER_TOKEN_KEY, response.token);
  moveToRoot();
  return;
};
