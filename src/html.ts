import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { summaryText } from "./render";
import type { Schedule } from "./types";
import PlanTable from "./ui/PlanTable.vue";

/** The plan table as HTML, rendered by Vue's server renderer, with every comment (Vue's fragment markers) removed. */
export async function planHtml(s: Schedule): Promise<string> {
  const summary = s.dated ? `${summaryText(s)}, finish ${s.finish}` : summaryText(s);
  const html = await renderToString(createSSRApp(PlanTable, { schedule: s, summary }));
  return html.replace(/<!--[\s\S]*?-->/g, "") + "\n";
}
