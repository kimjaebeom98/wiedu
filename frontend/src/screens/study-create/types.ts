import { StudyCreateData, Category, CurriculumItem } from '../../types/study';

// Shared updater type used across all step components
export type UpdateData = <K extends keyof StudyCreateData>(
  key: K,
  value: StudyCreateData[K],
) => void;

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export interface Step1Props {
  data: StudyCreateData;
  updateData: UpdateData;
  categories: Category[];
  categoriesLoading: boolean;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export interface Step2Props {
  data: StudyCreateData;
  updateData: UpdateData;
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export interface Step3Props {
  data: StudyCreateData;
  updateData: UpdateData;
  toggleDay: (day: string) => void;
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

export interface Step4Props {
  data: StudyCreateData;
  updateData: UpdateData;
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

export interface Step5Props {
  data: StudyCreateData;
  addCurriculum: () => void;
  updateCurriculum: (index: number, field: keyof CurriculumItem, value: string | number) => void;
  removeCurriculum: (index: number) => void;
  addRule: () => void;
  updateRule: (index: number, value: string) => void;
  removeRule: (index: number) => void;
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

export interface Step6Props {
  data: StudyCreateData;
  categories: Category[];
}
