import http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

let server = null;
let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null = null;
let socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null = null

export const initializeSocket = (app: Express.Application) => {
    server = http.createServer(app);
    io = new Server(server, {
        cors: {
            origin: "*",

        }
    })



    io.on('connection', (_socket) => {

        console.log("Socket Connected", _socket.id)
        socket = _socket

        _socket.on('join', (room: string) => {
            console.log(`${_socket.id} joined ${room}`)
            _socket.join(room)
        });

        _socket.on('leave', (room: string) => {
            console.log(`${_socket.id} leave room ${room}`)
            _socket.leave(room)
        });

        _socket.on('disconnect', () => {
            console.error('Socket Disconnected!!!', _socket.id);
        });
    })

    return {
        io, server
    }
}


export const getSocket = () => ({ io, socket })
