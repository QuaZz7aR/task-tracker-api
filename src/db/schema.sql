CREATE
EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    created_at TIMESTAMP        DEFAULT NOW()
);

CREATE TABLE tasks
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      VARCHAR(255) NOT NULL,
    done       BOOLEAN          DEFAULT FALSE,
    created_at TIMESTAMP        DEFAULT NOW(),
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE
);