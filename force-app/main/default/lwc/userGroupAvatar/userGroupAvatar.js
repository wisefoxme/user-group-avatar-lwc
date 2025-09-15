import getGroupMembers from "@salesforce/apex/UserGroupAvatarController.getGroupMembers";
import { getFieldValue, getRecord } from "lightning/uiRecordApi";
import { api, LightningElement, wire } from "lwc";
import GROUP_NAME_FIELD from "@salesforce/schema/Group.Name";

export default class UserGroupAvatar extends LightningElement {
  @api recordId;
  @api fallbackIconName = "standard:user";
  @api maxAvatars = 5;
  @api variant;
  groupName;
  _label;
  groupMembers = [];

  @api
  get label() {
    return this._label || this.groupName || "Group Members";
  }
  set label(value) {
    this._label = value;
  }

  get showLabel() {
    return this.variant !== "label-hidden" && !!this.label;
  }

  @wire(getGroupMembers, { groupIdOrName: "$recordId" })
  wiredGroupMembers({ error, data }) {
    if (data) {
      this.groupMembers = data.slice(0, this.maxAvatars);
    } else if (error) {
      console.error("Error fetching group members:", error);
    }
  }

  @wire(getRecord, { recordId: "$recordId", fields: [GROUP_NAME_FIELD] })
  wiredGroupName({ error, data }) {
    if (data) {
      this.groupName = getFieldValue(data, GROUP_NAME_FIELD);
    } else if (error) {
      console.error("Error fetching group name:", error);
    }
  }

  handleAvatarHoverStart() {
    const items = this.template.querySelectorAll("c-user-group-avatar-item");

    items.forEach((item) => {
      item.classList.add("avatar-item-hovered");
      item.classList.remove("avatar-item-retracted");
    });
  }

  handleAvatarHoverEnd() {
    const items = this.template.querySelectorAll("c-user-group-avatar-item");

    items.forEach((item) => {
      item.classList.add("avatar-item-retracted");
      item.classList.remove("avatar-item-hovered");
    });
  }
}
