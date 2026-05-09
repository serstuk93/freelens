/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiServicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-services/api-services-route.injectable";
import { ApiServicesRoute } from "./route";

import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const apiServicesRouteComponentInjectable = getInjectable({
  id: "api-services-route-component",

  instantiate: (di) => ({
    route: di.inject(apiServicesRouteInjectable),
    Component: ApiServicesRoute,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default apiServicesRouteComponentInjectable;
