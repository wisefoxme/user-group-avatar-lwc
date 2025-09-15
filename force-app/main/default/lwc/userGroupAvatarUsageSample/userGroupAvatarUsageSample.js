import getGroupByName from "@salesforce/apex/UserGroupAvatarController.getGroupByName";
import { api, LightningElement, wire } from "lwc";

export default class UserGroupAvatarUsageSample extends LightningElement {
  @api groupName = "AllInternalUsers";
  groupId;

  @wire(getGroupByName, { groupName: "$groupName" })
  wiredGroup({ error, data }) {
    if (data) {
      this.groupId = data.DeveloperName;
    } else if (error) {
      console.error("Error fetching group:", error);
    }
  }
}
