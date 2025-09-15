import { api, LightningElement, wire } from "lwc";
import { getFieldValue, getRecord } from "lightning/uiRecordApi";
import GM_USERORGROUPID_FIELD from "@salesforce/schema/GroupMember.UserOrGroupId";
import GROUP_MEMBER_OBJECT from "@salesforce/schema/GroupMember";
import GROUP_NAME_FIELD from "@salesforce/schema/Group.Name";
import GROUP_OBJECT from "@salesforce/schema/Group";
import USER_NAME_FIELD from "@salesforce/schema/User.Name";
import USER_OBJECT from "@salesforce/schema/User";
import USER_PHOTO_FIELD from "@salesforce/schema/User.SmallPhotoUrl";

/**
 * The inner item component to display a user or group member avatar.
 */
export default class UserGroupAvatarItem extends LightningElement {
  @api avatarBorderVariant = "circle";
  @api groupMemberId;
  @api retractionDistance = "medium";
  _value;
  userOrGroupValue;
  memberId;

  @api
  get initials() {
    const names = this.name.split(" ");

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else if (names.length > 1) {
      return (
        names[0].charAt(0).toUpperCase() +
        names[names.length - 1].charAt(0).toUpperCase()
      );
    }

    return "?";
  }

  get userPhotoUrl() {
    return getFieldValue(this.userOrGroupValue, USER_PHOTO_FIELD);
  }

  get name() {
    return (
      getFieldValue(this.userOrGroupValue, USER_NAME_FIELD) ||
      getFieldValue(this.userOrGroupValue, GROUP_NAME_FIELD) ||
      "?"
    );
  }

  @wire(getRecord, {
    recordId: "$groupMemberId",
    fields: [GM_USERORGROUPID_FIELD].map(
      (field) => `${field.objectApiName}.${field.fieldApiName}`
    )
  })
  wiredMember({ error, data }) {
    if (data && data.apiName === GROUP_MEMBER_OBJECT.objectApiName && !error) {
      this._value = data;
      this.memberId = getFieldValue(data, GM_USERORGROUPID_FIELD);
    } else if (error) {
      console.error("Error fetching group member:", error);
    }
  }

  @wire(getRecord, {
    recordId: "$memberId",
    fields: [USER_NAME_FIELD, USER_PHOTO_FIELD].map(
      (field) => `${field.objectApiName}.${field.fieldApiName}`
    )
  })
  wiredUserInfo({ error, data }) {
    if (data && !error && data.apiName === USER_OBJECT.objectApiName) {
      this.userOrGroupValue = data;
    }
  }

  @wire(getRecord, {
    recordId: "$memberId",
    fields: [GROUP_NAME_FIELD].map(
      (field) => `${field.objectApiName}.${field.fieldApiName}`
    )
  })
  wiredGroupInfo({ error, data }) {
    if (data && !error && data.apiName === GROUP_OBJECT.objectApiName) {
      // console.log("Group data:", JSON.stringify(data, null, 2));
      this.userOrGroupValue = data;
    }
  }

  handleMouseEnter() {
    this.dispatchEvent(
      new CustomEvent("hoverstart", { detail: { memberId: this.memberId } })
    );
  }

  handleMouseLeave() {
    this.dispatchEvent(
      new CustomEvent("hoverend", { detail: { memberId: this.memberId } })
    );
  }
}
