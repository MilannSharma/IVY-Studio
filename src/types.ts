export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'printer' | 'client';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold' | 'initialized';
  stage: 'Active' | 'Inactive';
  clientId: string;
  printerId?: string;
  createdAt: any; // Firestore Timestamp
  deadline?: any; // Firestore Timestamp
  type?: string; // For backward compatibility if needed
  client?: string; // For backward compatibility if needed
  entries?: number; // For backward compatibility if needed
}

export interface ProjectType {
  id: string;
  name: string;
}

export interface EntityType {
  id: number;
  projectTypeId: string;
  name: string;
  isActive: boolean;
}

export interface Field {
  id: number;
  entityId: number;
  label: string;
  key: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface Config {
  projectTypes: ProjectType[];
  entityTypes: EntityType[];
  fields: Field[];
}
