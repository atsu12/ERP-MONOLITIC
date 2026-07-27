USE inventory_app;

-- =============================================================================
-- SETTINGS
-- =============================================================================

INSERT INTO settings (
    display_currency,
    currency_symbol,
    usd_exchange_rate,
    company_multiplier
)
VALUES (
    'GHS',
    'GH₵',
    8.20,
    1.25
);

-- =============================================================================
-- DEFAULT ADMIN
-- =============================================================================

INSERT INTO users (
    username,
    email,
    password_hash,
    role
)
VALUES (
    'admin',
    'admin@localhost',
    '$2b$10$tpFwdp38QfKNxf.Xy2wANOHQYLHUQWt87kZqFs77lgUDSP6G4B7DC',
    'ADMIN'
);

-- =============================================================================
-- DEFAULT WAREHOUSE
-- =============================================================================

INSERT INTO warehouses (
    name,
    code,
    location,
    status
)
VALUES (
    'Main Warehouse',
    'MAIN',
    NULL,
    'ACTIVE'
);