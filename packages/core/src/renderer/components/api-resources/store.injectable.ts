/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { loggerInjectionToken } from "@freelensapp/logger";
import { storesAndApisCanBeCreatedInjectionToken } from "@freelensapp/kube-api-specifics";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { ApiResourceStore } from "./store";
import apiResourceApiInjectable from "./api-resource.api.injectable";

const apiResourceStoreInjectable = getInjectable({
  id: "api-resource-store",

  instantiate: (di) => {
    if (!di.inject(storesAndApisCanBeCreatedInjectionToken)) {
      throw new Error("apiResourceStore is only available in certain environments");
    }

    return new ApiResourceStore(
      {
        context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
        logger: di.inject(loggerInjectionToken),
      },
      di.inject(apiResourceApiInjectable),
    );
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default apiResourceStoreInjectable;
