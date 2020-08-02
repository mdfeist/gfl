export interface JWT {
    key:        string;
}

export interface Developer {
    key:        string;
}

export interface Server {
    url:        string;
    port:       number;
    version:    string;
}

export interface MongoDB {
    url:        string;
}


export interface Config {
    mongo_db: MongoDB;
    jwt: JWT;
    developer: Developer;
    server: Server;
}
