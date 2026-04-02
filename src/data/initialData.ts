import { Project, Config } from '../types';

export const initialProjects: Project[] = [
    { id: 1, name: "St. Xavier's 2026 Session", client: "St. Xavier's High School", type: "School", status: "Active", entries: 1250 },
    { id: 2, name: "TechCorp Employee IDs", client: "TechCorp India", type: "Company", status: "Draft", entries: 400 },
    { id: 3, name: "Allen Batch B", client: "Allen Coaching", type: "Coaching", status: "Active", entries: 3500 },
    { id: 4, name: "Summit 2026 Badges", client: "Global Summit", type: "Event", status: "Completed", entries: 800 },
    { id: 5, name: "Delhi Public School Q1", client: "DPS Delhi", type: "School", status: "Print Ready", entries: 2100 },
];

export const initialConfig: Config = {
    projectTypes: [
        { id: "school", name: "School" },
        { id: "college", name: "College" },
        { id: "company", name: "Company/Corporate" },
        { id: "event", name: "Event/Conference" }
    ],
    entityTypes: [
        { id: 1, projectTypeId: "school", name: "Student", isActive: true },
        { id: 2, projectTypeId: "school", name: "Staff", isActive: true },
        { id: 3, projectTypeId: "college", name: "Student", isActive: true },
        { id: 4, projectTypeId: "college", name: "Faculty", isActive: true },
        { id: 5, projectTypeId: "company", name: "Employee", isActive: true },
        { id: 6, projectTypeId: "company", name: "Visitor", isActive: true },
        { id: 7, projectTypeId: "event", name: "Attendee", isActive: true },
        { id: 8, projectTypeId: "event", name: "Exhibitor", isActive: true }
    ],
    fields: [
        { id: 1, entityId: 1, label: "Name", key: "name", type: "text", required: true },
        { id: 2, entityId: 1, label: "Roll Number", key: "roll_no", type: "number", required: true },
        { id: 3, entityId: 1, label: "Class", key: "class", type: "dropdown", required: true, options: ["8", "9", "10", "11", "12"] },
        { id: 4, entityId: 1, label: "Section", key: "section", type: "dropdown", required: true, options: ["A", "B", "C"] },
        { id: 5, entityId: 1, label: "Date of Birth", key: "dob", type: "date", required: true },
        { id: 6, entityId: 1, label: "Photo", key: "photo", type: "photo", required: true },
        { id: 7, entityId: 2, label: "Name", key: "name", type: "text", required: true },
        { id: 8, entityId: 2, label: "Employee ID", key: "employee_id", type: "text", required: true },
        { id: 9, entityId: 2, label: "Department", key: "department", type: "dropdown", required: true, options: ["Teaching", "Admin", "Support"] },
        { id: 10, entityId: 2, label: "Photo", key: "photo", type: "photo", required: true },
        { id: 11, entityId: 5, label: "Employee Name", key: "name", type: "text", required: true },
        { id: 12, entityId: 5, label: "Employee ID", key: "emp_id", type: "text", required: true },
        { id: 13, entityId: 5, label: "Designation", key: "designation", type: "text", required: true },
        { id: 14, entityId: 5, label: "Blood Group", key: "blood_group", type: "dropdown", required: true, options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
        { id: 15, entityId: 5, label: "Photo", key: "photo", type: "photo", required: true }
    ]
};
