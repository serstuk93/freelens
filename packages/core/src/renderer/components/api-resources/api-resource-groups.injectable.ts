/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";

interface ApiResourceGroup {
  apiVersion: string;
  resources: Array<{
    name: string;
    version?: string;
    shortNames: string[];
    namespaced: boolean;
    kind: string;
    verbs?: string[];
  }>;
}

const apiResourceGroupsInjectable = getInjectable({
  id: "api-resource-groups",

  instantiate: (di) => {
    const hostedCluster = di.inject(hostedClusterInjectable);

    return computed(() => {
      const resources = hostedCluster?.knownResources ?? [];
      const groups = new Map<string, ApiResourceGroup["resources"]>();

      for (const resource of resources) {
        const apiVersion = resource.group || "core";
        const resourcesByGroup = groups.get(apiVersion) ?? [];

        resourcesByGroup.push({
          name: resource.apiName,
          version: resource.version,
          shortNames: [], // TODO: add shortname support to KubeApiResourceDescriptor and populate this field
          namespaced: resource.namespaced,
          kind: resource.kind,
          verbs: resource.verbs,
        });

        groups.set(apiVersion, resourcesByGroup);
      }

      return Array.from(groups, ([apiVersion, resources]) => ({
        apiVersion,
        resources: resources.sort((a, b) => a.name.localeCompare(b.name)),
      })).sort((a, b) => a.apiVersion.localeCompare(b.apiVersion));
    });
  },
});

export default apiResourceGroupsInjectable;
