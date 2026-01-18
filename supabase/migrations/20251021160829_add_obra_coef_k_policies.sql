/*
  # Add RLS policies for obra_coef_k table

  1. Security Changes
    - Add policy to allow anyone to read coef_k values
    - Add policy to allow anyone to insert/update coef_k values
    
  2. Notes
    - Since this is a simple configuration table, we allow public access
    - In production, you might want to restrict this to authenticated users only
*/

-- Allow anyone to read obra_coef_k
CREATE POLICY "Allow public read access to obra_coef_k"
  ON obra_coef_k
  FOR SELECT
  USING (true);

-- Allow anyone to insert/update obra_coef_k
CREATE POLICY "Allow public insert access to obra_coef_k"
  ON obra_coef_k
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to obra_coef_k"
  ON obra_coef_k
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
