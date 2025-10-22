import type { JwtPayload } from "jwt-decode";

export interface User{
    email?: string;
    role: string;
    id?: string;
    userId: string;
    username?: string;
    name?: string;
}

export interface CustomJwtPayload extends JwtPayload{
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":string,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":string,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string
    exp: number,
    iss: string;
    aud: string
}

export interface Course{
    id: string;
    courseCode: string;
    title: string;
    imageURL: string
}

export interface Section{
    id: string;
    sectionId?: string;
    courseId?: string;
    courseID?: string;
    course: Course;
    sectionCode: string;
    instructorID?: string;
    InstructorID?: string;
    isActive?: boolean;
    active?: boolean;
    imageURL?: string;
    courseCode?: string;
    title?: string;
}
export interface Assignment{
    id: string;
    name: string;
    sectionId?: string;
    sectionID?: string;
    section?: Section;
    description: string;
    isActive: boolean;
    dueDate: string;
    submissions?: Array<Submission>;
    submissionLimit: number;
    requiresFileSubmission: boolean;
}

export interface Submission{
    id: string;
    studentId: string;
    assignmentId: string;
    submissionFilename?: string;
    comments?: string;
    studentName?: string;
}
export interface Announcement{
    id: string;
    section?: Section;
    sectionID: string;
    title: string;
    description: string;
}