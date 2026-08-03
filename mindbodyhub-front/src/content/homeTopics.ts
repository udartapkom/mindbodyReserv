export type HomeTopic = {
  id: string;
  title: string;
  description: string;
};

/** Тематические якоря для SEO и перелинковки на каталог решений. */
export const homeTopics: HomeTopic[] = [
  {
    id: "anxiety",
    title: "Тревога",
    description: "Понять триггеры и собрать рабочие опоры на каждый день.",
  },
  {
    id: "burnout",
    title: "Выгорание",
    description: "Вернуть ресурс и границы, когда сил почти не осталось.",
  },
  {
    id: "relationships",
    title: "Отношения",
    description: "Границы, близость и сложные ситуации без готовых рецептов.",
  },
  {
    id: "self-esteem",
    title: "Самооценка",
    description: "Опора на себя вместо бесконечного сравнения с другими.",
  },
  {
    id: "health",
    title: "Здоровье",
    description: "Психология тела и привычек — бережно и по делу.",
  },
  {
    id: "business",
    title: "Бизнес и работа",
    description: "Стресс, решения и устойчивость в профессиональной жизни.",
  },
];
