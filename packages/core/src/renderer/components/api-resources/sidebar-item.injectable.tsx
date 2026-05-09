/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemInjectionToken } from "@freelensapp/cluster-sidebar";
import { Icon } from "@freelensapp/icon";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { SidebarMenuItem, sidebarMenuItemIds } from "../../../common/sidebar-menu-items-starting-order";
import { getClusterPageMenuOrderInjectable } from "../../../features/user-preferences/common/cluster-page-menu-order.injectable";
import apiResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import navigateToApiResourcesInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/navigate-to-api-resources.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";

const id = SidebarMenuItem.ApiResources;

const apiResourcesSidebarItemInjectable = getInjectable({
  id: id,

  instantiate: (di) => {
    const route = di.inject(apiResourcesRouteInjectable);
    const getClusterPageMenuOrder = di.inject(getClusterPageMenuOrderInjectable);

    return {
      parentId: null,
      title: "API Resources",
      getIcon: () => <Icon material="category" />,
      onClick: di.inject(navigateToApiResourcesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: getClusterPageMenuOrder(id, sidebarMenuItemIds[id]),
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default apiResourcesSidebarItemInjectable;
