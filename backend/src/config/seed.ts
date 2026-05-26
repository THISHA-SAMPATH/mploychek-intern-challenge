import User, { IUser } from '../models/user.model';
import Record, { IRecord } from '../models/record.model';

export interface SeedResult {
  createdUsers: number;
  repairedUsers: number;
  createdRecords: number;
  repairedRecords: number;
}

const seedData = async (): Promise<SeedResult> => {
  const result: SeedResult = {
    createdUsers: 0,
    repairedUsers: 0,
    createdRecords: 0,
    repairedRecords: 0,
  };

  try {
    const demoUsers: Array<Pick<
      IUser,
      | 'userId'
      | 'name'
      | 'email'
      | 'password'
      | 'role'
      | 'department'
      | 'verificationStatus'
      | 'isActive'
    >> = [
      {
        userId: 'USR001',
        name: 'Thisha Sampath',
        email: 'thisha@mploychek.com',
        password: 'password123',
        role: 'Admin',
        department: 'Engineering',
        verificationStatus: 'Verified',
        isActive: true,
      },
      {
        userId: 'USR002',
        name: 'Arun Kumar',
        email: 'arun@mploychek.com',
        password: 'password123',
        role: 'GeneralUser',
        department: 'Marketing',
        verificationStatus: 'InReview',
        isActive: true,
      },
      {
        userId: 'USR003',
        name: 'Priya Nair',
        email: 'priya@mploychek.com',
        password: 'password123',
        role: 'GeneralUser',
        department: 'Finance',
        verificationStatus: 'Pending',
        isActive: true,
      },
      {
        userId: 'USR004',
        name: 'Rahul Mehta',
        email: 'rahul@mploychek.com',
        password: 'password123',
        role: 'GeneralUser',
        department: 'Operations',
        verificationStatus: 'Flagged',
        isActive: true,
      },
      {
        userId: 'USR005',
        name: 'Sneha Iyer',
        email: 'sneha@mploychek.com',
        password: 'password123',
        role: 'GeneralUser',
        department: 'HR',
        verificationStatus: 'Verified',
        isActive: true,
      },
    ];

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ userId: demoUser.userId });
      if (!existingUser) {
        await User.create(demoUser);
        result.createdUsers += 1;
        continue;
      }

      existingUser.name = demoUser.name;
      existingUser.email = demoUser.email;
      existingUser.password = demoUser.password;
      existingUser.role = demoUser.role;
      existingUser.department = demoUser.department;
      existingUser.verificationStatus = demoUser.verificationStatus;
      existingUser.isActive = true;
      await existingUser.save();
      result.repairedUsers += 1;
    }

    console.log(
      result.createdUsers > 0 || result.repairedUsers > 0
        ? `Demo users ready: ${result.createdUsers} created, ${result.repairedUsers} repaired`
        : 'Demo users already ready...',
    );

    const demoRecords: Array<Pick<
      IRecord,
      'recordId' | 'userId' | 'type' | 'status' | 'details' | 'assignedTo'
    >> = [
      {
        recordId: 'REC001',
        userId: 'USR002',
        type: 'IdentityCheck',
        status: 'Verified',
        details: 'Aadhar and PAN verified successfully',
        assignedTo: 'USR001',
      },
      {
        recordId: 'REC002',
        userId: 'USR002',
        type: 'EmploymentCheck',
        status: 'InReview',
        details: 'Previous employer at Infosys being verified',
        assignedTo: 'USR001',
      },
      {
        recordId: 'REC003',
        userId: 'USR003',
        type: 'EducationCheck',
        status: 'Pending',
        details: 'B.Tech degree from Anna University pending verification',
        assignedTo: 'USR001',
      },
      {
        recordId: 'REC004',
        userId: 'USR004',
        type: 'CriminalCheck',
        status: 'Flagged',
        details: 'Discrepancy found in address history',
        assignedTo: 'USR001',
      },
      {
        recordId: 'REC005',
        userId: 'USR005',
        type: 'IdentityCheck',
        status: 'Verified',
        details: 'All identity documents verified',
        assignedTo: 'USR001',
      },
      {
        recordId: 'REC006',
        userId: 'USR002',
        type: 'EducationCheck',
        status: 'Pending',
        details: 'MBA from IIM Bangalore pending verification',
        assignedTo: 'USR001',
      },
    ];

    for (const demoRecord of demoRecords) {
      const existingRecord = await Record.findOne({ recordId: demoRecord.recordId });
      if (!existingRecord) {
        await Record.create(demoRecord);
        result.createdRecords += 1;
        continue;
      }

      existingRecord.userId = demoRecord.userId;
      existingRecord.type = demoRecord.type;
      existingRecord.status = demoRecord.status;
      existingRecord.details = demoRecord.details;
      existingRecord.assignedTo = demoRecord.assignedTo;
      await existingRecord.save();
      result.repairedRecords += 1;
    }

    console.log(
      result.createdRecords > 0 || result.repairedRecords > 0
        ? `Demo records ready: ${result.createdRecords} created, ${result.repairedRecords} repaired`
        : 'Demo records already ready...',
    );
    console.log('Seed complete!');

  } catch (error) {
    console.error('Seed error:', error);
  }

  return result;
};

export default seedData;
