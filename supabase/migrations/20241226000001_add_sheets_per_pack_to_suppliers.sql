
-- Add sheets_per_pack column to suppliers table
ALTER TABLE suppliers 
ADD COLUMN sheets_per_pack INTEGER DEFAULT 100 NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN suppliers.sheets_per_pack IS 'Number of sheets per pack for this supplier';
