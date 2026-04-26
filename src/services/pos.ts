import { apiClient, unwrapResponseData } from "./client";
import type { ApiSuccessResponse } from "./types";
import type { PosInitData } from "@/types/pos-init-type";

/**
 * Fetch POS initialization data for a specific restaurant slug
 * GET /restaurants/{slug}/pos/init
 */
export async function fetchPosInit(slug: string): Promise<PosInitData> {
  const response = await apiClient.get<ApiSuccessResponse<PosInitData>>(
    `/restaurants/${slug}/pos/init`
  );
  return unwrapResponseData(response);
}
