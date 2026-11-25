// Settings for OpenNext, the adapter that runs this Next.js app on Cloudflare Workers.
// The defaults are enough for now. When pages need to refresh after a deploy
// (`revalidate`), add the R2 cache: https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
