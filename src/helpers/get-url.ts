import config from 'config';

import {Server} from '../config/config';
const serverConfig = config.get<Server>('server');

export function getBase() {
    return `${serverConfig.url}:${serverConfig.port}`;
};

export function getFull() {
    return `${serverConfig.url}:${serverConfig.port}/v${serverConfig.version}/api`;
};

export function getRelative() {
    return `v${serverConfig.version}/api`;
};