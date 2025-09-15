@IsTest
private class UserGroupAvatarControllerTest {
    @IsTest
    static void testGetGroupById() {
        // Test data setup
        Group g;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            g = new Group(
                Name = 'Test Group',
                DeveloperName = 'Test_Group',
                Type = 'Regular'
            );
            insert g;
        }

        // Actual test
        Test.startTest();
        Group result = UserGroupAvatarController.getGroupById(g.Id);
        Test.stopTest();

        // Asserts
        Assert.isNotNull(result, 'Group should not be null');
        Assert.areEqual('Test Group', result.Name, 'Group name should match');
    }

    @IsTest
    static void testGetGroupByName() {
        // Test data setup
        Group g;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            g = new Group(
                Name = 'Test Group',
                DeveloperName = 'Test_Group',
                Type = 'Regular'
            );
            insert g;
        }

        // Actual test
        Test.startTest();
        Group result = UserGroupAvatarController.getGroupByName('Test_Group');
        Test.stopTest();

        // Asserts
        Assert.isNotNull(result, 'Group should not be null');
        Assert.areEqual('Test Group', result.Name, 'Group name should match');
        Assert.areEqual(g.Id, result.Id, 'Group Id should match');
    }

    @IsTest
    static void testGetGroupMembers() {
        // Test data setup
        Group g;
        User u;
        GroupMember gm;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            g = new Group(
                Name = 'Test Group',
                DeveloperName = 'Test_Group',
                Type = 'Regular'
            );
            insert g;

            u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            gm = new GroupMember(GroupId = g.Id, UserOrGroupId = u.Id);
            insert gm;
        }

        // Actual test
        Test.startTest();
        List<GroupMember> membersById = UserGroupAvatarController.getGroupMembers(
            g.Id
        );
        List<GroupMember> membersByName = UserGroupAvatarController.getGroupMembers(
            'Test_Group'
        );
        Test.stopTest();

        // Asserts
        Assert.isNotNull(membersById, 'Members list should not be null');
        Assert.isNotNull(membersByName, 'Members list should not be null');
        Assert.areEqual(1, membersById.size(), 'There should be one member');
        Assert.areEqual(1, membersByName.size(), 'There should be one member');
        Assert.areEqual(
            u.Id,
            membersById[0].UserOrGroupId,
            'Member User Id should match'
        );
        Assert.areEqual(
            u.Id,
            membersByName[0].UserOrGroupId,
            'Member User Id should match'
        );

        // assert contents from the Members attribute in GroupInfo
        UserGroupAvatarController.GroupInfo groupInfoById = UserGroupAvatarController.getGroupInformation(
            g.Id
        );
        UserGroupAvatarController.GroupInfo groupInfoByName = UserGroupAvatarController.getGroupInformation(
            'Test_Group'
        );

        Assert.isNotNull(
            groupInfoById.Members,
            'Members attribute should not be null'
        );
        Assert.isNotNull(
            groupInfoByName.Members,
            'Members attribute should not be null'
        );
        Assert.areEqual(
            1,
            groupInfoById.Members.size(),
            'There should be one member in Members attribute'
        );
        Assert.areEqual(
            1,
            groupInfoByName.Members.size(),
            'There should be one member in Members attribute'
        );
        Assert.areEqual(
            u.Id,
            groupInfoById.Members[0].UserOrGroupId,
            'Member User Id in Members attribute should match'
        );
    }
}
