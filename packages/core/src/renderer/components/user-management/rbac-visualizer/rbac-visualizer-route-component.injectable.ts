/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import rbacVisualizerRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/rbac-visualizer/rbac-visualizer-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../../routes/route-specific-component-injection-token";
import { RbacVisualizer } from "./rbac-visualizer";

const rbacVisualizerRouteComponentInjectable = getInjectable({
  id: "rbac-visualizer-route-component",

  instantiate: (di) => ({
    route: di.inject(rbacVisualizerRouteInjectable),
    Component: RbacVisualizer,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default rbacVisualizerRouteComponentInjectable;
