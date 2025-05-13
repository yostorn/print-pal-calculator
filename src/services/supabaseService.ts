
import { supabase } from "@/integrations/supabase/client";

// Paper Types
export const fetchPaperTypes = async () => {
  console.log("Fetching paper types from Supabase");
  const { data, error } = await supabase
    .from('paper_types')
    .select('*')
    .order('label');
  
  if (error) {
    console.error("Error fetching paper types:", error);
    throw error;
  }
  console.log("Paper types fetched:", data);
  return data;
};

// Paper Sizes
export const fetchPaperSizes = async (paperTypeId?: string) => {
  console.log("Fetching paper sizes with paperTypeId:", paperTypeId);
  let query = supabase
    .from('paper_sizes')
    .select('*')
    .order('name');
  
  if (paperTypeId) {
    query = query.eq('paper_type_id', paperTypeId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching paper sizes:", error);
    throw error;
  }
  console.log("Paper sizes fetched:", data);
  return data;
};

// Paper Grammages
export const fetchPaperGrammages = async (paperTypeId?: string) => {
  console.log("Fetching grammages with paperTypeId:", paperTypeId);
  let query = supabase
    .from('paper_grammages')
    .select('*')
    .order('grammage');
  
  if (paperTypeId) {
    query = query.eq('paper_type_id', paperTypeId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching paper grammages:", error);
    throw error;
  }
  console.log("Paper grammages fetched:", data);
  return data;
};

// Suppliers
export const fetchSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Paper Prices - Modified to log more details for debugging
export const fetchPaperPrice = async (paperTypeId: string, grammageId: string, supplierId: string) => {
  console.log("Fetching paper price with params:", { paperTypeId, grammageId, supplierId });
  
  const { data, error } = await supabase
    .from('paper_prices')
    .select('*')
    .eq('paper_type_id', paperTypeId)
    .eq('paper_grammage_id', grammageId)
    .eq('supplier_id', supplierId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') { 
    console.error("Error fetching paper price:", error);
    throw error; 
  }
  
  console.log("Paper price result:", data);
  return data;
};

// Plate Costs
export const fetchPlateCosts = async () => {
  const { data, error } = await supabase
    .from('plate_costs')
    .select('*');
  
  if (error) throw error;
  return data;
};

// Calculation Settings
export const fetchCalculationSettings = async () => {
  const { data, error } = await supabase
    .from('calculation_settings')
    .select('*');
  
  if (error) throw error;
  
  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  data?.forEach(item => {
    settings[item.name] = item.value;
  });
  
  return settings;
};
