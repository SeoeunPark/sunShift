import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async () => {
  const appUrl = Deno.env.get("APP_URL");
  const cronSecret = Deno.env.get("CRON_SECRET");

  if (!appUrl || !cronSecret) {
    return new Response(
      JSON.stringify({ error: "APP_URL and CRON_SECRET must be configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const response = await fetch(`${appUrl.replace(/\/$/, "")}/api/cron/shift-notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});
