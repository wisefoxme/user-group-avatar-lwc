import { createElement } from "@lwc/engine-dom";
import { getRecord } from "lightning/uiRecordApi";
import GM_USERORGROUPID_FIELD from "@salesforce/schema/GroupMember.UserOrGroupId";
import GROUP_MEMBER_OBJECT from "@salesforce/schema/GroupMember";
import GROUP_NAME_FIELD from "@salesforce/schema/Group.Name";
import GROUP_OBJECT from "@salesforce/schema/Group";
import USER_NAME_FIELD from "@salesforce/schema/User.Name";
import USER_OBJECT from "@salesforce/schema/User";
import USER_PHOTO_FIELD from "@salesforce/schema/User.SmallPhotoUrl";
import UserGroupAvatarItem from "c/userGroupAvatarItem";

const GROUP_MEMBER_RECORD = {
  apiName: GROUP_MEMBER_OBJECT.objectApiName,
  fields: {
    [GM_USERORGROUPID_FIELD.fieldApiName]: {
      value: "group-id-member-id"
    }
  }
};

const GROUP_RECORD = {
  apiName: GROUP_OBJECT.objectApiName,
  fields: {
    [GROUP_NAME_FIELD.fieldApiName]: {
      value: "Example Group"
    }
  }
};

const USER_RECORD_WITH_PICTURE = {
  apiName: USER_OBJECT.objectApiName,
  fields: {
    [USER_PHOTO_FIELD.fieldApiName]: {
      value: "https://example.com/photo.jpg"
    },
    [USER_NAME_FIELD.fieldApiName]: {
      value: "John Doe"
    }
  }
};

const USER_RECORD_WITHOUT_PICTURE = {
  apiName: USER_OBJECT.objectApiName,
  fields: {
    [USER_NAME_FIELD.fieldApiName]: {
      value: "John Doe"
    }
  }
};

describe("c-user-group-avatar-item", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe("Rendering", () => {
    it("renders lightning-avatar element", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar-item", {
        is: UserGroupAvatarItem
      });

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_RECORD);
      getRecord.emit(GROUP_MEMBER_RECORD);
      getRecord.emit(USER_RECORD_WITH_PICTURE);

      await Promise.resolve();

      // Assert
      const avatarEl = element.shadowRoot.querySelector("lightning-avatar");
      expect(avatarEl).not.toBeNull();
    });

    it("renders the initials when there is no photo URL", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar-item", {
        is: UserGroupAvatarItem
      });

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_MEMBER_RECORD);
      getRecord.emit(USER_RECORD_WITHOUT_PICTURE);

      await Promise.resolve();

      // Assert
      const avatarEl = element.shadowRoot.querySelector("lightning-avatar");
      expect(avatarEl).not.toBeNull();
      expect(avatarEl.initials).toBe("JD");
    });
  });

  describe("Behavior (events)", () => {
    it("dispatches hoverstart event on mouse enter", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar-item", {
        is: UserGroupAvatarItem
      });

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_RECORD);
      getRecord.emit(GROUP_MEMBER_RECORD);
      getRecord.emit(USER_RECORD_WITH_PICTURE);

      await Promise.resolve();

      const avatarEl = element.shadowRoot.querySelector("lightning-avatar");
      expect(avatarEl).not.toBeNull();

      const hoverStartHandler = jest.fn();
      element.addEventListener("hoverstart", hoverStartHandler);

      // Simulate mouse enter
      avatarEl.dispatchEvent(new MouseEvent("mouseenter"));

      // Assert
      expect(hoverStartHandler).toHaveBeenCalled();

      const hoverEndHandler = jest.fn();
      element.addEventListener("hoverend", hoverEndHandler);

      // Simulate mouse leave
      avatarEl.dispatchEvent(new MouseEvent("mouseleave"));

      // Assert
      expect(hoverEndHandler).toHaveBeenCalled();
    });
  });
});
