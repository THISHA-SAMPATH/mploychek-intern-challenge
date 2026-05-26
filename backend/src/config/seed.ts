import User from '../models/user.model';
import Record from '../models/record.model';

const seedData = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    // Create Users
    const users = await User.create([
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
    ]);

    console.log(`Created ${users.length} users`);

    // Create Records
    const records = await Record.create([
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
    ]);

    console.log(`Created ${records.length} records`);
    console.log('Seed complete!');

  } catch (error) {
    console.error('Seed error:', error);
  }
};

export default seedData;
