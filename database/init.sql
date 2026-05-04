-- ============================================================
-- Libra360 – Database Initialization Script
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(150)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id                   SERIAL PRIMARY KEY,
    user_id              INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                VARCHAR(200)  NOT NULL,
    target_amount        NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
    current_savings      NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_savings >= 0),
    monthly_contribution NUMERIC(14,2) NOT NULL CHECK (monthly_contribution > 0),
    duration_months      INTEGER       NOT NULL CHECK (duration_months BETWEEN 1 AND 360),
    category             VARCHAR(50)   NOT NULL DEFAULT 'General',
    ai_tip               TEXT,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast user-based lookups
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON savings_goals(user_id);

-- ============================================================
-- SQL Task: Top 3 users closest to reaching their target goals
-- ============================================================
-- Run this query any time to get the leaderboard:
--
-- SELECT
--     u.id                                                      AS user_id,
--     u.name                                                    AS user_name,
--     sg.title                                                  AS goal_title,
--     sg.target_amount,
--     sg.current_savings,
--     ROUND(
--         LEAST(sg.current_savings / NULLIF(sg.target_amount,0) * 100, 100),
--         2
--     )                                                         AS progress_percent,
--     GREATEST(
--         CEIL(
--             (sg.target_amount - sg.current_savings)
--             / NULLIF(sg.monthly_contribution, 0)
--         ), 0
--     )::INTEGER                                                AS months_remaining
-- FROM savings_goals sg
-- JOIN users u ON u.id = sg.user_id
-- WHERE sg.current_savings < sg.target_amount
-- ORDER BY progress_percent DESC
-- LIMIT 3;
-- ============================================================

-- Seed data for testing
INSERT INTO users (name, email) VALUES
    ('Yashvardhan Singh',  'yash@dynamicore.in'),
    ('Priya Mehta',        'priya@dynamicore.in'),
    ('Arjun Kapoor',       'arjun@dynamicore.in')
ON CONFLICT (email) DO NOTHING;

INSERT INTO savings_goals
    (user_id, title, target_amount, current_savings, monthly_contribution, duration_months, category)
VALUES
    (1, 'Emergency Fund',         300000, 240000, 10000, 12, 'Emergency Fund'),
    (1, 'Europe Vacation 2026',   150000,  30000,  8000, 18, 'Vacation'),
    (2, 'Home Down Payment',     2000000, 800000, 40000, 36, 'Home Purchase'),
    (3, 'MBA Education Fund',     800000, 680000, 20000, 12, 'Education')
ON CONFLICT DO NOTHING;
