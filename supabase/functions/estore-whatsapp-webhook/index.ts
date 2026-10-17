import { makeWebhookHandler } from "../_shared/whatsapp-test.mjs";

Deno.serve(makeWebhookHandler({ env: (name: string) => Deno.env.get(name) || "" }));
