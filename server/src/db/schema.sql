CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


DO $$ BEGIN
    CREATE TYPE reading_slot AS ENUM (
        'morning_fasting',
        'after_breakfast',
        'after_lunch',
        'after_dinner'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot reading_slot NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 40 AND value <= 600),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_date_slot UNIQUE (user_id, reading_date, slot)
);


CREATE INDEX IF NOT EXISTS idx_readings_user_date
ON readings (user_id, reading_date DESC);