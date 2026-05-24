/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import k8sRequestInjectable from "../k8s-request.injectable";

import type { V1APIResourceList } from "@freelensapp/kubernetes-client-node";
import type { AsyncResult } from "@freelensapp/utilities";

import type { Cluster } from "../../common/cluster/cluster";
import type { KubeApiResource } from "../../common/rbac";
import type { KubeResourceListGroup } from "./api-versions-requester";

export type RequestKubeApiResources = (grouping: KubeResourceListGroup) => AsyncResult<KubeApiResource[], Error>;

export type RequestKubeApiResourcesFor = (cluster: Cluster) => RequestKubeApiResources;

const requestKubeApiResourcesForInjectable = getInjectable({
  id: "request-kube-api-resources-for",
  instantiate: (di): RequestKubeApiResourcesFor => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return (cluster) =>
      async ({ group, path }) => {
        try {
          const { resources } = (await k8sRequest(cluster, path)) as V1APIResourceList;
          const version = path.split("/").at(-1);

          return {
            callWasSuccessful: true,
            response: resources.map((resource) => ({
              apiName: resource.name,
              kind: resource.kind,
              group,
              version,
              namespaced: resource.namespaced,
              verbs: resource.verbs || [],
              shortNames: resource.shortNames || [],
            })),
          };
        } catch (error) {
          return {
            callWasSuccessful: false,
            error: error as Error,
          };
        }
      };
  },
});

export default requestKubeApiResourcesForInjectable;
