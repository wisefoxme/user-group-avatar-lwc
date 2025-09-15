import getGroupMembers from "@salesforce/apex/UserGroupAvatarController.getGroupMembers";
import { api, LightningElement, wire } from "lwc";

export default class UserGroupAvatar extends LightningElement {
  @api recordId;
  @api fallbackIconName = "standard:user";
  @api maxAvatars = 5;
  @api label;
  groupMembers = [];

  @wire(getGroupMembers, { groupIdOrName: "$recordId" })
  wiredGroupMembers({ error, data }) {
    if (data) {
      this.groupMembers = data.slice(0, this.maxAvatars);
    } else if (error) {
      console.error("Error fetching group members:", error);
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
