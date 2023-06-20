/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ContainerApp, Dapr } from "@azure/arm-appcontainers";
import { createGenericElement } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { localize } from "../../utils/localize";
import { treeUtils } from "../../utils/treeUtils";
import { ContainerAppModel } from "../ContainerAppItem";
import { TreeElementBase } from "../ContainerAppsBranchDataProvider";

export class DaprEnabledItem implements TreeElementBase {

    id: string = `${this.containerApp.id}/DaprEnabled`;
    constructor(private readonly containerApp: ContainerAppModel, private readonly dapr: Dapr) { }

    viewProperties: ViewPropertiesModel = {
        data: this.dapr,
        label: localize('daprProperties', '{0} Dapr', this.containerApp.name),
    }

    getTreeItem(): TreeItem {
        return {
            id: this.id,
            label: localize('dapr', 'Dapr'),
            description: localize('enabled', 'Enabled'),
            iconPath: treeUtils.getIconPath('dapr_logo'),
            collapsibleState: TreeItemCollapsibleState.Collapsed,
        }
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const children: TreeElementBase[] = [];

        if (this.dapr.appId) {
            children.push(createGenericElement({
                contextValue: 'daprAppId',
                description: 'app id',
                iconPath: new ThemeIcon('dash'),
                label: this.dapr.appId,
            }));
        }

        if (this.dapr.appPort) {
            children.push(createGenericElement({
                contextValue: 'daprAppPort',
                description: 'app port',
                iconPath: new ThemeIcon('dash'),
                label: String(this.dapr.appPort),
            }))
        }

        if (this.dapr.appProtocol) {
            children.push(createGenericElement({
                description: 'app protocol',
                label: String(this.dapr.appProtocol),
                contextValue: 'daprAppProtocol',
                iconPath: new ThemeIcon('dash'),
            }));
        }

        return children;
    }
}

export function createDaprDisabledItem(containerApp: ContainerApp): TreeElementBase {
    return createGenericElement({
        id: `${containerApp.id}/DaprDisabled`,
        label: localize('dapr', 'Dapr'),
        description: localize('disabled', 'Disabled'),
        contextValue: 'dapr|disabled',
        iconPath: new ThemeIcon('debug-disconnect'),
    });
}