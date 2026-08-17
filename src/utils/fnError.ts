/**
 * Supabase functions.invoke() does not always expose the response body on errors.
 * This helper reads the real edge response and maps provider errors to user-safe text.
 */
export const edgeErrorMessage = async (
  error: any,
  fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่',
): Promise<string> => {
  const res: Response | undefined = error?.context instanceof Response ? error.context : error?.context?.response;
  if (res) {
    try {
      const clone = typeof res.clone === 'function' ? res.clone() : res;
      const text = await clone.text();
      let body: any = null;
      try {
        body = JSON.parse(text);
      } catch {
        /* not json */
      }
      const msg = body?.error || body?.message || text;
      if (res.status === 402) return 'AI gateway ไม่พร้อมใช้งาน ระบบจะไม่คิดเครดิตภายใน กรุณาลองใหม่หรือใช้โครงร่าง fallback';
      if (res.status === 429) return 'ระบบ AI มีคำขอมากเกินไป กรุณาลองใหม่อีกครั้ง';
      if (res.status === 401 || res.status === 403) return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
      if (msg && typeof msg === 'string') return msg.slice(0, 300);
    } catch {
      /* ignore */
    }
  }
  return error?.message || fallback;
};
