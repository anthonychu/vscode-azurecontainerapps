/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { KnownActiveRevisionsMode, KnownRevisionProvisioningState, Revision } from "@azure/arm-appcontainers";
import { TreeItemIconPath, createContextValue, nonNullProp } from "@microsoft/vscode-azext-utils";
import type { AzureSubscription, ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { localize } from "../../utils/localize";
import { treeUtils } from "../../utils/treeUtils";
import type { ContainerAppModel } from "../ContainerAppItem";
import type { ContainerAppsItem, TreeElementBase } from "../ContainerAppsBranchDataProvider";
import { ScaleItem } from "../scaling/ScaleItem";

export interface RevisionsItemModel extends ContainerAppsItem {
    revision: Revision;
}

export class RevisionItem implements RevisionsItemModel {
    static contextValue: string = 'revisionItem';
    static contextValueRegExp: RegExp = new RegExp(RevisionItem.contextValue);

    id: string;
    revisionsMode: KnownActiveRevisionsMode;

    constructor(readonly subscription: AzureSubscription, readonly containerApp: ContainerAppModel, readonly revision: Revision) {
        this.id = nonNullProp(this.revision, 'id');
        this.revisionsMode = containerApp.revisionsMode;
    }

    get contextValue(): string {
        const values: string[] = [RevisionItem.contextValue];

        values.push(this.revision.active ? 'revisionState:active' : 'revisionState:inactive');
        // values.push(ext.revisionDraftFileSystem.doesContainerAppsItemHaveRevisionDraft(this) ? 'revisionDraft:true' : 'revisionDraft:false');
        values.push(this.revisionsMode === KnownActiveRevisionsMode.Single ? 'revisionMode:single' : 'revisionMode:multiple');

        return createContextValue(values);
    }

    get description(): string | undefined {
        if (this.revisionsMode === KnownActiveRevisionsMode.Single) {
            return undefined;
        }

        if (!this.revision.active) {
            return localize('inactive', 'Inactive');
        } else if (this.revision.name === this.containerApp.latestRevisionName) {
            return localize('latest', 'Latest');
        } else {
            return localize('active', 'Active');
        }
    }

    viewProperties: ViewPropertiesModel = {
        data: this.revision,
        label: nonNullProp(this.revision, 'name'),
    };

    async getChildren(): Promise<TreeElementBase[]> {
        return [new ScaleItem(this.subscription, this.containerApp, this.revision)];
    }

    getTreeItem(): TreeItem {
        return {
            id: this.id,
            label: this.revisionsMode === KnownActiveRevisionsMode.Single ? 'Latest' : this.revision.name,
            iconPath: this.iconPath,
            description: this.description,
            contextValue: this.contextValue,
            collapsibleState: TreeItemCollapsibleState.Collapsed,
        };
    }

    private get iconPath(): TreeItemIconPath {
        if (this.revisionsMode === KnownActiveRevisionsMode.Single) {
            return treeUtils.getIconPath('02885-icon-menu-Container-Revision-Active');
        }

        let id: string;
        let colorId: string;

        if (!this.revision.active) {
            id = 'circle-slash';
            colorId = 'testing.iconUnset';
        } else {
            switch (this.revision.provisioningState) {
                case KnownRevisionProvisioningState.Deprovisioning:
                case KnownRevisionProvisioningState.Provisioning:
                    id = 'play-circle';
                    colorId = 'testing.iconUnset';
                    break;
                case KnownRevisionProvisioningState.Failed:
                    id = 'error';
                    colorId = 'testing.iconFailed';
                    break;
                case KnownRevisionProvisioningState.Provisioned:
                    id = 'pass'
                    colorId = 'testing.iconPassed';
                    break;
                case KnownRevisionProvisioningState.Deprovisioned:
                default:
                    id = 'circle-slash';
                    colorId = 'testing.iconUnset';
            }
        }

        return new ThemeIcon(id, colorId ? new ThemeColor(colorId) : undefined);
    }
}