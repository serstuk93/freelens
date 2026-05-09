/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

interface ApiResourceGroup {
  apiVersion: string;
  resources: Array<{
    name: string;
    shortNames: string[];
    namespaced: boolean;
    kind: string;
  }>;
}

const apiResourceGroupsInjectable = getInjectable({
  id: "api-resource-groups",

  instantiate: () => {
    return computed(() => {
      // This will be populated with actual API resource data
      // For now, returning an empty array
      const groups: ApiResourceGroup[] = [];
      return groups;
    });
  },
});

export default apiResourceGroupsInjectable;
