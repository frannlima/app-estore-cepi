import { makeTestHandler } from "../_shared/whatsapp-test.mjs";

Deno.serve(makeTestHandler({ env: (name: string) => Deno.env.get(name) || "" }));
