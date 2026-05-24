/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeApi } from "@freelensapp/kube-api";
import type { KubeApiDependencies } from "@freelensapp/kube-api";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObjectStoreDependencies } from "../../../common/k8s-api/kube-object.store";
import { KubeObject, type KubeJsonApiData, type KubeObjectMetadata, type KubeObjectScope } from "@freelensapp/kube-object";

interface ApiResourceSpec {
  service?: {
    name?: string;
  };
}

interface ApiResourceStatus {
  conditions?: Array<{
    type: string;
    status: string;
  }>;
}

export class ApiResourceApi extends KubeApi<ApiResource> {
  constructor(deps: KubeApiDependencies) {
    super(deps, {
      objectConstructor: ApiResource,
    });
  }
}

export class ApiResource extends KubeObject<KubeObjectMetadata<KubeObjectScope>, ApiResourceStatus, ApiResourceSpec> {
  static readonly apiBase = "/apis/apiregistration.k8s.io/v1/apiResources";
  static readonly kind = "APIResource";
  static readonly namespaced = false;

  constructor(data: KubeJsonApiData<KubeObjectMetadata<KubeObjectScope>, ApiResourceStatus, ApiResourceSpec>) {
    super(data);
  }

  getName() {
    return this.metadata?.name || "";
  }

  getResource() {
    return this.spec?.service?.name || "";
  }

  getAvailable() {
    return this.status?.conditions?.some((c) => c.type === "Available" && c.status === "True") || false;
  }

  getSearchFields() {
    return [this.getName(), this.getResource()].filter(Boolean);
  }
}

export class ApiResourceStore extends KubeObjectStore<ApiResource> {
  constructor(dependencies: KubeObjectStoreDependencies, api: ApiResourceApi) {
    super(dependencies, api);
  }
}
