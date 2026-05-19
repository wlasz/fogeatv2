// Цепочки ачивок — показывается только текущий шаг
export const ACHIEVEMENT_CHAINS = [
  {chain:"venues",steps:[
    {k:"venues_10",n:"Исследователь",i:"🔍",d:"Открыть 10 заведений",t:10},
    {k:"venues_25",n:"Картограф",i:"🗺️",d:"Открыть 25 заведений",t:25},
    {k:"venues_50",n:"Охотник",i:"🏹",d:"Открыть 50 заведений",t:50},
    {k:"venues_all",n:"Покоритель",i:"🏆",d:"Открыть все 91 заведение",t:91},
  ]},
  {chain:"checkins",steps:[
    {k:"checkins_10",n:"Гурман",i:"🍽️",d:"Сделать 10 чекинов",t:10},
    {k:"checkins_25",n:"Завсегдатай",i:"🎯",d:"Сделать 25 чекинов",t:25},
    {k:"checkins_50",n:"Легенда",i:"👑",d:"Сделать 50 чекинов",t:50},
  ]},
  {chain:"photos",steps:[
    {k:"photos_5",n:"Фотограф",i:"📸",d:"5 чекинов с фото",t:5},
    {k:"photos_10",n:"Паппарацци",i:"📷",d:"10 чекинов с фото",t:10},
  ]},
  {chain:"cat_rest",steps:[
    {k:"cat_rest_3",n:"Ресторанный",i:"🏛️",d:"Посетить 3 ресторана",t:3},
    {k:"cat_rest_5",n:"Ресторатор",i:"🥂",d:"Посетить 5 ресторанов",t:5},
  ]},
  {chain:"cat_hink",steps:[
    {k:"cat_hink_1",n:"Любитель хинкали",i:"🥟",d:"Посетить хинкальную",t:1},
    {k:"cat_hink_3",n:"Хинкальщик",i:"🥟",d:"Посетить 3 хинкальных",t:3},
  ]},
  // одиночные
  {chain:"all_cats",steps:[{k:"all_cats",n:"Всеядный",i:"🌈",d:"Посетить все категории заведений",t:9}]},
  {chain:"custom",steps:[{k:"custom_5",n:"Разведчик",i:"🧭",d:"Добавить 5 своих заведений",t:5}]},
  {chain:"reviews",steps:[{k:"reviews_10",n:"Критик",i:"✍️",d:"10 отзывов с текстом",t:10}]},
  {chain:"wishlist",steps:[{k:"wishlist_5",n:"Мечтатель",i:"📌",d:"Добавить 5 мест в вишлист",t:5}]},
  {chain:"five_stars",steps:[{k:"five_stars_5",n:"Перфекционист",i:"⭐",d:"Поставить 5★ пять раз",t:5}]},
  {chain:"honest",steps:[{k:"honest_critic",n:"Честный критик",i:"😤",d:"Поставить ниже 3★ три раза",t:3}]},
  {chain:"cat_bar",steps:[{k:"cat_bar",n:"Завсегдатай баров",i:"🍺",d:"Посетить 3 бара",t:3}]},
  {chain:"cat_sushi",steps:[{k:"cat_sushi",n:"Суши-мастер",i:"🍣",d:"Посетить суши-бар",t:1}]},
  {chain:"early_bird",steps:[{k:"early_bird",n:"Ранняя пташка",i:"🌅",d:"Чекин до 10:00 утра",t:1}]},
  {chain:"night_owl",steps:[{k:"night_owl",n:"Сова",i:"🦉",d:"Чекин после 23:00",t:1}]},
];

export const getAchievementProgress = (key, {
  visitedIds,
  checkins,
  allVenues,
  customVenues,
  wishVenues,
}) => {
  const visitedCount = visitedIds.size;
  const categoryCount = new Set(
    checkins.map((checkin) => allVenues.find((venue) => venue.id === checkin.venueId)?.c).filter(Boolean),
  ).size;

  if (key === "venues_10" || key === "venues_25" || key === "venues_50" || key === "venues_all") return visitedCount;
  if (key === "all_cats") return categoryCount;
  if (key === "custom_5") return customVenues.filter((venue) => !venue.deleted).length;
  if (key === "checkins_10" || key === "checkins_25" || key === "checkins_50") return checkins.length;
  if (key === "photos_5" || key === "photos_10") return checkins.filter((checkin) => checkin.photoKey).length;
  if (key === "reviews_10") return checkins.filter((checkin) => checkin.review && checkin.review.length > 2).length;
  if (key === "wishlist_5") return wishVenues.length;
  if (key === "five_stars_5") return checkins.filter((checkin) => checkin.rating === 5).length;
  if (key === "honest_critic") return checkins.filter((checkin) => checkin.rating > 0 && checkin.rating < 3).length;
  if (key === "cat_rest_3" || key === "cat_rest_5") {
    return new Set(
      checkins
        .filter((checkin) => allVenues.find((venue) => venue.id === checkin.venueId)?.c === "Ресторан")
        .map((checkin) => checkin.venueId),
    ).size;
  }
  if (key === "cat_bar") {
    return new Set(
      checkins
        .filter((checkin) => ["Бар", "Бар/караоке", "Винный бар"].includes(allVenues.find((venue) => venue.id === checkin.venueId)?.c))
        .map((checkin) => checkin.venueId),
    ).size;
  }
  if (key === "cat_sushi") return checkins.filter((checkin) => allVenues.find((venue) => venue.id === checkin.venueId)?.c === "Суши-бар").length;
  if (key === "cat_hink_1" || key === "cat_hink_3") {
    return new Set(
      checkins
        .filter((checkin) => allVenues.find((venue) => venue.id === checkin.venueId)?.c === "Хинкальная")
        .map((checkin) => checkin.venueId),
    ).size;
  }
  if (key === "early_bird") return checkins.filter((checkin) => {
    const hour = parseInt(checkin.time?.split(":")[0] || "12");
    return hour < 10;
  }).length > 0 ? 1 : 0;
  if (key === "night_owl") return checkins.filter((checkin) => {
    const hour = parseInt(checkin.time?.split(":")[0] || "12");
    return hour >= 23;
  }).length > 0 ? 1 : 0;

  return 0;
};

export const buildAchievementState = (chains, context) =>
  chains.map((chain) => {
    let activeStep = chain.steps[0];

    for (const step of chain.steps) {
      const progress = getAchievementProgress(step.k, context);
      if (progress >= step.t) {
        const next = chain.steps[chain.steps.indexOf(step) + 1];
        if (next) activeStep = next;
        else {
          activeStep = { ...step, p: step.t, ok: true };
          break;
        }
      } else {
        activeStep = step;
        break;
      }
    }

    const progress = getAchievementProgress(activeStep.k, context);
    return { ...activeStep, p: Math.min(progress, activeStep.t), ok: progress >= activeStep.t };
  });
