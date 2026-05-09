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

interface ApiServiceSpec {
  service?: {
    name?: string;
  };
}

interface ApiServiceStatus {
  conditions?: Array<{
    type: string;
    status: string;
  }>;
}

export class ApiServiceApi extends KubeApi<ApiService> {
  constructor(deps: KubeApiDependencies) {
    super(deps, {
      objectConstructor: ApiService,
    });
  }
}

export class ApiService extends KubeObject<KubeObjectMetadata<KubeObjectScope>, ApiServiceStatus, ApiServiceSpec> {
  static readonly apiBase = "/apis/apiregistration.k8s.io/v1/apiservices";
  static readonly kind = "APIService";
  static readonly namespaced = false;

  constructor(data: KubeJsonApiData<KubeObjectMetadata<KubeObjectScope>, ApiServiceStatus, ApiServiceSpec>) {
    super(data);
  }

  getName() {
    return this.metadata?.name || "";
  }

  getService() {
    return this.spec?.service?.name || "";
  }

  getAvailable() {
    return this.status?.conditions?.some((c) => c.type === "Available" && c.status === "True") || false;
  }

  getSearchFields() {
    return [this.getName(), this.getService()].filter(Boolean);
  }
}

export class ApiServiceStore extends KubeObjectStore<ApiService> {
  constructor(dependencies: KubeObjectStoreDependencies, api: ApiServiceApi) {
    super(dependencies, api);
  }
}
