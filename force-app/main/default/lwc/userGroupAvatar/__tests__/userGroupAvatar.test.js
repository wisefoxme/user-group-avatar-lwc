import { createElement } from "@lwc/engine-dom";
import { getRecord } from "lightning/uiRecordApi";
import getGroupMembers from "@salesforce/apex/UserGroupAvatarController.getGroupMembers";
import GROUP_NAME_FIELD from "@salesforce/schema/Group.Name";
import UserGroupAvatar from "c/userGroupAvatar";

const GROUP_OBJECT = {
  apiName: "Group",
  fields: {
    [GROUP_NAME_FIELD.fieldApiName]: {
      value: "Example Group"
    }
  }
};

jest.mock(
  "@salesforce/apex/UserGroupAvatarController.getGroupMembers",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

describe("c-user-group-avatar", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe("Rendering", () => {
    it("renders lightning-avatar-group element and group name as label", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar", {
        is: UserGroupAvatar
      });
      element.recordId = "00Gxx0000004XXXXAA"; // Example Group Id

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_OBJECT);
      getGroupMembers.emit([
        {
          Id: "group-member-id-1",
          Name: "User One"
        },
        {
          Id: "group-member-id-2",
          Name: "User Two"
        }
      ]);

      await Promise.resolve();

      // Assert
      const avatarGroupEl = element.shadowRoot.querySelector(
        "c-user-group-avatar-item"
      );
      expect(avatarGroupEl).not.toBeNull();

      const labelEl = element.shadowRoot.querySelector("label");
      expect(labelEl).not.toBeNull();
      expect(labelEl.textContent).toBe("Example Group");
    });

    it("renders nothing when no members are found in group", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar", {
        is: UserGroupAvatar
      });
      element.recordId = "00Gxx0000004XXXXAA"; // Example Group Id

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_OBJECT);
      getGroupMembers.emit([]); // No members

      await Promise.resolve();

      // Assert
      const avatarGroupEl = element.shadowRoot.querySelector(
        "c-user-group-avatar-item"
      );
      expect(avatarGroupEl).toBeNull();
    });

    it("renders without the label when the variant is 'label-hidden'", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar", {
        is: UserGroupAvatar
      });
      element.recordId = "00Gxx0000004XXXXAA"; // Example Group Id
      element.variant = "label-hidden";

      // Act
      document.body.appendChild(element);

      getRecord.emit(GROUP_OBJECT);
      getGroupMembers.emit([
        {
          Id: "group-member-id-1",
          Name: "User One"
        }
      ]);

      await Promise.resolve();

      // Assert
      const avatarGroupEl = element.shadowRoot.querySelector(
        "c-user-group-avatar-item"
      );
      expect(avatarGroupEl).not.toBeNull();

      const labelEl = element.shadowRoot.querySelector("label");
      expect(labelEl).toBeNull();
    });

    it("should apply the retraction distance styles when retractionDistance is set", async () => {
      // Arrange
      const element = createElement("c-user-group-avatar", {
        is: UserGroupAvatar
      });
      element.recordId = "00Gxx0000004XXXXAA"; // Example Group Id
      element.retractionDistance = "large";

      // Act
      document.body.appendChild(element);

      getGroupMembers.emit([
        {
          Id: "group-member-id-1",
          Name: "User One"
        },
        {
          Id: "group-member-id-2",
          Name: "User Two"
        }
      ]);

      await Promise.resolve();

      getRecord.emit(GROUP_OBJECT);

      await Promise.resolve();

      // Assert
      const avatarItems = element.shadowRoot.querySelectorAll(
        "c-user-group-avatar-item"
      );
      expect(avatarItems.length).toBe(2);
      avatarItems.forEach((item) => {
        expect(Array.from(item.classList)).toContain(
          "avatar-item_distance-large"
        );
      });
    });
  });
});
