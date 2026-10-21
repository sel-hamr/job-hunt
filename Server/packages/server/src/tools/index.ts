import type { McpServer } from "@modelcontextprotocol/server";
import type { AppContext } from "../server.ts";
import { registerProfileGet } from "./profile/get.ts";
import { registerProfileImport } from "./profile/import.ts";
import { registerProfileItemAdd } from "./profile/item-add.ts";
import { registerProfileItemDelete } from "./profile/item-delete.ts";
import { registerProfileItemUpdate } from "./profile/item-update.ts";
import { registerProfileReset } from "./profile/reset.ts";
import { registerProfileUpdate } from "./profile/update.ts";

// Every tool is added here, in one place.
export function registerTools(server: McpServer, app: AppContext): void {
  registerProfileGet(server, app);
  registerProfileUpdate(server, app);
  registerProfileImport(server, app);
  registerProfileReset(server, app);
  registerProfileItemAdd(server, app);
  registerProfileItemUpdate(server, app);
  registerProfileItemDelete(server, app);
}
