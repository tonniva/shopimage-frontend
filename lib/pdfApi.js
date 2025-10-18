// lib/pdfApi.js
const API_BASE_SINGLE = process.env.NEXT_PUBLIC_API_BASE_SINGLE || "http://localhost:8080";
const API_BASE_ALL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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
 * Convert single PDF page to image with progress tracking
 * @param {File} file - PDF file
 * @param {Object} params - { page, format, target_w, target_h }
 * @param {(pct:number, phase?:string)=>void} onProgress
 * @param {{extraHeaders?:Record<string,string>}} opts
 */
export function convertPdfSingle(file, params = {}, onProgress, opts = {}) {
  return new Promise((resolve, reject) => {
    const qs = buildQuery(params);
    const url = `${API_BASE_SINGLE}/api/convert-pdf${qs ? "?" + qs : ""}`;

    const form = new FormData();
    form.append("file", file);
    form.append("page", params.page || "0");
    form.append("format", params.format || "jpeg");
    if (params.target_w) form.append("target_w", params.target_w);
    if (params.target_h) form.append("target_h", params.target_h);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "json";

    // แนบ Header โควต้า/อื่น ๆ
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
        if (!s || s === "unlimited" || s === "∞") return null;
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
        const ct = xhr.getResponseHeader("content-type") || "";
        const fromXhr = xhr.responseType === "json" ? xhr.response : null;
        const body =
          fromXhr && typeof fromXhr === "object"
            ? fromXhr
            : ct.includes("application/json")
            ? JSON.parse(xhr.responseText || "{}")
            : { ok: false };

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
          resolve({ ...body, quota });
        } else {
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

/**
 * Convert all PDF pages to images with progress tracking
 * @param {File} file - PDF file
 * @param {Object} params - { format, target_w, target_h }
 * @param {(pct:number, phase?:string)=>void} onProgress
 * @param {{extraHeaders?:Record<string,string>}} opts
 */
export function convertPdfAll(file, params = {}, onProgress, opts = {}) {
  return new Promise((resolve, reject) => {
    const qs = buildQuery(params);
    const url = `${API_BASE_ALL}/api/convert-pdf-all${qs ? "?" + qs : ""}`;

    const form = new FormData();
    form.append("file", file);
    form.append("format", params.format || "jpeg");
    if (params.target_w) form.append("target_w", params.target_w);
    if (params.target_h) form.append("target_h", params.target_h);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "json";

    // แนบ Header โควต้า/อื่น ๆ
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
        if (!s || s === "unlimited" || s === "∞") return null;
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
        const ct = xhr.getResponseHeader("content-type") || "";
        const fromXhr = xhr.responseType === "json" ? xhr.response : null;
        const body =
          fromXhr && typeof fromXhr === "object"
            ? fromXhr
            : ct.includes("application/json")
            ? JSON.parse(xhr.responseText || "{}")
            : { ok: false };

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
          resolve({ ...body, quota });
        } else {
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
