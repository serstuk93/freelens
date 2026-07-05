/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemInjectionToken } from "@freelensapp/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import rbacVisualizerRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/rbac-visualizer/rbac-visualizer-route.injectable";
import navigateToRbacVisualizerInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/rbac-visualizer/navigate-to-rbac-visualizer.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import userManagementSidebarItemInjectable from "../user-management-sidebar-item.injectable";

const rbacVisualizerSidebarItemInjectable = getInjectable({
  id: "sidebar-item-rbac-visualizer",

  instantiate: (di) => {
    const route = di.inject(rbacVisualizerRouteInjectable);

    return {
      parentId: userManagementSidebarItemInjectable.id,
      title: "RBAC Visualizer",
      onClick: di.inject(navigateToRbacVisualizerInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 60,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default rbacVisualizerSidebarItemInjectable;
