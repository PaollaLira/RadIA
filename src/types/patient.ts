export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  cpf?: string;
  birthDate?: string;
}
