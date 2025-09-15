/**
 * @description Controller class for UserGroupAvatar LWC component.
 * This class provides methods to retrieve Group records by Id or Name.
 */
@SuppressWarnings('PMD.ApexCRUDViolation')
public without sharing class UserGroupAvatarController {
    /**
     * @description Retrieves a Group record by its Id.
     * @param groupId The Id of the Group to retrieve.
     * @return The Group record with the specified Id.
     */
    @AuraEnabled(cacheable=true)
    public static Group getGroupById(Id groupId) {
        try {
            return [
                SELECT Id, DeveloperName, Name, Description, Type, OwnerId
                FROM Group
                WHERE Id = :groupId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Retrieves a Group record by its name.
     * @param groupName The name of the Group to retrieve.
     * @return The Group record with the specified name.
     */
    @AuraEnabled(cacheable=true)
    public static Group getGroupByName(String groupName) {
        try {
            return [
                SELECT Id, DeveloperName, Name, Description, Type, OwnerId
                FROM Group
                WHERE DeveloperName = :groupName
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Retrieves Group information along with its members by Group Id or Name.
     * @param groupIdOrName The Id or Name of the Group to retrieve information for.
     * @return A GroupInfo object containing Group details and its members.
     */
    @AuraEnabled(cacheable=true)
    public static GroupInfo getGroupInformation(String groupIdOrName) {
        try {
            if (groupIdOrName == null) {
                throw new AuraHandledException(
                    'Group Id or Name must be provided.'
                );
            }

            List<GroupMember> groupMembers = getGroupMembers(groupIdOrName);

            if (groupIdOrName.startsWith('00G')) {
                Group g = getGroupById(Id.valueOf(groupIdOrName));
                return new GroupInfo(
                    g.Id,
                    g.Name,
                    g.Description,
                    g.Type,
                    g.OwnerId,
                    groupMembers
                );
            } else {
                Group g = getGroupByName(groupIdOrName);
                return new GroupInfo(
                    g.Id,
                    g.Name,
                    g.Description,
                    g.Type,
                    g.OwnerId,
                    groupMembers
                );
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Retrieves members of a Group by its Id or Name.
     * @param groupIdOrName The Id or Name of the Group to retrieve members for.
     * @return A list of GroupMember records who are members of the specified Group.
     */
    @AuraEnabled(cacheable=true)
    public static List<GroupMember> getGroupMembers(String groupIdOrName) {
        try {
            if (String.isBlank(groupIdOrName)) {
                throw new AuraHandledException(
                    'Group Id or Name must be provided.'
                );
            }

            List<GroupMember> groupMembers = [
                SELECT
                    TYPEOF UserOrGroup
                        WHEN User THEN Id, Name, Email, SmallPhotoUrl
                        WHEN Group THEN Id, DeveloperName, Name, OwnerId
                    END
                FROM GroupMember
                WHERE
                    GroupId = :groupIdOrName
                    OR Group.DeveloperName = :groupIdOrName
            ];

            return groupMembers;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Retrieves the SmallPhotoUrl of a User by their Id.
     * @param memberId The Id of the User to retrieve the SmallPhotoUrl for.
     * @return The SmallPhotoUrl of the specified User, or null if not a User
     */
    @AuraEnabled(cacheable=true)
    public static String getMemberPictureUrl(Id memberId) {
        try {
            if (memberId == null) {
                throw new AuraHandledException('Member Id must be provided.');
            }

            if (memberId.getSobjectType() != User.SObjectType) {
                return null;
            }

            User u = [
                SELECT SmallPhotoUrl
                FROM User
                WHERE Id = :memberId
                LIMIT 1
            ];

            return u.SmallPhotoUrl;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Wrapper class for Group information.
     */
    public class GroupInfo {
        @AuraEnabled
        public Id Id { get; set; }
        @AuraEnabled
        public String Name { get; set; }
        @AuraEnabled
        public String Description { get; set; }
        @AuraEnabled
        public String Type { get; set; }
        @AuraEnabled
        public Id OwnerId { get; set; }
        @AuraEnabled
        public List<GroupMember> Members { get; set; }

        public GroupInfo(
            Id id,
            String name,
            String description,
            String type,
            Id ownerId,
            List<GroupMember> members
        ) {
            this.Id = id;
            this.Name = name;
            this.Description = description;
            this.Type = type;
            this.OwnerId = ownerId;
            this.Members = members;
        }
    }
}
