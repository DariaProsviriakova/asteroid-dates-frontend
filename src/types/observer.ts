export interface RegisterObserver {
  fullName: string;
  email: string;
  password: string;
}

export interface Observer {
  id: number;
  fullName: string;
  email: string;
}

export interface RegistrationFields extends RegisterObserver { confirmPassword: string }
export type RegistrationErrors = Partial<Record<keyof RegistrationFields, string>>;
