export type GarmentType = "top" | "bottom";
export type CoupleStatus = "pending" | "active";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  partner_a: string;
  partner_b: string | null;
  invite_token: string;
  status: CoupleStatus;
  created_at: string;
};

export type Garment = {
  id: string;
  owner_id: string;
  type: GarmentType;
  image_path: string;
  image_url: string;
  description: string | null;
  color_name: string | null;
  color_hex: string | null;
  color_family: string | null;
  seasons: string[] | null;
  formality: string | null;
  style_tags: string[] | null;
  complements: string[] | null;
  analyzed: boolean;
  created_at: string;
};

export type Outfit = {
  id: string;
  couple_id: string;
  created_by: string;
  partner_a_top: string | null;
  partner_a_bottom: string | null;
  partner_b_top: string | null;
  partner_b_bottom: string | null;
  locked_color_hex: string | null;
  locked_color_name: string | null;
  rationale: string | null;
  confirmed: boolean;
  confirmed_at: string | null;
  planned_for: string | null;
  created_at: string;
};
