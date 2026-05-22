export interface QuizData {
  // ─── Profile ───
  age: string;
  gender: string;
  height: string;        // cm
  weight: string;        // kg

  // ─── Goals (multi-select) ───
  goals: string[];

  // ─── Sleep ───
  sleep: number;         // 1-5
  sleepHours: string;
  sleepIssues: string[]; // multi-select, optional

  // ─── Mind ───
  stress: number;        // 1-5
  mood: number;          // 1-5
  mindConcerns: string[]; // multi-select, optional

  // ─── Energy ───
  energy: number;        // 1-5
  afternoonCrash: string;

  // ─── Movement ───
  workoutFreq: string;
  workoutType: string;

  // ─── Diet & habits ───
  diet: string;
  caffeine: string;
  alcohol: string;

  // ─── Body concerns ───
  bodyConcerns: string[]; // multi-select, optional

  // ─── Health & safety ───
  pregnant: string;       // "yes" | "no" | "n/a"
  allergies: string[];    // multi-select
  conditions: string[];   // multi-select

  // ─── Preferences ───
  budget: string;
  veganOnly: boolean;
}
