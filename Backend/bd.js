



CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS canales (
    id SERIAL PRIMARY KEY,
    sala_id UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    user_id SERIAL PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    sala_id UUID NOT NULL,
    user_id INTEGER NOT NULL,
    mensaje TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES canales(sala_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(user_id)
);

CREATE TABLE IF NOT EXISTS miembros_sala (
    id SERIAL PRIMARY KEY,
    sala_id UUID NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (sala_id) REFERENCES canales(sala_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(user_id)
);
