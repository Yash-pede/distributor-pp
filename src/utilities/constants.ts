export const supabaseBucket_Product_images = import.meta.env
  .VITE_SUPABASE_BUCKET;

export type challanProductAddingType = {
  product_id: string;
  quantity: number;
  discount: number;
  free_q: number;
  actual_q: number;
};
