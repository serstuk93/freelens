/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import { ApiResourcesRoute } from "./route";

import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const apiResourcesRouteComponentInjectable = getInjectable({
  id: "api-resources-route-component",

  instantiate: (di) => ({
    route: di.inject(apiResourcesRouteInjectable),
    Component: ApiResourcesRoute,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default apiResourcesRouteComponentInjectable;
