export const PLAN_LIMITS = {
    FREE:      { per: "day",   max: 20 },
    PRO:       { per: "month", max: 1000 },
    BUSINESS:  { per: "month", max: 10000 },
  };
  
  export function getPeriodRange(per = "day", at = new Date()) {
    const start = new Date(at), end = new Date(at);
    if (per === "day") { start.setHours(0,0,0,0); end.setHours(23,59,59,999); }
    else { start.setDate(1); start.setHours(0,0,0,0); end.setMonth(end.getMonth()+1, 0); end.setHours(23,59,59,999); }
    return { start, end };
  }