/**
 * supabase.functions.invoke() ไม่คืน body ของ error ให้อัตโนมัติ
 * helper นี้อ่านข้อความจริงจาก response เพื่อแสดงสาเหตุที่ถูกต้อง (เช่น เครดิต AI หมด)
 */
export const edgeErrorMessage = async (error: any, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่'): Promise<string> => {
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
      if (res.status === 402) return 'เครดิต AI หมด กรุณาเติมเครดิตเพื่อใช้งานต่อ';
      if (res.status === 429) return 'ระบบ AI มีคำขอมากเกินไป กรุณาลองใหม่ในอีกสักครู่';
      if (res.status === 401 || res.status === 403) return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
      if (msg && typeof msg === 'string') return msg.slice(0, 300);
    } catch {
      /* ignore */
    }
  }
  return error?.message || fallback;
};
