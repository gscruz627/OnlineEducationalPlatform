## Online Educational Platform

This project uses C#, ASP.NET Core, Entity Framework + React, Typescript to create a web application which lets admins create instructors, students and courses, assign instructors to courses and create sections from courses.
Also students can freely enroll and submit assignments and see announcements from their instructors

## Stack
- Languages: C#, Typescript
- Framework: ASP.NET Core, React
- Deployment: Docker with Render.com and Netlify
- Database: Postgres DB
- State Management: Local Storage with Valtio for mutable state and Snapshot

## Application Flow
- Users register and login and receive access tokens
- Access tokens (Json web tokens) are refreshed with a Refresh Token
- Admins can create students, instructors, courses, sections
- Instructors can create announcements and assigments for their courses
- Students can see announcements, enroll in courses, and make assignment submissions

## Images
- Creating a course
<img width="400" alt="Creating a Course" src="https://github.com/user-attachments/assets/8b0ad332-30d7-4d67-8dbd-c12723a52eeb" />

- My Courses Page
<img width="400" alt="My Courses Page" src="https://github.com/user-attachments/assets/c14dc9c8-80f1-42ae-9e26-a3ef4ea906c9" />

- Student Assignment Submission Page
<img width="400" alt="Student Assignment Submission Page" src="https://github.com/user-attachments/assets/936a1794-5480-4fcb-823f-57cecdfce0b2" />
