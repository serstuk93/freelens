/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

import { reaction } from "mobx";
import userPreferencesStateInjectable from "../../../user-preferences/common/state.injectable";
import { defaultHotbarCells } from "./types";

import type { Hotbar } from "./hotbar";

const hotbarsStateInjectable = getInjectable({
  id: "hotbars-state",
  instantiate: (di) => {
    const state = observable.map<string, Hotbar>();
    const userPreferencesState = di.inject(userPreferencesStateInjectable);

    // Ensure hotbar items length matches hotbarCells preference
    reaction(
      () => userPreferencesState.hotbarCells,
      (hotbarCells) => {
        for (const hotbar of state.values()) {
          ensureExactHotbarItemLength(hotbar, hotbarCells ?? defaultHotbarCells);
        }
      },
      { fireImmediately: true }
    );

    return state;
  },
});

export default hotbarsStateInjectable;


function ensureExactHotbarItemLength(hotbar: Hotbar, hotbarCells: number) {
  while (hotbar.items.length < hotbarCells) {
    hotbar.items.push(null);
  }
  while (hotbar.items.length > hotbarCells) {
    const lastNull = hotbar.items.lastIndexOf(null);
    if (lastNull >= 0) {
      hotbar.items.splice(lastNull, 1);
    } else {
      hotbar.items.length = hotbarCells;
    }
  }
}
