/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";
import rbacVisualizerRouteInjectable from "./rbac-visualizer-route.injectable";

const navigateToRbacVisualizerInjectable = getInjectable({
  id: "navigate-to-rbac-visualizer",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(rbacVisualizerRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToRbacVisualizerInjectable;
