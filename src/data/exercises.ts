export type ExerciseGroup = {
  group: string;
  items: string[];
};

export const exerciseGroups: ExerciseGroup[] = [
  {
    group: "하체",
    items: ["스쿼트", "레그프레스", "레그컬", "레그익스텐션", "힙쓰러스트"],
  },
  {
    group: "가슴",
    items: ["벤치프레스", "플라이", "딥스"],
  },
  {
    group: "등",
    items: ["풀다운", "풀업", "로우"],
  },
  {
    group: "어깨",
    items: ["레터럴 레이즈", "리어 델트 플라이", "프론트 레이즈"],
  },
  {
    group: "팔",
    items: ["바이셉스 컬", "트라이셉스 푸시다운", "라잉 트라이셉스 익스텐션", "바벨 컬"],
  },
  {
    group: "복근",
    items: ["크런치", "행잉 레그레이즈"],
  },
];

export const allExercises = exerciseGroups.flatMap(g => g.items);
