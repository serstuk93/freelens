/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Icon } from "@freelensapp/icon";
import { Tooltip } from "@freelensapp/tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import visitEntityContextMenuInjectable from "../../../common/catalog/visit-entity-context-menu.injectable";
import { broadcastMessage } from "../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../../common/ipc/navigation-events";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/toggling.injectable";
import normalizeCatalogEntityContextMenuInjectable from "../../catalog/normalize-menu-item.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import { Avatar } from "../avatar";
import { Menu, MenuItem } from "../menu";
import styles from "./sidebar-cluster.module.scss";

// import { useAsync } from "react-use";
import { configMapApiInjectable } from "@freelensapp/kube-api-specifics";


import type { VisitEntityContextMenu } from "../../../common/catalog/visit-entity-context-menu.injectable";
import type { ActiveHotbarModel } from "../../../features/hotbar/storage/common/toggling.injectable";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../api/catalog-entity";
import type { NormalizeCatalogEntityContextMenu } from "../../catalog/normalize-menu-item.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";

export interface SidebarClusterProps {
  clusterEntity: CatalogEntity | null | undefined;
}

interface Dependencies {
  navigate: Navigate;
  normalizeMenuItem: NormalizeCatalogEntityContextMenu;
  visitEntityContextMenu: VisitEntityContextMenu;
  entityInActiveHotbar: ActiveHotbarModel;
  configMapApi: any;
}

const NonInjectedSidebarCluster = observer(
  ({
    clusterEntity,
    visitEntityContextMenu: onContextMenuOpen,
    navigate,
    normalizeMenuItem,
    configMapApi,
    entityInActiveHotbar,
  }: Dependencies & SidebarClusterProps) => {
    const [menuItems] = useState(observable.array<CatalogEntityContextMenu>());
    const [opened, setOpened] = useState(false);
    const [avatarTitle, setAvatarTitle] = useState("DEV");
    const [isProd, setIsProd] = useState(false);

    useEffect(() => {
      let cancelled = false;

      async function fetchClusterType() {
        if (!clusterEntity) return;
        try {
          const configMap = await configMapApi.get({
            name: "cluster-type",
            namespace: "kube-system",
          });
          const isProductive = configMap?.data?.isProductive === "true";
          if (!cancelled) setAvatarTitle(isProductive ? "PROD" : "DEV");
          setIsProd(isProductive);
        } catch {
          if (!cancelled) setAvatarTitle("DEV");
          setIsProd(false);
        }
      }

      fetchClusterType();

      return () => {
        cancelled = true;
      };
    }, [clusterEntity, configMapApi]);

    if (!clusterEntity) {
      // render a Loading version of the SidebarCluster
      return (
        <div className={styles.SidebarCluster}>
          <Avatar title="??" background="var(--halfGray)" size={40} className={styles.loadingAvatar} />
          <div className={styles.loadingClusterName} />
        </div>
      );
    }

    const onMenuOpen = () => {
      const title = entityInActiveHotbar.hasEntity(clusterEntity.getId()) ? "Remove from Hotbar" : "Add to Hotbar";
      const onClick = () => entityInActiveHotbar.toggleEntity(clusterEntity);

      menuItems.replace([{ title, onClick }]);
      onContextMenuOpen(clusterEntity, {
        menuItems,
        navigate: (url, forceMainFrame = true) => {
          if (forceMainFrame) {
            broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, url);
          } else {
            navigate(url);
          }
        },
      });

      toggle();
    };

    const onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
      if (evt.code == "Space") {
        toggle();
      }
    };

    const toggle = () => {
      setOpened(!opened);
    };

    const id = `cluster-${clusterEntity.getId()}`;
    const tooltipId = `tooltip-${id}`;

    return (
      <div
        id={id}
        className={styles.SidebarCluster}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="menubar"
        data-testid="sidebar-cluster-dropdown"
      >
        <Avatar
         // title="DEV"
         title={avatarTitle}
        //  title={clusterEntity.getName().slice(0,6)} // title of cluster in sidebar ( Nodes, Workloads etc.)
          colorHash={`${clusterEntity.getName()}-${clusterEntity.metadata.source}`}
          size={24}
          src={clusterEntity.spec.icon?.src}
          background={clusterEntity.spec.icon?.background}
          className={`${styles.avatar}${isProd ? " " + styles.prodAvatar : ""}`}
        />
        <div className={styles.clusterName} id={tooltipId}>
          {clusterEntity.getName()}
        </div>
        <Tooltip targetId={tooltipId}>{clusterEntity.getName()}</Tooltip>
        <Icon material="arrow_drop_down" className={styles.dropdown} />
        <Menu
          usePortal
          htmlFor={id}
          isOpen={opened}
          open={onMenuOpen}
          closeOnClickItem
          closeOnClickOutside
          close={toggle}
          className={styles.menu}
        >
          {menuItems.map(normalizeMenuItem).map((menuItem) => (
            <MenuItem key={menuItem.title} onClick={menuItem.onClick}>
              {menuItem.title}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  },
);

export const SidebarCluster = withInjectables<Dependencies, SidebarClusterProps>(NonInjectedSidebarCluster, {
  getProps: (di, props) => ({
    ...props,
    visitEntityContextMenu: di.inject(visitEntityContextMenuInjectable),
    navigate: di.inject(navigateInjectable),
    normalizeMenuItem: di.inject(normalizeCatalogEntityContextMenuInjectable),
    entityInActiveHotbar: di.inject(activeHotbarInjectable),
    configMapApi: di.inject(configMapApiInjectable),
  }),
});
