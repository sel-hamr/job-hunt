import "server-only";

import {
  ProfileItemSchema,
  ProfileSchema,
  ProfileWithItemsSchema,
  type ProfileItemCreateInput,
  type ProfileItemType,
  type ProfileItemUpdateInput,
  type ProfileUpdateInput,
} from "@jobhunt/shared";
import { callApi, ignoreAnswer } from "./client";

// /api/profile (Server/docs/API.md, part 3).

export function getProfile() {
  return callApi("/profile", ProfileWithItemsSchema);
}

export function updateProfile(changes: ProfileUpdateInput) {
  return callApi("/profile", ProfileSchema, { method: "PATCH", body: changes });
}

export function addItem(input: ProfileItemCreateInput) {
  return callApi("/profile/items", ProfileItemSchema, { method: "POST", body: input });
}

// A normal edit: the server makes the item NOT checked.
export function updateItem(id: number, changes: ProfileItemUpdateInput) {
  return callApi(`/profile/items/${changes.type}/${id}`, ProfileItemSchema, { method: "PATCH", body: changes });
}

export function deleteItem(type: ProfileItemType, id: number) {
  return callApi(`/profile/items/${type}/${id}`, ignoreAnswer, { method: "DELETE" });
}
