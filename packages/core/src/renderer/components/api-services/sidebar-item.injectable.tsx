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
import apiServicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-services/api-services-route.injectable";
import navigateToApiServicesInjectable from "../../../common/front-end-routing/routes/cluster/api-services/navigate-to-api-services.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";

const id = SidebarMenuItem.ApiServices;

const apiServicesSidebarItemInjectable = getInjectable({
  id: id,

  instantiate: (di) => {
    const route = di.inject(apiServicesRouteInjectable);
    const getClusterPageMenuOrder = di.inject(getClusterPageMenuOrderInjectable);

    return {
      parentId: null,
      title: "API Services",
      getIcon: () => <Icon material="api" />,
      onClick: di.inject(navigateToApiServicesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: getClusterPageMenuOrder(id, sidebarMenuItemIds[id]),
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default apiServicesSidebarItemInjectable;
