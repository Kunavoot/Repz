export const MUSCLE_GROUPS = [
  { value: "Chest", label: "หน้าอก (Chest)", subMuscles: "อกบน, อกรวม, Triceps" },
  { value: "Back", label: "หลัง & ปีก (Back & Lats)", subMuscles: "หลังรวม, ปีก (Lats), หลังส่วนบน" },
  { value: "Shoulders", label: "หัวไหล่ (Shoulders)", subMuscles: "ไหล่หน้า, ไหล่ข้าง, ไหล่หลัง" },
  { value: "Arms", label: "แขน (Arms)", subMuscles: "หน้าแขน (Biceps), หลังแขน (Triceps)" },
  { value: "Legs", label: "ช่วงขา & สะโพก (Legs & Glutes)", subMuscles: "ต้นขาหน้า (Quads), หลังขา (Hamstrings), ก้น (Glutes)" },
  { value: "Core", label: "แกนกลางลำตัว & หน้าท้อง (Core & Abs)", subMuscles: "หน้าท้องรวม, แกนกลางลำตัว" },
  { value: "Full Body", label: "ทั้งตัว (Full Body)", subMuscles: "ผสมหลายส่วน" },
] as const;

export const EQUIPMENT_TYPES = [
  { value: "dumbbell", label: "ดัมเบล (Dumbbell)" },
  { value: "bodyweight", label: "น้ำหนักตัว (Bodyweight)" },
  { value: "barbell", label: "บาร์เบล (Barbell)" },
  { value: "cable", label: "เคเบิล (Cable)" },
  { value: "machine", label: "เครื่องแมชชีน (Machine)" },
  { value: "chair_dip", label: "เก้าอี้ / บาร์ดริป (Bench/Chair)" },
  { value: "other", label: "อื่นๆ (Other)" },
] as const;

export const SPLIT_CODES = [
  { code: "PUSH", name: "Push Day", thaiName: "วัน Push (อก, ไหล่, หลังแขน)" },
  { code: "PULL", name: "Pull Day", thaiName: "วัน Pull (หลัง, หน้าแขน)" },
  { code: "LEGS_CORE", name: "Legs & Core", thaiName: "วัน Legs & Core (ขา, ก้น, ท้อง)" },
  { code: "UPPER", name: "Upper Body", thaiName: "วัน Upper (ช่วงบนทั้งตัว)" },
  { code: "LOWER", name: "Lower Body", thaiName: "วัน Lower (ช่วงล่างทั้งตัว)" },
  { code: "FULL_BODY", name: "Full Body", thaiName: "วัน Full Body (ออกกำลังกายทั้งตัว)" },
  { code: "CUSTOM", name: "Custom Day", thaiName: "วันฝึกกำหนดเอง" },
] as const;
