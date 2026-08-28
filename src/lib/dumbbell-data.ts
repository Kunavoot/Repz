export interface DumbbellPlateCombination {
  weight: number;
  barWeight: number;
  platesDescription: string;
  platesSummary: string;
  isFull: boolean;
}

export const DUMBBELL_COMBINATIONS: DumbbellPlateCombination[] = [
  {
    weight: 0.5,
    barWeight: 0.5,
    platesDescription: "แกนเปล่า (ไม่ใส่แผ่น)",
    platesSummary: "แกนเปล่า",
    isFull: false,
  },
  {
    weight: 3.0,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.25 kg × 2 (ข้างละ 1.25 kg)",
    platesSummary: "1.25 kg × 2",
    isFull: false,
  },
  {
    weight: 3.5,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.5 kg × 2 (ข้างละ 1.5 kg)",
    platesSummary: "1.5 kg × 2",
    isFull: false,
  },
  {
    weight: 4.5,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 2.0 kg × 2 (ข้างละ 2.0 kg)",
    platesSummary: "2.0 kg × 2",
    isFull: false,
  },
  {
    weight: 6.0,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.25 kg × 2 + แผ่น 1.5 kg × 2",
    platesSummary: "1.25kg + 1.5kg",
    isFull: false,
  },
  {
    weight: 7.0,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.25 kg × 2 + แผ่น 2.0 kg × 2",
    platesSummary: "1.25kg + 2.0kg",
    isFull: false,
  },
  {
    weight: 7.5,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.5 kg × 2 + แผ่น 2.0 kg × 2",
    platesSummary: "1.5kg + 2.0kg",
    isFull: false,
  },
  {
    weight: 10.0,
    barWeight: 0.5,
    platesDescription: "แกน 0.5 + แผ่น 1.25kg × 2 + 1.5kg × 2 + 2.0kg × 2 (ใส่ครบทุกแผ่น)",
    platesSummary: "ใส่ครบทุกแผ่น (Max)",
    isFull: true,
  },
];

export function getDumbbellSetup(weight: number): DumbbellPlateCombination | undefined {
  return DUMBBELL_COMBINATIONS.find((c) => Math.abs(c.weight - weight) < 0.01);
}
