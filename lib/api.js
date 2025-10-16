// /lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    const s = String(v).trim();
    if (s === "") return; // ตัดค่าว่าง
    sp.set(k, s);
  });
  return sp.toString();
}

/**
 * อัปโหลดไฟล์แบบมี progress + แนบ extraHeaders (x-user-id / x-plan)
 * @param {File} file
 * @param {*} query               // เช่น { target_w, target_h, format, ... }
 * @param {(pct:number, phase?:string)=>void} onProgress
 * @param {{renameWithPreset?:string, extraHeaders?:Record<string,string>}} opts
 */

export function convertSingleWithProgress(file, query = {}, onProgress, opts = {}) {
  return new Promise((resolve, reject) => {
    const qs = buildQuery(query);
    const url = `${API_BASE}/api/convert${qs ? "?" + qs : ""}`;

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "json"; // ให้ browser ช่วย parse JSON (fallback ด้านล่าง)

    // แนบ Header โควต้า/อื่น ๆ (เช่น x-user-id / x-plan)
    const headers = opts.extraHeaders || {};
    Object.entries(headers).forEach(([k, v]) => {
      if (v != null && v !== "") xhr.setRequestHeader(k, String(v));
    });

    // อัปโหลด: รายงานความคืบหน้า
    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct, "uploading");
      }
    };

    // เมื่อส่งเสร็จ ฝั่งเซิร์ฟเวอร์กำลังประมวลผล
    xhr.onreadystatechange = () => {
      // readyState 2 = ได้ header แล้ว / 3 = กำลังรับ body
      if ((xhr.readyState === 2 || xhr.readyState === 3) && onProgress) {
        onProgress(100, "processing");
      }

      if (xhr.readyState !== 4) return;

      // --- quota จาก header ---
      const hdrPlan = xhr.getResponseHeader("x-quota-plan");
      const hdrDay = xhr.getResponseHeader("x-quota-remaining-day");
      const hdrMonth = xhr.getResponseHeader("x-quota-remaining-month");

      const normalizeNum = (v) => {
        if (v == null) return undefined;
        const s = String(v).trim().toLowerCase();
        if (!s || s === "unlimited" || s === "∞") return null; // null = ไม่จำกัด
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : undefined;
      };

      const quotaFromHeaders = (hdrPlan || hdrDay || hdrMonth)
        ? {
            plan: hdrPlan || undefined,
            remaining_day: normalizeNum(hdrDay),
            remaining_month: normalizeNum(hdrMonth),
          }
        : undefined;

      try {
        // --- body ---
        const ct = xhr.getResponseHeader("content-type") || "";
        const fromXhr = xhr.responseType === "json" ? xhr.response : null;
        const body =
          fromXhr && typeof fromXhr === "object"
            ? fromXhr
            : ct.includes("application/json")
            ? JSON.parse(xhr.responseText || "{}")
            : { ok: false };

        // เลือก quota: ให้ body.quota มาก่อน ถ้าไม่มีค่อย fallback ไป header
        const quota =
          (body && body.quota
            ? {
                plan: body.quota.plan ?? quotaFromHeaders?.plan,
                remaining_day:
                  body.quota.remaining_day ?? quotaFromHeaders?.remaining_day,
                remaining_month:
                  body.quota.remaining_month ?? quotaFromHeaders?.remaining_month,
              }
            : quotaFromHeaders) || undefined;

        if (xhr.status >= 200 && xhr.status < 300) {
          // สำเร็จ
          resolve({ ...body, quota });
        } else {
          // ผิดพลาด
          const message =
            (typeof body?.error === "string" && body.error) ||
            body?.error?.message ||
            xhr.statusText ||
            "Request failed";

          const err = new Error(message);
          if (quota) err.quota = quota;
          err.status = xhr.status;
          reject(err);
        }
      } catch {
        const err = new Error("Invalid response from server");
        err.status = xhr.status;
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}