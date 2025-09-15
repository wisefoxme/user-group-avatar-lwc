import getGroupMembers from "@salesforce/apex/UserGroupAvatarController.getGroupMembers";
import { getFieldValue, getRecord } from "lightning/uiRecordApi";
import { api, LightningElement, wire } from "lwc";
import GROUP_NAME_FIELD from "@salesforce/schema/Group.Name";

export default class UserGroupAvatar extends LightningElement {
  @api recordId;
  @api fallbackIconName = "standard:user";
  @api maxAvatars = 5;
  @api variant;
  @api retractionDistance = "medium";
  groupName;
  _label;
  groupMembers = [];
  shouldReloadStyles = false;

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
      this.shouldReloadStyles = true;
    } else if (error) {
      console.error("Error fetching group members:", error);
    }
  }

  @wire(getRecord, { recordId: "$recordId", fields: [GROUP_NAME_FIELD] })
  wiredGroupName({ error, data }) {
    if (data) {
      this.groupName = getFieldValue(data, GROUP_NAME_FIELD);
      this.shouldReloadStyles = true;
    } else if (error) {
      console.error("Error fetching group name:", error);
    }
  }

  renderedCallback() {
    if (!this.shouldReloadStyles) {
      return;
    }

    this._setRetractionDistanceStyles();
    this.shouldReloadStyles = false;
  }

  handleAvatarHoverStart() {
    const items = this.template.querySelectorAll("c-user-group-avatar-item");

    items.forEach((item) => {
      item.classList.add("avatar-item-hovered");
      item.classList.remove("avatar-item-retracted");
    });

    this.shouldReloadStyles = true;
  }

  handleAvatarHoverEnd() {
    const items = this.template.querySelectorAll("c-user-group-avatar-item");

    items.forEach((item) => {
      item.classList.add("avatar-item-retracted");
      item.classList.remove("avatar-item-hovered");
    });

    this.shouldReloadStyles = true;
  }

  _setRetractionDistanceStyles() {
    if (!this.retractionDistance) return;

    const items = this.template.querySelectorAll("c-user-group-avatar-item");
    const classToApply = `avatar-item_distance-${this.retractionDistance}`;

    items.forEach((item) => {
      item.classList.forEach((cls) => {
        if (cls.startsWith("avatar-item_distance-")) {
          item.classList.remove(cls);
        }
      });

      // add the new distance class
      item.classList.add(classToApply);
    });
  }
}
