/**
 * Seed data for courses. References seeded teachers. Idempotent: only inserted when Course table is empty.
 */
const TEACHER_1_ID = 'a1000000-0000-4000-8000-000000000001';
const TEACHER_2_ID = 'a1000000-0000-4000-8000-000000000002';

export const coursesSeedData = [
  { id: 'b2000000-0000-4000-8000-000000000001', title: 'Mathematics 101', code: 'MATH101', teacherId: TEACHER_1_ID },
  { id: 'b2000000-0000-4000-8000-000000000002', title: 'Physics 101', code: 'PHYS101', teacherId: TEACHER_1_ID },
  { id: 'b2000000-0000-4000-8000-000000000003', title: 'Introduction to Programming', code: 'CS101', teacherId: TEACHER_2_ID },
  { id: 'b2000000-0000-4000-8000-000000000004', title: 'Database Systems', code: 'CS201', teacherId: TEACHER_2_ID },
];
