export interface Project {
  id: number;
  name: string;
  client: string;
  type: string;
  status: string;
  entries: number;
  session?: string;
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
