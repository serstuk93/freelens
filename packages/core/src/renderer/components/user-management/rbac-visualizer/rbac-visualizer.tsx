/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./rbac-visualizer.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import clusterRoleBindingStoreInjectable from "../cluster-role-bindings/store.injectable";
import clusterRoleStoreInjectable from "../cluster-roles/store.injectable";
import roleBindingStoreInjectable from "../role-bindings/store.injectable";
import roleStoreInjectable from "../roles/store.injectable";
import serviceAccountStoreInjectable from "../service-accounts/store.injectable";
import subscribeStoresInjectable from "../../../kube-watch-api/subscribe-stores.injectable";

import type { ClusterRoleBindingStore } from "../cluster-role-bindings/store";
import type { ClusterRoleStore } from "../cluster-roles/store";
import type { RoleBindingStore } from "../role-bindings/store";
import type { RoleStore } from "../roles/store";
import type { ServiceAccountStore } from "../service-accounts/store";
import type { SubscribeStores } from "../../../kube-watch-api/kube-watch-api";

// ---- Types ------------------------------------------------------------------

interface SvgPath {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  fromId: string;
  toId: string;
}

interface Dependencies {
  subscribeToStores: SubscribeStores;
  serviceAccountStore: ServiceAccountStore;
  roleBindingStore: RoleBindingStore;
  clusterRoleBindingStore: ClusterRoleBindingStore;
  roleStore: RoleStore;
  clusterRoleStore: ClusterRoleStore;
}

// ---- Helpers ----------------------------------------------------------------

function saNodeId(namespace: string, name: string) {
  return `sa:${namespace}/${name}`;
}

function rbNodeId(namespace: string, name: string) {
  return `rb:${namespace}/${name}`;
}

function crbNodeId(name: string) {
  return `crb:${name}`;
}

function roleNodeId(namespace: string, name: string) {
  return `role:${namespace}/${name}`;
}

function crNodeId(name: string) {
  return `cr:${name}`;
}

// ---- Component --------------------------------------------------------------

const NonInjectedRbacVisualizer = observer((props: Dependencies) => {
  const { serviceAccountStore, roleBindingStore, clusterRoleBindingStore, roleStore, clusterRoleStore, subscribeToStores } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [svgPaths, setSvgPaths] = useState<SvgPath[]>([]);
  const prevPathsJson = useRef("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [legendVisible, setLegendVisible] = useState(false);

  // Use the same subscription mechanism as KubeObjectListLayout so stores
  // load correctly regardless of which page was visited first.
  useEffect(() => {
    const disposer = subscribeToStores([
      serviceAccountStore,
      roleBindingStore,
      clusterRoleBindingStore,
      roleStore,
      clusterRoleStore,
    ]);

    return disposer;
  }, [subscribeToStores, serviceAccountStore, roleBindingStore, clusterRoleBindingStore, roleStore, clusterRoleStore]);

  // ---- Build graph data from stores ----------------------------------------

  const serviceAccounts = serviceAccountStore.items;
  const roleBindings = roleBindingStore.items;
  const clusterRoleBindings = clusterRoleBindingStore.items;
  const roles = roleStore.items;
  const clusterRoles = clusterRoleStore.items;

  const lowerSearch = searchText.toLowerCase();

  // Collect all node IDs used by bindings so we only show connected subjects
  const connectedSaIds = new Set<string>();
  const connectedRoleIds = new Set<string>();

  // SA → Binding edges (left column → middle column)
  const saToBindingEdges: Array<{ id: string; fromId: string; toId: string; color: string }> = [];
  // Binding → Role edges (middle column → right column)
  const bindingToRoleEdges: Array<{ id: string; fromId: string; toId: string; color: string }> = [];

  for (const rb of roleBindings) {
    const bindingId = rbNodeId(rb.getNs() ?? "", rb.getName());

    // Binding → Role
    const refKind = rb.roleRef.kind;
    let roleId: string;

    if (refKind === "ClusterRole") {
      roleId = crNodeId(rb.roleRef.name);
    } else {
      roleId = roleNodeId(rb.getNs() ?? "", rb.roleRef.name);
    }

    connectedRoleIds.add(roleId);
    bindingToRoleEdges.push({
      id: `${bindingId}→${roleId}`,
      fromId: bindingId,
      toId: roleId,
      color: "#4a9eff",
    });

    // Subject SA → Binding
    for (const subject of rb.getSubjects()) {
      if (subject.kind !== "ServiceAccount") continue;

      const ns = subject.namespace ?? rb.getNs() ?? "";
      const sid = saNodeId(ns, subject.name);

      connectedSaIds.add(sid);
      saToBindingEdges.push({
        id: `${sid}→${bindingId}`,
        fromId: sid,
        toId: bindingId,
        color: "#4a9eff",
      });
    }
  }

  for (const crb of clusterRoleBindings) {
    const bindingId = crbNodeId(crb.getName());
    const roleId = crNodeId(crb.roleRef.name);

    connectedRoleIds.add(roleId);
    bindingToRoleEdges.push({
      id: `${bindingId}→${roleId}`,
      fromId: bindingId,
      toId: roleId,
      color: "#9b59b6",
    });

    for (const subject of crb.getSubjects()) {
      if (subject.kind !== "ServiceAccount") continue;

      const ns = subject.namespace ?? "";
      const sid = saNodeId(ns, subject.name);

      connectedSaIds.add(sid);
      saToBindingEdges.push({
        id: `${sid}→${bindingId}`,
        fromId: sid,
        toId: bindingId,
        color: "#9b59b6",
      });
    }
  }

  // ---- Filtered node lists -------------------------------------------------
  // All objects are shown; orphaned = not referenced by any binding.

  const filteredSAs = serviceAccounts.filter((sa) =>
    lowerSearch === "" || sa.getName().toLowerCase().includes(lowerSearch),
  );

  const filteredRBs = roleBindings.filter((rb) =>
    lowerSearch === "" || rb.getName().toLowerCase().includes(lowerSearch),
  );

  const filteredCRBs = clusterRoleBindings.filter((crb) =>
    lowerSearch === "" || crb.getName().toLowerCase().includes(lowerSearch),
  );

  const filteredRoles = roles.filter((r) =>
    lowerSearch === "" || r.getName().toLowerCase().includes(lowerSearch),
  );

  const filteredCRs = clusterRoles.filter((cr) =>
    lowerSearch === "" || cr.getName().toLowerCase().includes(lowerSearch),
  );

  // Bindings that have no ServiceAccount subjects (User/Group only or empty)
  const connectedBindingIds = new Set<string>([
    ...saToBindingEdges.map((e) => e.toId),
  ]);

  function isOrphanedSa(nodeId: string) { return !connectedSaIds.has(nodeId); }
  /** Binding has zero subjects of any kind — truly useless. */
  function hasNoSubjects(subjects: { kind: string }[]) { return subjects.length === 0; }
  /** Binding has subjects but none are ServiceAccounts (User/Group only — normal). */
  function hasNoSaSubjects(nodeId: string, subjects: { kind: string }[]) {
    return !connectedBindingIds.has(nodeId) && subjects.length > 0;
  }
  function isOrphanedRole(nodeId: string) { return !connectedRoleIds.has(nodeId); }

  // ---- Hover chain computation ---------------------------------------------

  function getConnectedSet(nodeId: string): Set<string> {
    const connected = new Set<string>([nodeId]);

    const allEdges = [...saToBindingEdges, ...bindingToRoleEdges];

    // Walk outward (from → to)
    let changed = true;

    while (changed) {
      changed = false;

      for (const edge of allEdges) {
        if (connected.has(edge.fromId) && !connected.has(edge.toId)) {
          connected.add(edge.toId);
          changed = true;
        }

        if (connected.has(edge.toId) && !connected.has(edge.fromId)) {
          connected.add(edge.fromId);
          changed = true;
        }
      }
    }

    return connected;
  }

  // Selection takes priority over hover for the active highlight set
  const activeId = selectedId ?? hoveredId;
  const activeConnected = activeId ? getConnectedSet(activeId) : null;

  function isEdgeHighlighted(fromId: string, toId: string) {
    if (!activeConnected) return true;

    return activeConnected.has(fromId) && activeConnected.has(toId);
  }

  function handleNodeClick(nodeId: string) {
    setSelectedId(nodeId);
  }

  // ---- SVG path computation ------------------------------------------------

  const computeSvgPaths = useCallback(() => {
    if (!containerRef.current || !graphRef.current) return;

    const container = containerRef.current;
    const graphRect = graphRef.current.getBoundingClientRect();

    const allEdges = [...saToBindingEdges, ...bindingToRoleEdges];
    const newPaths: SvgPath[] = [];

    for (const edge of allEdges) {
      const fromEl = container.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(edge.fromId)}"]`);
      const toEl = container.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(edge.toId)}"]`);

      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Both the graph div and nodes scroll together, so subtracting graphRect
      // gives stable SVG coordinates without needing scrollTop correction.
      const x1 = fromRect.right - graphRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - graphRect.top;
      const x2 = toRect.left - graphRect.left;
      const y2 = toRect.top + toRect.height / 2 - graphRect.top;

      newPaths.push({
        id: edge.id,
        x1,
        y1,
        x2,
        y2,
        color: edge.color,
        fromId: edge.fromId,
        toId: edge.toId,
      });
    }

    const json = JSON.stringify(newPaths);

    if (json !== prevPathsJson.current) {
      prevPathsJson.current = json;
      setSvgPaths(newPaths);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-compute paths after every render (MobX store changes trigger re-renders)
  useEffect(() => {
    computeSvgPaths();
  });

  // Also recompute on container resize
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      prevPathsJson.current = ""; // force recompute
      computeSvgPaths();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [computeSvgPaths]);

  // ---- Render helpers ------------------------------------------------------

  function nodeClass(nodeId: string, baseClass: string, orphaned = false) {
    const classes = [baseClass];

    if (orphaned) {
      classes.push("is-orphaned");
    }

    if (nodeId === activeId) {
      classes.push("is-hovered");
    }

    if (nodeId === selectedId) {
      classes.push("is-selected");
    }

    return classes.join(" ");
  }

  // When something is selected, only show connected nodes in each column.
  const visibleSAs = selectedId ? filteredSAs.filter((sa) => activeConnected?.has(saNodeId(sa.getNs() ?? "", sa.getName()))) : filteredSAs;
  const visibleRBs = selectedId ? filteredRBs.filter((rb) => activeConnected?.has(rbNodeId(rb.getNs() ?? "", rb.getName()))) : filteredRBs;
  const visibleCRBs = selectedId ? filteredCRBs.filter((crb) => activeConnected?.has(crbNodeId(crb.getName()))) : filteredCRBs;
  const visibleRoles = selectedId ? filteredRoles.filter((r) => activeConnected?.has(roleNodeId(r.getNs() ?? "", r.getName()))) : filteredRoles;
  const visibleCRs = selectedId ? filteredCRs.filter((cr) => activeConnected?.has(crNodeId(cr.getName()))) : filteredCRs;

  const svgHeight = containerRef.current?.scrollHeight ?? 600;

  // ---- JSX -----------------------------------------------------------------

  return (
    <div className="RbacVisualizer" ref={containerRef} onContextMenu={(e) => { e.preventDefault(); setSelectedId(null); }}>
      {/* Toolbar */}
      <div className="rbac-visualizer-toolbar">
        <h2 className="rbac-visualizer-title">RBAC Visualizer</h2>
        <input
          className="rbac-visualizer-search"
          type="search"
          placeholder="Filter by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className={`rbac-legend-toggle${legendVisible ? " is-active" : ""}`}
          onClick={() => setLegendVisible((v) => !v)}
          type="button"
        >
          {legendVisible ? "Hide legend" : "Show legend"}
        </button>
      </div>
      {legendVisible && (
        <div className="rbac-visualizer-legend">
          <div className="legend-section-title">Resource types</div>
          <div className="legend-row">
            <span className="legend-item legend-sa">Service Account</span>
            <span className="legend-item legend-rb">RoleBinding</span>
            <span className="legend-item legend-crb">ClusterRoleBinding</span>
            <span className="legend-item legend-role">Role</span>
            <span className="legend-item legend-cr">ClusterRole</span>
          </div>
          <div className="legend-section-title">Badges</div>
          <div className="legend-badge-row">
            <span className="legend-badge node-orphaned">orphaned</span>
            <span className="legend-badge-label">Resource not referenced by any binding — grants access to nobody and can be safely removed</span>
          </div>
          <div className="legend-badge-row">
            <span className="legend-badge node-aggregated">aggregated</span>
            <span className="legend-badge-label">ClusterRole whose rules are auto-populated by the control plane from other ClusterRoles matching its label selectors — not bound directly (e.g. cluster-admin, admin, edit, view)</span>
          </div>
          <div className="legend-badge-row">
            <span className="legend-badge node-info">no SA</span>
            <span className="legend-badge-label">Binding targets only Users or Groups, not ServiceAccounts — fully functional, just not visible as a graph connection here</span>
          </div>
          <div className="legend-badge-row">
            <span className="legend-badge node-orphaned">no subjects</span>
            <span className="legend-badge-label">Binding has zero subjects of any kind — grants permissions to nobody and is effectively dead configuration</span>
          </div>
        </div>
      )}

      {/* Graph area */}
      <div className="rbac-visualizer-graph" ref={graphRef}>
        {/* SVG overlay for connection lines */}
        <svg
          className="rbac-visualizer-svg"
          style={{ height: svgHeight }}
          aria-hidden="true"
        >
          <defs>
            <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#4a9eff" />
            </marker>
            <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#9b59b6" />
            </marker>
          </defs>
          {svgPaths.map((p) => {
            const highlighted = isEdgeHighlighted(p.fromId, p.toId);
            const cx1 = p.x1 + (p.x2 - p.x1) * 0.4;
            const cx2 = p.x1 + (p.x2 - p.x1) * 0.6;
            const markerId = p.color === "#9b59b6" ? "arrowPurple" : "arrowBlue";

            return (
              <path
                key={p.id}
                d={`M${p.x1},${p.y1} C${cx1},${p.y1} ${cx2},${p.y2} ${p.x2},${p.y2}`}
                stroke={p.color}
                strokeWidth={highlighted ? 2 : 1}
                strokeOpacity={highlighted ? 0.85 : 0.15}
                fill="none"
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
        </svg>

        {/* Three columns */}
        <div className="rbac-visualizer-columns">
          {/* Column 1: Service Accounts */}
          <div className="rbac-visualizer-column">
            <div className="column-header">Service Accounts</div>
            {visibleSAs.length === 0 ? (
              <div className="column-empty">No service accounts</div>
            ) : (
              visibleSAs.map((sa) => {
                const nodeId = saNodeId(sa.getNs() ?? "", sa.getName());
                const orphaned = isOrphanedSa(nodeId);

                return (
                  <div
                    key={nodeId}
                    data-node-id={nodeId}
                    className={nodeClass(nodeId, "rbac-node rbac-node--sa", orphaned)}
                    onMouseEnter={() => setHoveredId(nodeId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                  >
                    <span className="node-name">{sa.getName()}</span>
                    {sa.getNs() && <span className="node-ns">{sa.getNs()}</span>}
                    {orphaned && <span className="node-orphaned">orphaned</span>}
                  </div>
                );
              })
            )}
          </div>

          {/* Column 2: Bindings */}
          <div className="rbac-visualizer-column">
            <div className="column-header">Bindings</div>
            {visibleRBs.map((rb) => {
              const nodeId = rbNodeId(rb.getNs() ?? "", rb.getName());
              const subjects = rb.getSubjects();
              const noSubjects = hasNoSubjects(subjects);
              const noSa = hasNoSaSubjects(nodeId, subjects);

              return (
                <div
                  key={nodeId}
                  data-node-id={nodeId}
                  className={nodeClass(nodeId, "rbac-node rbac-node--rb", noSubjects)}
                  onMouseEnter={() => setHoveredId(nodeId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                >
                  <span className="node-badge node-badge--rb">RB</span>
                  <span className="node-name">{rb.getName()}</span>
                  {rb.getNs() && <span className="node-ns">{rb.getNs()}</span>}
                  {noSubjects && <span className="node-orphaned">no subjects</span>}
                  {noSa && <span className="node-info">no SA</span>}
                </div>
              );
            })}
            {visibleCRBs.map((crb) => {
              const nodeId = crbNodeId(crb.getName());
              const subjects = crb.getSubjects();
              const noSubjects = hasNoSubjects(subjects);
              const noSa = hasNoSaSubjects(nodeId, subjects);

              return (
                <div
                  key={nodeId}
                  data-node-id={nodeId}
                  className={nodeClass(nodeId, "rbac-node rbac-node--crb", noSubjects)}
                  onMouseEnter={() => setHoveredId(nodeId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                >
                  <span className="node-badge node-badge--crb">CRB</span>
                  <span className="node-name">{crb.getName()}</span>
                  {noSubjects && <span className="node-orphaned">no subjects</span>}
                  {noSa && <span className="node-info">no SA</span>}
                </div>
              );
            })}
            {visibleRBs.length === 0 && visibleCRBs.length === 0 && (
              <div className="column-empty">No bindings</div>
            )}
          </div>

          {/* Column 3: Roles / ClusterRoles */}
          <div className="rbac-visualizer-column">
            <div className="column-header">Roles &amp; ClusterRoles</div>
            {visibleRoles.map((r) => {
              const nodeId = roleNodeId(r.getNs() ?? "", r.getName());
              const orphaned = isOrphanedRole(nodeId);

              return (
                <div
                  key={nodeId}
                  data-node-id={nodeId}
                  className={nodeClass(nodeId, "rbac-node rbac-node--role", orphaned)}
                  onMouseEnter={() => setHoveredId(nodeId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                >
                  <span className="node-badge node-badge--role">R</span>
                  <span className="node-name">{r.getName()}</span>
                  {r.getNs() && <span className="node-ns">{r.getNs()}</span>}
                  {orphaned && <span className="node-orphaned">orphaned</span>}
                </div>
              );
            })}
            {visibleCRs.map((cr) => {
              const nodeId = crNodeId(cr.getName());
              const orphaned = isOrphanedRole(nodeId);
              const aggregated = orphaned && !!cr.aggregationRule;

              return (
                <div
                  key={nodeId}
                  data-node-id={nodeId}
                  className={nodeClass(nodeId, "rbac-node rbac-node--cr", orphaned && !aggregated)}
                  onMouseEnter={() => setHoveredId(nodeId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                >
                  <span className="node-badge node-badge--cr">CR</span>
                  <span className="node-name">{cr.getName()}</span>
                  {aggregated && <span className="node-aggregated">aggregated</span>}
                  {orphaned && !aggregated && <span className="node-orphaned">orphaned</span>}
                </div>
              );
            })}
            {visibleRoles.length === 0 && visibleCRs.length === 0 && (
              <div className="column-empty">No bound roles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const RbacVisualizer = withInjectables<Dependencies>(NonInjectedRbacVisualizer, {
  getProps: (di) => ({
    subscribeToStores: di.inject(subscribeStoresInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    roleStore: di.inject(roleStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
  }),
});
