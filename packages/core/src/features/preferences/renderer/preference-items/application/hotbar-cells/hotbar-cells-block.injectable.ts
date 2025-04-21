/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { HotbarCells } from "./hotbar-cells";

const hotbarCellsPreferenceBlockInjectable = getInjectable({
  id: "hotbar-cells-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "hotbar-cells",
    parentId: "application-page",
    orderNumber: 60,
    Component: HotbarCells,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default hotbarCellsPreferenceBlockInjectable;
