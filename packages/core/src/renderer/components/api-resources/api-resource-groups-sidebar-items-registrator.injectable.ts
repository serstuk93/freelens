/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import apiResourceGroupsSidebarItemsComputedInjectable from "./api-resource-groups-sidebar-items-computed.injectable";

const apiResourceGroupsSidebarItemsRegistratorInjectable = getInjectable({
  id: "api-resource-groups-sidebar-items-registrator",

  instantiate: (di) => ({
    run: () => {
      const sidebarItems = di.inject(apiResourceGroupsSidebarItemsComputedInjectable);
      const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(di);

      reaction(() => sidebarItems.get(), injectableDifferencingRegistrator, { fireImmediately: true });
    },
  }),

  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default apiResourceGroupsSidebarItemsRegistratorInjectable;
