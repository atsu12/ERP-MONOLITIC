ALTER TABLE settings

ADD COLUMN company_name VARCHAR(255) NULL AFTER company_multiplier,

ADD COLUMN company_address TEXT NULL AFTER company_name,

ADD COLUMN company_phone VARCHAR(50) NULL AFTER company_address,

ADD COLUMN company_email VARCHAR(255) NULL AFTER company_phone,

ADD COLUMN company_website VARCHAR(255) NULL AFTER company_email,

ADD COLUMN company_vat VARCHAR(100) NULL AFTER company_website,

ADD COLUMN company_logo_path VARCHAR(500) NULL AFTER company_vat,

ADD COLUMN company_header TEXT NULL AFTER company_logo_path,

ADD COLUMN company_footer TEXT NULL AFTER company_header,

ADD COLUMN invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV' AFTER company_footer,

ADD COLUMN invoice_next_number INT NOT NULL DEFAULT 1 AFTER invoice_prefix,

ADD COLUMN invoice_number_length INT NOT NULL DEFAULT 6 AFTER invoice_next_number,

ADD COLUMN invoice_template_path VARCHAR(500) NULL AFTER invoice_number_length;
