import { useState, useEffect, useRef, useCallback } from "react";

const V=[
{id:1,n:"Cuprum",c:"Ресторан",s:"Европейская",a:"ул. Коцоева, 75",i:"🏛️",r:4.5,rc:197,ig:"cuprum_restaurant",lat:43.0268,lng:44.6744},
{id:2,n:"Dan",c:"Ресторан",s:"Итал./авторская",a:"ул. Баллаева, 16",i:"🏛️",r:4.5,rc:37,ig:"dan.restaurant",lat:43.0322,lng:44.6781},
{id:3,n:"Deva Cafe",c:"Ресторан",s:"Гастро",a:"ул. Коцоева, 81",i:"🏛️",r:4.3,rc:13,ig:"deva__cafe",lat:43.0294,lng:44.6734},
{id:4,n:"KoYROI",c:"Ресторан",s:"Осетинская",a:"ул. Коцоева, 26",i:"🏛️",r:4.4,rc:503,ig:"restoran_koyroi",lat:43.0224,lng:44.6782,dishes:[{id:101,nm:"Фыджин",tg:"Пироги",rt:4.8,pr:400,ph:"🫓",rv:18},{id:102,nm:"Форель на гриле",tg:"Рыба",rt:4.7,pr:650,ph:"🐟",rv:12},{id:103,nm:"Салат с грушей",tg:"Салаты",rt:4.9,pr:380,ph:"🥗",rv:8}]},
{id:7,n:"Prato Café",c:"Ресторан",s:"Итальянская",a:"ул. Революции, 18",i:"🏛️",r:4.5,rc:32,lat:43.0285,lng:44.6838},
{id:8,n:"Premier",c:"Ресторан",s:"Европейская",a:"ул. Пашковского, 2а",i:"🏛️",r:4.5,rc:106,ig:"premier_vld",lat:43.0319,lng:44.6724},
{id:9,n:"Syndicate",c:"Ресторан",s:"Авторская",a:"пр. Мира, 41",i:"🏛️",r:4.4,rc:176,ig:"syndicate.vld",lat:43.0327,lng:44.6798},
{id:10,n:"Vershina 5033",c:"Ресторан",s:"Европ./кавк.",a:"пр. Мира, 10",i:"🏛️",r:3.4,rc:60,ig:"vershina5033",lat:43.0283,lng:44.6812},
{id:11,n:"Бавария",c:"Ресторан",s:"Немецкая",a:"ул. Цаликова, 25",i:"🏛️",r:4.5,rc:836,ig:"bavaria_restaurant_",lat:43.0534,lng:44.6733},
{id:12,n:"Верди",c:"Ресторан",s:"Итальянская",a:"ул. Коцоева, 73а",i:"🏛️",r:4.7,rc:15,ig:"verdi_vld",lat:43.0264,lng:44.6745},
{id:15,n:"Дендрарий",c:"Ресторан",s:"Европ./кавк.",a:"Московское шоссе",i:"🏛️",r:4.4,rc:1893,ig:"dendrarium_vld",lat:42.98,lng:44.6676},
{id:16,n:"Къона",c:"Ресторан",s:"Нац. осетинская",a:"пр. Коста, 258",i:"🏛️",r:4.6,rc:494,ig:"kona_ir",lat:43.045,lng:44.6589,dishes:[{id:201,nm:"Лывжа",tg:"Мясо",rt:4.7,pr:450,ph:"🍖",rv:22},{id:202,nm:"Уалибах",tg:"Пироги",rt:4.8,pr:350,ph:"🫓",rv:19},{id:203,nm:"Дзыкка",tg:"Закуски",rt:4.5,pr:280,ph:"🧀",rv:10}]},
{id:17,n:"Лимончелло",c:"Ресторан",s:"Итальянская",a:"пр. Мира, 45",i:"🏛️",r:4.4,rc:882,ig:"limoncello_vladikavkaz",lat:43.0332,lng:44.6798,dishes:[{id:401,nm:"Пицца 4 сезона",tg:"Пицца",rt:4.3,pr:550,ph:"🍕",rv:30},{id:402,nm:"Сицилийские креветки",tg:"Рыба",rt:4.6,pr:620,ph:"🦐",rv:12}]},
{id:18,n:"Ман&Гал",c:"Ресторан",s:"Мясной",a:"ул. Ватутина, 50",i:"🏛️",r:4.6,rc:628,ig:"mangal.vld",lat:43.028,lng:44.691,dishes:[{id:301,nm:"Фыджин",tg:"Пироги",rt:4.9,pr:380,ph:"🫓",rv:25},{id:302,nm:"Саджи",tg:"Мясо",rt:4.7,pr:1200,ph:"🍖",rv:18}]},
{id:19,n:"Минас",c:"Ресторан",s:"Кавк./шашлык",a:"ул. Барбашова, 76",i:"🏛️",r:4.4,rc:692,ig:"minas__cafe",lat:43.0256,lng:44.6384},
{id:20,n:"Папа Жора",c:"Ресторан",s:"Шашлык",a:"пр. Доватора, 4",i:"🏛️",r:4.6,rc:222,ig:"tractir_vld",lat:43.0149,lng:44.6624},
{id:21,n:"Lookoom",c:"Ресторан",s:"Восточная",a:"пр. Мира, 35",i:"🏛️",r:4.4,rc:1081,ig:"lookoom_vld",lat:43.0313,lng:44.6801},
{id:23,n:"Шёлковый путь",c:"Ресторан",s:"Кавказская",a:"пр. Коста, 2",i:"🏛️",r:4.5,rc:303,ig:"shelkoviy_put_",lat:42.9703,lng:44.6676},
{id:24,n:"Bruges",c:"Ресторан",s:"Паб",a:"ул. Васо Абаева, 108/2",i:"🏛️",r:3.7,rc:23,ig:"bruges_brasserie",lat:43.0465,lng:44.6597},
{id:26,n:"Коралл",c:"Ресторан",s:"Кавказская",a:"пр. Коста, 274",i:"🏛️",r:4.4,rc:42,ig:"korall_rest",lat:43.0496,lng:44.6558},
{id:27,n:"Лимон True Cost",c:"Ресторан",s:"True cost",a:"ул. Гриса Плиева, 11",i:"🏛️",r:4.8,rc:0,ig:"limon_restaurant_vld",lat:43.0195,lng:44.675},
{id:28,n:"Модерн шеф",c:"Ресторан",s:"",a:"ул. Весенняя, 21а",i:"🏛️",r:5.0,rc:0,ig:"modern_chef_vld",lat:43.047,lng:44.6273},
{id:29,n:"Позитано",c:"Ресторан",s:"Итальянская",a:"пр. Мира, 6",i:"🏛️",r:4.9,rc:0,ig:"positano_osteria",lat:43.0265,lng:44.681},
{id:30,n:"Регах",c:"Ресторан",s:"Загород",a:"Архонское шоссе, 5",i:"🏛️",r:4.4,rc:140,ig:"regah_restaurant",lat:43.0629,lng:44.6334},
{id:31,n:"Этно",c:"Ресторан",s:"Кавказская",a:"ул. Сады Шалдона, 59",i:"🏛️",r:5.0,rc:0,ig:"etno_vld",lat:43.0397,lng:44.7001},
{id:32,n:"Amalfi",c:"Кафе",s:"Осетинская",a:"ул. Барбашова, 2",i:"☕",r:5.0,rc:6,ig:"amalfi_cafe_",lat:43.0307,lng:44.6669},
{id:33,n:"Luxe Cafe",c:"Кафе",s:"Фастфуд",a:"пр. Доватора, 8а",i:"☕",r:4.4,rc:534,lat:43.0163,lng:44.6612},

{id:35,n:"Y'Remy",c:"Кафе",s:"",a:"ул. Цоколаева, 14а",i:"☕",r:5.0,rc:0,ig:"yremy.rest",lat:43.039,lng:44.6302},
{id:36,n:"Два Толстяка",c:"Кафе",s:"Хинкали",a:"ул. Б. Ватаева, 59",i:"☕",r:4.4,rc:457,ig:"kafe_dva_tolstyaka",lat:43.033,lng:44.6703},
{id:38,n:"М&М Хачапурня",c:"Кафе",s:"Хачапури",a:"ул. Коцоева, 19",i:"☕",r:4.5,rc:70,lat:43.0207,lng:44.6786},
{id:39,n:"Магия",c:"Кафе",s:"Завтраки",a:"ул. Горького, 9",i:"☕",r:4.5,rc:620,lat:43.0281,lng:44.6794},
{id:40,n:"Октябрь",c:"Кафе",s:"Европейская",a:"пр. Мира, 1",i:"☕",r:4.3,rc:691,ig:"october__cafe_",lat:43.0242,lng:44.6808},
{id:41,n:"Старый мост",c:"Кафе",s:"Домашняя",a:"ул. Пашковского, 2",i:"☕",r:4.4,rc:319,lat:43.0319,lng:44.6724},
{id:42,n:"Суадон",c:"Кафе",s:"Кавказская",a:"север города",i:"☕",r:4.5,rc:617,lat:43.059,lng:44.6408},
{id:43,n:"Фыдджынта",c:"Кафе",s:"Пироги",a:"пр. Коста, 178",i:"☕",r:4.7,rc:1599,ig:"fiddjintae_vladikavkaz",lat:43.0338,lng:44.6659,dishes:[{id:801,nm:"Уалибах",tg:"Пироги",rt:4.8,pr:280,ph:"🫓",rv:35},{id:802,nm:"Картофджин",tg:"Пироги",rt:4.6,pr:260,ph:"🫓",rv:20},{id:803,nm:"Фыджин",tg:"Пироги",rt:4.7,pr:320,ph:"🫓",rv:25}]},
{id:44,n:"9-ка",c:"Кафе",s:"Бургеры",a:"ул. Маркуса, 77/2",i:"☕",r:4.3,rc:0,ig:"cafe9_ka",lat:43.037,lng:44.683},
{id:45,n:"Alioli",c:"Кафе",s:"",a:"ул. Гадиева, 19",i:"☕",r:3.4,rc:48,ig:"alioli_vld",lat:43.0169,lng:44.6772},
{id:46,n:"Dolce Far Niente",c:"Кафе",s:"",a:"ул. Г. Баева, 13",i:"☕",r:4.9,rc:0,ig:"dolcefarniente_moscow",lat:43.0228,lng:44.6822},
{id:47,n:"Luxe (Магкаева)",c:"Кафе",s:"2-я точка",a:"ул. Магкаева, 79",i:"☕",r:4.7,rc:0,ig:"luxe_caffe",lat:43.0321,lng:44.7072},
{id:48,n:"Sindbad",c:"Кафе",s:"",a:"ул. Мамсурова, 12",i:"☕",r:5.0,rc:0,ig:"sindbad_cafe_",lat:43.0382,lng:44.6606},
{id:49,n:"Vinograd",c:"Кафе",s:"Караоке",a:"ул. Цоколаева, 15",i:"☕",r:4.3,rc:360,lat:43.0392,lng:44.6305},
{id:50,n:"Мимино",c:"Кафе",s:"Грузинская",a:"ул. Влад-ая, 17а",i:"☕",r:4.3,rc:292,lat:43.0456,lng:44.6348},
{id:51,n:"Наш дворик",c:"Кафе",s:"",a:"ул. Чапаева, 68",i:"☕",r:4.2,rc:22,ig:"nash_dvorik_food",lat:43.0476,lng:44.6213},
{id:52,n:"Хинкальный дворик",c:"Кафе",s:"Грузинская",a:"ул. Герасимова, 23",i:"☕",r:4.5,rc:140,ig:"hinkalny.dvorik_vld",lat:43.0435,lng:44.671},
{id:53,n:"Чегери",c:"Кафе",s:"",a:"ул. К. Маркса, 100а",i:"☕",r:4.6,rc:0,ig:"chegeri_vld",lat:43.0372,lng:44.6665},
{id:54,n:"Vincenzo Музей",c:"Кафе-сеть",s:"Пицца",a:"ул. Революции, 61",i:"☕",r:4.2,rc:282,lat:43.0349,lng:44.6823},
{id:55,n:"Доменика",c:"Кафе-сеть",s:"",a:"ул. Куйбышева, 18",i:"☕",r:4.2,rc:610,ig:"domenika_cafe",lat:43.0309,lng:44.6841},
{id:56,n:"Зерно",c:"Кафе/пиццерия",s:"Пицца на дровах",a:"ул. Влад-ая, 33А",i:"🍕",r:4.9,rc:0,ig:"zernopizza",lat:43.0463,lng:44.634},
{id:57,n:"Мясо & Мята",c:"Гриль-бар",s:"Бургеры/стейки",a:"ул. Джанаева, 12",i:"🥩",r:4.5,rc:318,ig:"meat_vladikavkaz",lat:43.0322,lng:44.6786},
{id:58,n:"Smoke BBQ",c:"Гриль-бар",s:"Барбекю",a:"ул. Горького, 70",i:"🥩",r:5.0,rc:0,ig:"smokebbqvld",lat:43.029,lng:44.693},
{id:59,n:"Дом Хинкали",c:"Хинкальная",s:"Хинкали",a:"ул. Ростовская, 54",i:"🥟",r:4.5,rc:511,ig:"dom_xinkali",lat:43.04,lng:44.6833},
{id:60,n:"Хинкальная #1",c:"Хинкальная",s:"Хинкали",a:"ул. Куйбышева, 45",i:"🥟",r:4.5,rc:165,lat:43.0322,lng:44.6937},
{id:61,n:"Хинкальная на Чапаева",c:"Хинкальная",s:"",a:"ул. Чапаева, 66",i:"🥟",r:4.3,rc:107,ig:"_khinkalnaya_",lat:43.0474,lng:44.6735},
{id:62,n:"Хонга-Хинкали",c:"Хинкальная",s:"Хинкали",a:"ул. Кесаева, 16",i:"🥟",r:4.7,rc:146,ig:"xinkalixonga",lat:43.0349,lng:44.6665},
{id:63,n:"Чиго",c:"Хинкальная",s:"Хинкали",a:"ул. Магкаева, 2",i:"🥟",r:4.3,rc:0,ig:"hinkali_chigo",lat:43.032,lng:44.707},
{id:64,n:"Шеф",c:"Хинкальная",s:"Хинкали",a:"ул. Кырджалийская, 10Б",i:"🥟",r:5.0,rc:0,ig:"chef_cafe_vld",lat:43.022729,lng:44.649677},
{id:65,n:"New York Pizza",c:"Пиццерия",s:"Пицца",a:"пр. Коста, 266",i:"🍕",r:4.3,rc:294,ig:"pizza.new.york",lat:43.0466,lng:44.6576},
{id:66,n:"Додо (Мира)",c:"Пиццерия",s:"Пицца",a:"пр. Мира, 32",i:"🍕",r:4.9,rc:0,lat:43.0305,lng:44.6805},
{id:67,n:"Додо (Плиева)",c:"Пиццерия",s:"Пицца",a:"ул. Плиева, 25",i:"🍕",r:4.0,rc:142,lat:43.0186,lng:44.6743},
{id:68,n:"Sushiset",c:"Суши-бар",s:"Суши",a:"ул. Куйбышева, 69",i:"🍣",r:4.5,rc:273,ig:"sushiset_vld",lat:43.0323,lng:44.6982},
{id:69,n:"Unagi Rolls",c:"Суши-бар",s:"Суши/удон",a:"ул. Московская, 2",i:"🍣",r:4.9,rc:342,ig:"_unagi_rolls_",lat:43.0591,lng:44.6561},
{id:70,n:"Buffalo",c:"Бургерная",s:"Бургеры",a:"ул. Ленина, 64",i:"🍔",r:4.5,rc:30,lat:43.0221,lng:44.682},
{id:71,n:"Gaucho",c:"Бургерная",s:"Бургеры",a:"ул. Плиева, 28",i:"🍔",r:4.5,rc:389,ig:"gaucho_vladikavkaz",lat:43.0195,lng:44.675},
{id:72,n:"Oldschool",c:"Бургерная",s:"Бургеры",a:"ул. Леваневского, 53а",i:"🍔",r:4.5,rc:406,ig:"oldschoolburgers",lat:43.0355,lng:44.6548},
{id:73,n:"Sandwich St.",c:"Бургерная",s:"Сэндвичи",a:"ул. Леваневского, 53а",i:"🍔",r:4.7,rc:380,ig:"gaucho_vladikavkaz",lat:43.0355,lng:44.6548},
{id:74,n:"Express Шаурма",c:"Фастфуд",s:"Шаурма",a:"пр. Коста, 224а",i:"🌯",r:3.0,rc:64,ig:"expressshaurma",lat:43.0385,lng:44.6635},
{id:75,n:"Food Corner",c:"Фастфуд",s:"Фалафель",a:"ул. Плиева, 18",i:"🌯",r:4.3,rc:241,ig:"foodcorner_vlad",lat:43.0198,lng:44.6761},
{id:76,n:"Вертел",c:"Фастфуд",s:"Шаурма/гриль",a:"ул. Мамсурова, 42",i:"🌯",r:4.4,rc:591,ig:"vertel_vld",lat:43.0363,lng:44.6552},
{id:77,n:"Джейхан",c:"Фастфуд",s:"Шаурма",a:"ул. Горького, 38",i:"🌯",r:4.2,rc:1237,ig:"bistro_djeikhan",lat:43.0292,lng:44.688},
{id:78,n:"Бейрут",c:"Фастфуд",s:"Арабская",a:"Петровский пер., 5",i:"🌯",r:4.3,rc:508,ig:"kafe_beirut_",lat:43.0344,lng:44.681},
{id:79,n:"Хатта",c:"Фастфуд",s:"Шаурма",a:"ул. Морс. Пехотинцев",i:"🌯",r:4.5,rc:46,ig:"fast_food_hatta",lat:43.0378,lng:44.6321},
{id:80,n:"Чебуреки Решают",c:"Фастфуд",s:"Чебуреки",a:"ул. Кирова, 38",i:"🌯",r:4.4,rc:183,ig:"chebureki_reshaut_vakansii",lat:43.0347,lng:44.6803},
{id:81,n:"Шаурмания",c:"Фастфуд",s:"Шаурма",a:"ул. Влад-ая, 25б",i:"🌯",r:3.9,rc:636,ig:"shaurmania_vladikavkaz",lat:43.0463,lng:44.634},
{id:82,n:"Шаурмания 2",c:"Фастфуд",s:"Шаурма",a:"ул. Мамсурова, 14",i:"🌯",r:4.0,rc:621,lat:43.0382,lng:44.6606},
{id:83,n:"Шаурмания Халяль",c:"Фастфуд",s:"Шаурма",a:"ул. Барбашова, 46А",i:"🌯",r:4.1,rc:423,lat:43.0283,lng:44.658},
{id:84,n:"Rostic's",c:"Фастфуд-сеть",s:"Курица",a:"пр. Доватора, 97",i:"🌯",r:3.9,rc:517,lat:43.0434,lng:44.6412},
{id:85,n:"Бургер Кинг",c:"Фастфуд-сеть",s:"Бургеры",a:"пр. Мира, 24",i:"🌯",r:3.0,rc:82,lat:43.0303,lng:44.6809},
{id:86,n:"Вкусно и точка",c:"Фастфуд-сеть",s:"Бургеры",a:"пр. Мира, 50",i:"🌯",r:4.2,rc:0,lat:43.0343,lng:44.6801},
{id:87,n:"Agava",c:"Винный бар",s:"Коктейли",a:"ул. Гибизова, 8а",i:"🍷",r:5.0,rc:8,ig:"agava_vld",lat:43.0283,lng:44.6786},
{id:88,n:"Berdinberg",c:"Бар",s:"Пиво/бургеры",a:"пр. Мира, 17",i:"🍺",r:3.8,rc:33,ig:"berdinberg",lat:43.0284,lng:44.6805},
{id:89,n:"Wish Bar",c:"Бар",s:"Рок-бар",a:"ул. Маяковского, 22",i:"🍺",r:4.5,rc:201,ig:"bar_wish",lat:43.0331,lng:44.6808},
{id:90,n:"Асгард",c:"Бар",s:"Крафт",a:"ул. Магкаева, 59",i:"🍺",r:3.7,rc:12,ig:"asgard_brewery",lat:43.0321,lng:44.7072},
{id:91,n:"Осет. пивоварня",c:"Бар",s:"Крафт. пиво",a:"ул. Весенняя, 1",i:"🍺",r:4.6,rc:486,ig:"beer_vladikavkaz",lat:43.0346,lng:44.6378,dishes:[{id:701,nm:"Коричневое крафт",tg:"Пиво",rt:4.7,pr:200,ph:"🍺",rv:30},{id:702,nm:"Тёмное нефильтр.",tg:"Пиво",rt:4.6,pr:200,ph:"🍺",rv:22},{id:703,nm:"Пирог с сыром/свёклой",tg:"Пироги",rt:4.8,pr:280,ph:"🫓",rv:18}]},
{id:92,n:"Пивная СССР",c:"Бар",s:"Советский",a:"пр. Мира, 52",i:"🍺",r:4.6,rc:199,lat:43.0344,lng:44.6802},
];

const CATS=[
  {k:"all",l:"Все"},
  {k:"Ресторан",l:"🏛️ Рестораны"},
  {k:"Кафе",l:"☕ Кафе"},
  {k:"Хинкальная",l:"🥟 Хинкальные"},
  {k:"Пиццерия",l:"🍕 Пиццерии"},
  {k:"Суши-бар",l:"🍣 Суши"},
  {k:"Бургерная",l:"🍔 Бургерные"},
  {k:"Гриль-бар",l:"🥩 Гриль"},
  {k:"Фастфуд",l:"🌯 Фастфуд"},
  {k:"Бар",l:"🍺 Бары"},
];

const VENUE_COLOR = (visited) => visited
  ? {bg:"#1a2e14",accent:"#5a9c35",text:"#7fd458"}
  : {bg:"#1a1a1a",accent:"#3a3a3a",text:"#666"};

const FEED=[
  {u:"Алан",v:"Къона",d:"Уалибах",r:5,t:"2ч",e:"🫓"},
  {u:"Мадина",v:"Papillon",d:"Утка с пюре",r:5,t:"3ч",e:"🍷"},
  {u:"Тамерлан",v:"Ман&Гал",d:"Саджи",r:5,t:"5ч",e:"🍖"},
  {u:"Залина",v:"Осет. пивоварня",d:"Коричневое",r:4,t:"вчера",e:"🍺"},
  {u:"Wlasz",v:"Лимончелло",d:"Пицца 4 сезона",r:4,t:"вчера",e:"🍕"},
  {u:"Руслан",v:"Старый мост",d:"Форель",r:5,t:"вчера",e:"🐟"},
  {u:"Анна",v:"KoYROI",d:"Салат с грушей",r:5,t:"2 дня",e:"🥗"},
];

// Цепочки ачивок — показывается только текущий шаг
const ACH_CHAINS=[
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

const INIT_ACHS=ACH_CHAINS;

const INIT_USER={name:"Wlasz",level:1,title:"Новичок",xp:0,nxp:200,venues:0,checkins:0,reviews:0,photos:0};

export default function FogEat(){
  const mapRef=useRef(null),mapInst=useRef(null),markersRef=useRef([]);
  const[lr,setLr]=useState(false);
  const[fontsReady,setFontsReady]=useState(false);
  const[isMobile,setIsMobile]=useState(()=>window.innerWidth<768);
  const[sheetOpen,setSheetOpen]=useState(true);
  const[sheetHeight,setSheetHeight]=useState(55); // % от высоты экрана
  const sheetDragRef=useRef(null);
  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  const[tab,setTab]=useState("map");
  const[mm,setMm]=useState("city");
  const[cf,setCf]=useState("all");
  const[sv,setSv]=useState(null);
  const[sc,setSc]=useState(false);
  const[cs,setCs]=useState(1);
  const[cr,setCr]=useState(0);
  const[checkinPhoto,setCheckinPhoto]=useState(null);
  const[sr,setSr]=useState(false);
  const[srType,setSrType]=useState("checkin");
  const[wt,setWt]=useState("venues");
  const[sideOpen,setSideOpen]=useState(true);
  const[search,setSearch]=useState("");
  const[checkins,setCheckins]=useState([]);
  const[wishVenues,setWishVenues]=useState([]);
  const[wishDishes,setWishDishes]=useState([]);
  const[user,setUser]=useState(INIT_USER);
  const[achs,setAchs]=useState(INIT_ACHS);
  const[dishNote,setDishNote]=useState("");
  const[dishName,setDishName]=useState("");
  const[reviewText,setReviewText]=useState("");
  const[price,setPrice]=useState("");
  const[selectedVenueForCheckin,setSelectedVenueForCheckin]=useState(null);
  const[menuPhotos,setMenuPhotos]=useState({});
  const[showMenuModal,setShowMenuModal]=useState(false);
  const[checkinPhotos,setCheckinPhotos]=useState({});
  const[venueNotes,setVenueNotes]=useState({});
  const[customLabels,setCustomLabels]=useState([]);   // [{id,name,emoji,color}]
  const[venueLabels,setVenueLabels]=useState({});     // {venueId: [labelId,...]}
  const[showLabelManager,setShowLabelManager]=useState(false);
  const[newLabelName,setNewLabelName]=useState("");
  const[newLabelEmoji,setNewLabelEmoji]=useState("⭐");
  const[newLabelColor,setNewLabelColor]=useState("#e8a838");
  const[showVisitModal,setShowVisitModal]=useState(false);
  const[visitNote,setVisitNote]=useState("");
  const[visitRating,setVisitRating]=useState(0);
  const[showAddVenue,setShowAddVenue]=useState(false);
  const[customVenues,setCustomVenues]=useState([]);
  const[newV,setNewV]=useState({n:"",a:"",c:"Ресторан",s:"",r:"",lat:"",lng:""});
  const[geoSearch,setGeoSearch]=useState("");
  const[geoLoading,setGeoLoading]=useState(false);
  const[placingMarker,setPlacingMarker]=useState(false);
  const placingMarkerRef=useRef(false);
  const tempMarkerRef=useRef(null);

  // Load from storage — каждый ключ независимо
  useEffect(()=>{
    const g=async(key)=>{try{const r=await window.storage.get(key);return r?JSON.parse(r.value):null;}catch(e){return null;}};
    const load=async()=>{
      const checkins=await g("fogeat-checkins");if(checkins)setCheckins(checkins);
      const wv=await g("fogeat-wishvenues");if(wv)setWishVenues(wv);
      const wd=await g("fogeat-wishdishes");if(wd)setWishDishes(wd);
      const u=await g("fogeat-user");
      if(u){if(u.checkins>0||u.xp>0){try{await window.storage.delete("fogeat-user");}catch(e){}}else{setUser(u);}}
      try{await window.storage.delete("fogeat-achs");}catch(e){}
      const mp=await g("fogeat-menuphotos");if(mp)setMenuPhotos(mp);
      const cv=await g("fogeat-customvenues");if(cv)setCustomVenues(cv);
      // резервный список удалённых ID
      if(!cv){const del=await g("fogeat-deleted");if(del&&del.length)setCustomVenues(del.map(id=>({id,deleted:true})));}
      const vn=await g("fogeat-venuenotes");if(vn)setVenueNotes(vn);
      const cl=await g("fogeat-customlabels");if(cl)setCustomLabels(cl);
      const vl=await g("fogeat-venuelabels");if(vl)setVenueLabels(vl);
    };
    load();
  },[]);

  const placeTempMarker=(lat,lng)=>{
    if(!mapInst.current||!window.L)return;
    const L=window.L;
    if(tempMarkerRef.current)tempMarkerRef.current.remove();
    const html=`<div style="width:28px;height:28px;border-radius:50%;background:#e8a838;border:3px solid #fff;box-shadow:0 0 0 2px #e8a838,0 4px 12px rgba(0,0,0,.5);cursor:move;display:flex;align-items:center;justify-content:center;font-size:14px">📍</div>`;
    const icon=L.divIcon({html,className:"",iconSize:[28,28],iconAnchor:[14,14]});
    const m=L.marker([lat,lng],{icon,draggable:true}).addTo(mapInst.current);
    m.on("dragend",e=>{
      const p=e.target.getLatLng();
      setNewV(v=>({...v,lat:p.lat.toFixed(5),lng:p.lng.toFixed(5)}));
    });
    tempMarkerRef.current=m;
    setNewV(v=>({...v,lat:lat.toFixed(5),lng:lng.toFixed(5)}));
    mapInst.current.flyTo([lat,lng],17,{duration:.6});
  };



  const saveMenuPhotos=async(data)=>{try{await window.storage.set("fogeat-menuphotos",JSON.stringify(data));}catch(e){}};
  const saveVenueNotes=async(data)=>{try{await window.storage.set("fogeat-venuenotes",JSON.stringify(data));}catch(e){}};
  const saveCustomLabels=async(data)=>{try{await window.storage.set("fogeat-customlabels",JSON.stringify(data));}catch(e){}};
  const saveVenueLabels=async(data)=>{try{await window.storage.set("fogeat-venuelabels",JSON.stringify(data));}catch(e){}};

  const saveCheckins=async(data)=>{try{await window.storage.set("fogeat-checkins",JSON.stringify(data));}catch(e){}};
  const saveWishVenues=async(data)=>{try{await window.storage.set("fogeat-wishvenues",JSON.stringify(data));}catch(e){}};
  const saveWishDishes=async(data)=>{try{await window.storage.set("fogeat-wishdishes",JSON.stringify(data));}catch(e){}};
  const saveUser=async(data)=>{try{await window.storage.set("fogeat-user",JSON.stringify(data));}catch(e){}};
  const saveCustomVenues=async(data)=>{
    try{await window.storage.set("fogeat-customvenues",JSON.stringify(data));}catch(e){}
    // дополнительно сохраняем список удалённых ID отдельно
    const delIds=data.filter(v=>v.deleted).map(v=>v.id);
    try{await window.storage.set("fogeat-deleted",JSON.stringify(delIds));}catch(e){}
  };

  // загружаем фото чекинов когда открывается панель заведения
  useEffect(()=>{
    if(!sv)return;
    const load=async()=>{
      const myci=checkins.filter(c=>c.venueId===sv.id&&c.photoKey);
      const photos={};
      for(const c of myci){
        try{const r=await window.storage.get(c.photoKey);if(r)photos[c.id]=r.value;}catch(e){}
      }
      setCheckinPhotos(p=>({...p,...photos}));
    };
    load();
  },[sv,checkins]);

  useEffect(()=>{
    if(!window.L){
      const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);
      const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=()=>setLr(true);document.head.appendChild(s);
    }else{setLr(true);}
    // сплэш — ждём шрифты + минимум 1.2с
    const t=setTimeout(()=>setFontsReady(true),1200);
    document.fonts.ready.then(()=>setTimeout(()=>setFontsReady(true),300));
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(!lr||!mapRef.current||mapInst.current)return;
    const L=window.L;
    const m=L.map(mapRef.current,{zoomControl:false,attributionControl:false}).setView([43.033,44.678],14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(m);
    L.control.zoom({position:"topright"}).addTo(m);
    mapInst.current=m;
    setTimeout(()=>m.invalidateSize(),100);
    setTimeout(()=>m.invalidateSize(),500);
    setTimeout(()=>m.invalidateSize(),1000);
    m.on("click",e=>{
      if(!placingMarkerRef.current)return;
      placeTempMarker(e.latlng.lat,e.latlng.lng);
      placingMarkerRef.current=false;
      setPlacingMarker(false);
      setShowAddVenue(true);
    });
  },[lr]);

  useEffect(()=>{if(mapInst.current)setTimeout(()=>mapInst.current.invalidateSize(),310)},[sideOpen]);

  const visitedIds=new Set(checkins.map(c=>String(c.venueId)));
  const deletedIds=new Set(customVenues.filter(v=>v.deleted).map(v=>String(v.id)));
  const allVenues=[...V.filter(v=>!deletedIds.has(String(v.id))),...customVenues.filter(v=>!v.deleted)];

  const catMatch=(c,cf)=>{
    if(cf==="all")return true;
    if(cf==="Ресторан")return c==="Ресторан";
    if(cf==="Кафе")return c==="Кафе"||c==="Кафе-сеть"||c==="Кафе/пиццерия";
    if(cf==="Хинкальная")return c==="Хинкальная";
    if(cf==="Пиццерия")return c==="Пиццерия"||c==="Кафе/пиццерия";
    if(cf==="Суши-бар")return c==="Суши-бар";
    if(cf==="Бургерная")return c==="Бургерная";
    if(cf==="Гриль-бар")return c==="Гриль-бар";
    if(cf==="Фастфуд")return c==="Фастфуд"||c==="Фастфуд-сеть";
    if(cf==="Бар")return c==="Бар"||c==="Бар/караоке"||c==="Винный бар";
    return c===cf;
  };

  const fl=allVenues.filter(v=>{
    const sm=!search||v.n.toLowerCase().includes(search.toLowerCase())||v.a.toLowerCase().includes(search.toLowerCase());
    if(cf.startsWith("lbl_")){
      const lblId=cf.slice(4);
      return (venueLabels[String(v.id)]||[]).includes(lblId)&&sm;
    }
    return catMatch(v.c,cf)&&sm;
  });

  const mapVenues=allVenues.filter(v=>{
    const sm=!search||v.n.toLowerCase().includes(search.toLowerCase())||v.a.toLowerCase().includes(search.toLowerCase());
    if(cf.startsWith("lbl_")){
      const lblId=cf.slice(4);
      return (venueLabels[String(v.id)]||[]).includes(lblId)&&sm;
    }
    return catMatch(v.c,cf)&&sm;
  });

  const um=useCallback(()=>{
    if(!mapInst.current||!window.L)return;
    const L=window.L;
    markersRef.current.forEach(m=>m.remove());markersRef.current=[];

    // зелёный(5) → жёлтый(2.5) → красный(0.5) по рейтингу
    const ratingColor=(r)=>{
      if(!r||r===0)return{border:"#444",bg:"#1a1a1a"};
      const t=Math.max(0,Math.min(1,(r-0.5)/4.5));
      // green #3d8a1a → yellow #c8a000 → red #a01010
      let border;
      if(t>=0.5){
        const s=(t-0.5)*2;
        const ri=Math.round(0x3d+(0xc8-0x3d)*(1-s));
        const gi=Math.round(0x8a+(0xa0-0x8a)*(1-s));
        const bi=Math.round(0x1a+(0x00-0x1a)*(1-s));
        border=`rgb(${ri},${gi},${bi})`;
      } else {
        const s=t*2;
        const ri=Math.round(0xa0+(0xc8-0xa0)*s);
        const gi=Math.round(0x10+(0xa0-0x10)*s);
        const bi=Math.round(0x10+(0x00-0x10)*s);
        border=`rgb(${ri},${gi},${bi})`;
      }
      const bg=`rgba(${parseInt(border.slice(4),10)||0},${0},${0},0.15)`;
      return{border, bg:`#141414`};
    };

    mapVenues.forEach(v=>{
      const isVisited=visitedIds.has(String(v.id));
      const showQuestion=mm==="my"&&!isVisited;
      const icon_char=showQuestion?"?":v.i;

      const isWishlisted=wishVenues.some(w=>w.id===v.id);

      let bg, border;
      if(mm==="my"&&!isVisited){
        bg=isWishlisted?"#0e1f0e":"#1a1a1a";
        border=isWishlisted?"#3a6a3a":"#383838";
      } else {
        const rc=ratingColor(v.r);
        bg=rc.bg; border=rc.border;
      }

      const font=showQuestion?"14px":"16px";
      const color=showQuestion?(isWishlisted?"#fff":"#555"):"#fff";
      const fontW=showQuestion?"700":"normal";
      const shadow=showQuestion&&isWishlisted
        ? `0 0 10px rgba(90,200,80,.8), 0 2px 8px ${border}66`
        : `0 2px 8px ${border}66`;
      const html=`<div class="map-marker" style="width:34px;height:34px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;font-size:${font};font-weight:${fontW};color:${color};box-shadow:${shadow};cursor:pointer;transition:box-shadow .2s,transform .2s">${icon_char}</div>`;
      const icon=L.divIcon({html,className:"",iconSize:[34,34],iconAnchor:[17,17]});
      const marker=L.marker([v.lat,v.lng],{icon}).addTo(mapInst.current);
      marker.bindTooltip(
        `<div style="font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;color:#e8e4da;background:#0f1410;border:1px solid #222820;border-radius:8px;padding:5px 10px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.5)">${v.i} ${v.n}${v.r>0&&mm==="city"?` <span style="color:#e8a838">★${v.r}</span>`:""}</div>`,
        {permanent:false,direction:"top",offset:[0,-18],opacity:1,className:"fogeat-tip"}
      );
      marker.on("click",()=>{setSv(v);mapInst.current.flyTo([v.lat,v.lng],16,{duration:.5})});
      markersRef.current.push(marker);
    });
  },[mapVenues,visitedIds,wishVenues]);

  useEffect(()=>{um()},[um,lr]);

  const doCheckin=async()=>{
    const venue=selectedVenueForCheckin||sv;
    if(!venue)return;
    const now=new Date();
    const id=Date.now();
    let photoKey=null;
    if(checkinPhoto){
      photoKey=`fogeat-photo-${id}`;
      try{await window.storage.set(photoKey,checkinPhoto);}catch(e){}
    }
    const newCheckin={
      id,venueId:venue.id,venueName:venue.n,
      dish:dishName||"Блюдо",rating:cr,review:reviewText,
      price:price,date:now.toLocaleDateString("ru-RU"),
      time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
      photoKey,
    };
    const updated=[newCheckin,...checkins];
    setCheckins(updated);
    saveCheckins(updated);
    const newUser={...user,xp:user.xp+50,checkins:user.checkins+1};
    setUser(newUser);saveUser(newUser);
    setSc(false);setCs(1);setCr(0);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");
    setSrType("checkin");setSr(true);setTimeout(()=>setSr(false),2500);
  };

  const doQuickVisit=()=>{
    const venue=sv;
    if(!venue)return;
    const now=new Date();
    const newCheckin={
      id:Date.now(),venueId:venue.id,venueName:venue.n,
      dish:"",rating:visitRating,review:visitNote,price:"",
      date:now.toLocaleDateString("ru-RU"),
      time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
      type:"visit",
    };
    const updated=[newCheckin,...checkins];
    setCheckins(updated);saveCheckins(updated);
    const newUser={...user,xp:user.xp+20,checkins:user.checkins+1};
    setUser(newUser);saveUser(newUser);
    setShowVisitModal(false);setVisitNote("");setVisitRating(0);
    setSrType("visit");setSr(true);setTimeout(()=>setSr(false),2500);
  };

  const addWishVenue=(v)=>{
    if(wishVenues.find(w=>w.id===v.id))return;
    const updated=[{id:v.id,n:v.n,c:v.i,no:""},...wishVenues];
    setWishVenues(updated);saveWishVenues(updated);
  };

  const removeWishVenue=(id)=>{
    const updated=wishVenues.filter(w=>w.id!==id);
    setWishVenues(updated);saveWishVenues(updated);
  };

  const Stars=({v,onChange})=>(
    <div style={{display:"flex",justifyContent:"center",gap:6,margin:"8px 0"}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} onClick={()=>onChange&&onChange(i)}
          style={{fontSize:26,cursor:onChange?"pointer":"default",color:i<=v?"#e8a838":"#2a2a2a",transition:"all .15s",display:"inline-block",transform:i<=v?"scale(1.1)":"scale(1)"}}>★</span>
      ))}
    </div>
  );

  const myCheckins=checkins.filter(c=>c.venueId===sv?.id);
  const isWished=sv&&wishVenues.find(w=>w.id===sv.id);

  const getProgress=(k)=>{
    const uVenues=visitedIds.size;
    const uCats=new Set(checkins.map(c=>allVenues.find(v=>v.id===c.venueId)?.c).filter(Boolean)).size;
    if(k==="venues_10"||k==="venues_25"||k==="venues_50"||k==="venues_all")return uVenues;
    if(k==="all_cats")return uCats;
    if(k==="custom_5")return customVenues.filter(v=>!v.deleted).length;
    if(k==="checkins_10"||k==="checkins_25"||k==="checkins_50")return checkins.length;
    if(k==="photos_5"||k==="photos_10")return checkins.filter(c=>c.photoKey).length;
    if(k==="reviews_10")return checkins.filter(c=>c.review&&c.review.length>2).length;
    if(k==="wishlist_5")return wishVenues.length;
    if(k==="five_stars_5")return checkins.filter(c=>c.rating===5).length;
    if(k==="honest_critic")return checkins.filter(c=>c.rating>0&&c.rating<3).length;
    if(k==="cat_rest_3"||k==="cat_rest_5")return new Set(checkins.filter(c=>allVenues.find(v=>v.id===c.venueId)?.c==="Ресторан").map(c=>c.venueId)).size;
    if(k==="cat_bar")return new Set(checkins.filter(c=>["Бар","Бар/караоке","Винный бар"].includes(allVenues.find(v=>v.id===c.venueId)?.c)).map(c=>c.venueId)).size;
    if(k==="cat_sushi")return checkins.filter(c=>allVenues.find(v=>v.id===c.venueId)?.c==="Суши-бар").length;
    if(k==="cat_hink_1"||k==="cat_hink_3")return new Set(checkins.filter(c=>allVenues.find(v=>v.id===c.venueId)?.c==="Хинкальная").map(c=>c.venueId)).size;
    if(k==="early_bird")return checkins.filter(c=>{const h=parseInt(c.time?.split(":")[0]||"12");return h<10;}).length>0?1:0;
    if(k==="night_owl")return checkins.filter(c=>{const h=parseInt(c.time?.split(":")[0]||"12");return h>=23;}).length>0?1:0;
    return 0;
  };

  // для каждой цепочки показываем текущий активный шаг
  const computedAchs=ACH_CHAINS.map(chain=>{
    let activeStep=chain.steps[0];
    for(const step of chain.steps){
      const p=getProgress(step.k);
      if(p>=step.t){
        // шаг выполнен — берём следующий если есть
        const next=chain.steps[chain.steps.indexOf(step)+1];
        if(next)activeStep=next;
        else{activeStep={...step,p:step.t,ok:true};break;}
      } else {
        activeStep=step;break;
      }
    }
    const p=getProgress(activeStep.k);
    return{...activeStep,p:Math.min(p,activeStep.t),ok:p>=activeStep.t};
  });

  const TAB_ICONS={map:"📍",wishlist:"📌",checkins:"✅",profile:"👤"};

  return(<>
    <style>{`
@keyframes splashFade{0%{opacity:1;pointer-events:all}80%{opacity:1}100%{opacity:0;pointer-events:none}}
@keyframes splashPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
:root{
  --bg:#090c08;--bg2:#0f1410;--bg3:#1a201a;--card:#141a14;
  --gold:#e8a838;--gold2:#ffc857;--gold3:#fff0c0;
  --grn:#3d6b25;--grn2:#5a9c35;--grn3:#7fd458;
  --txt:#ddd8cc;--txt2:#9a9480;--txt3:#5a5648;
  --border:#222820;--rad:10px;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%;overflow:hidden}
.app{display:flex;flex-direction:column;height:100vh;background:var(--bg);font-family:'Nunito',sans-serif;color:var(--txt);overflow:hidden}

/* MOBILE */
.mob-map{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0}
.mob-hdr{position:fixed;top:0;left:0;right:0;height:50px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:8px;z-index:500}
.mob-tabs{position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);display:flex;z-index:600;padding-bottom:env(safe-area-inset-bottom,16px);height:calc(56px + env(safe-area-inset-bottom,16px))}
.mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:9px;font-weight:800;color:var(--txt3);border:none;background:none;cursor:pointer;font-family:'Nunito';padding:6px 0}
.mob-tab.a{color:var(--gold)}
.mob-tab .ico{font-size:18px}
.mob-sheet{position:fixed;left:0;right:0;bottom:calc(56px + env(safe-area-inset-bottom,16px));background:var(--bg2);border-top:1px solid var(--border);border-radius:16px 16px 0 0;z-index:400;display:flex;flex-direction:column;overflow:hidden}
.mob-sheet-handle{width:100%;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;position:relative}.mob-sheet-handle::after{content:"";display:block;width:36px;height:4px;background:var(--txt3);border-radius:2px;opacity:.6}.mob-sheet-tip{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:9px;color:var(--txt3);font-family:'Nunito';font-weight:700;opacity:.45;pointer-events:none}
.mob-vp{position:fixed;inset:0;bottom:56px;background:var(--bg2);z-index:600;overflow-y:auto;animation:slideUp .25s ease}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}

/* HEADER */
.hdr{display:flex;align-items:center;padding:0 14px;height:54px;background:var(--bg2);border-bottom:1px solid var(--border);gap:10px;z-index:20;flex-shrink:0}
.logo{font-family:'Dela Gothic One';font-size:20px;letter-spacing:2px;color:var(--grn3)}.logo span{color:var(--gold)}
.hmode{display:flex;background:var(--bg3);border-radius:8px;padding:2px;gap:2px;border:1px solid var(--border)}
.hmode button{padding:4px 12px;border:none;border-radius:6px;font-family:'Nunito';font-weight:800;font-size:11px;cursor:pointer;background:transparent;color:var(--txt3);transition:all .2s}
.hmode button.a{background:var(--grn);color:#fff}
.hprog{flex:1;display:flex;align-items:center;gap:7px;max-width:200px}
.hprog-txt{font-size:10px;color:var(--txt3);white-space:nowrap;font-weight:700}
.hprog-bar{flex:1;height:4px;background:var(--bg3);border-radius:4px;overflow:hidden}
.hprog-fill{height:100%;background:linear-gradient(90deg,var(--grn),var(--grn3));border-radius:4px;transition:width .5s}
.havatar{display:flex;align-items:center;gap:7px;margin-left:auto;cursor:pointer;padding:4px 8px;border-radius:8px;transition:background .2s}
.havatar:hover{background:var(--bg3)}
.hav-icon{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;border:2px solid var(--gold);flex-shrink:0}
.hav-name{font-weight:800;font-size:12px}.hav-lvl{font-size:10px;color:var(--grn3)}

/* LAYOUT */
.main{display:flex;flex:1;overflow:hidden}
.side{width:340px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:width .3s ease;flex-shrink:0}
.side.cl{width:0;border-right:none}
.tog{position:absolute;left:0;top:80px;width:18px;height:44px;background:var(--bg2);border:1px solid var(--border);border-left:none;border-radius:0 7px 7px 0;cursor:pointer;color:var(--txt3);font-size:10px;z-index:1100;display:flex;align-items:center;justify-content:center}

/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0}
.tab-btn{flex:1;padding:10px 2px 8px;text-align:center;font-size:16px;color:var(--txt3);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;position:relative}
.tab-btn.a{color:var(--gold);border-color:var(--gold)}
.tab-btn .tab-lbl{display:block;font-size:8px;font-weight:700;font-family:'Nunito';margin-top:2px;color:inherit}

/* SCROLL AREA */
.sc{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--grn) transparent}
.sc::-webkit-scrollbar{width:4px}
.sc::-webkit-scrollbar-track{background:transparent}
.sc::-webkit-scrollbar-thumb{background:var(--grn);border-radius:4px}
.sc::-webkit-scrollbar-thumb:hover{background:var(--grn2)}
.fogeat-tip{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}
.fogeat-tip::before{display:none!important}
.map-marker:hover{box-shadow:0 0 0 6px rgba(90,200,80,.35),0 0 18px rgba(90,200,80,.5)!important;transform:scale(1.15)}

/* SEARCH */
.srch-wrap{padding:10px 10px 6px;position:relative}
.srch{width:100%;padding:8px 12px 8px 34px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rad);color:var(--txt);font-family:'Nunito';font-size:12px;outline:none;transition:border-color .2s}
.srch:focus{border-color:var(--grn2)}
.srch-ico{position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}

/* CHIPS */
.chips{display:flex;gap:4px;padding:4px 10px 8px;overflow-x:auto;flex-shrink:0;cursor:grab;user-select:none}
.chips::-webkit-scrollbar{display:none}
.chips{scrollbar-width:none;-ms-overflow-style:none}
.chips.dragging{cursor:grabbing}
.chip{padding:4px 9px;border-radius:20px;background:var(--bg3);font-size:10px;font-weight:700;cursor:pointer;color:var(--txt2);border:1px solid var(--border);transition:all .15s;white-space:nowrap}
.chip.a{background:var(--grn);color:#fff;border-color:var(--grn2)}

/* VENUE ITEM */
.vi{display:flex;align-items:center;gap:0;cursor:pointer;transition:background .15s;border-bottom:1px solid var(--border);overflow:hidden}
.vi:hover{background:var(--bg3)}
.vi-strip{width:3px;align-self:stretch;flex-shrink:0}
.vi-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;margin:10px 8px 10px 10px}
.vi-info{flex:1;min-width:0;padding:10px 0}
.vi-name{font-weight:800;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--txt)}
.vi-sub{font-size:10px;color:var(--txt3);margin-top:1px}
.vi-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;padding:10px 10px 10px 6px;flex-shrink:0}
.vi-rating{background:var(--bg3);border-radius:5px;padding:2px 6px;font-size:10px;font-weight:800;color:var(--gold);border:1px solid #333}
.vi-visited{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0}

/* MAP */
.ma{flex:1;position:relative}
#mapEl{width:100%;height:100%}
.fab{position:absolute;bottom:22px;right:22px;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));border:none;color:#fff;font-size:30px;font-weight:900;cursor:pointer;z-index:1500;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(90,156,53,.5);transition:transform .2s,box-shadow .2s}
.fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(90,156,53,.7)}

/* VENUE PANEL */
.vp{position:absolute;right:0;top:0;bottom:0;width:360px;background:var(--bg2);z-index:1000;overflow-y:auto;border-left:1px solid var(--border);display:flex;flex-direction:column;animation:slideIn .25s ease}
@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
.vp-hero{padding:20px 16px 14px;position:relative;flex-shrink:0}
.vp-hero::before{content:"";position:absolute;inset:0;opacity:.07;pointer-events:none}
.vp-close{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--txt2);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.vp-close:hover{background:var(--border);color:var(--txt)}
.vp-emoji{font-size:40px;margin-bottom:8px;display:block;line-height:1}
.vp-name{font-family:'Dela Gothic One';font-size:18px;line-height:1.2;margin-bottom:4px}
.vp-addr{font-size:11px;color:var(--txt3);margin-bottom:8px}
.vp-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
.vp-tag{padding:3px 9px;border-radius:12px;font-size:10px;font-weight:700;background:var(--bg3);color:var(--txt2);border:1px solid var(--border)}
.vp-tag.gold{background:rgba(232,168,56,.15);color:var(--gold);border-color:rgba(232,168,56,.3)}
.vp-tag.grn{background:rgba(90,156,53,.15);color:var(--grn3);border-color:rgba(90,156,53,.3)}
.vp-actions{display:flex;gap:7px;padding:0 14px 12px;flex-shrink:0}
.btn-primary{flex:1;padding:9px;border-radius:var(--rad);background:var(--gold);color:var(--bg);font-family:'Nunito';font-weight:800;font-size:12px;cursor:pointer;border:none;transition:all .2s}
.btn-primary:hover{background:var(--gold2)}
.btn-outline{flex:1;padding:9px;border-radius:var(--rad);background:transparent;color:var(--gold);font-family:'Nunito';font-weight:800;font-size:12px;cursor:pointer;border:1.5px solid var(--gold);transition:all .2s}
.btn-outline:hover{background:rgba(232,168,56,.1)}
.btn-outline.active{background:rgba(232,168,56,.2);color:var(--gold2)}

/* SECTION */
.sec-hdr{font-weight:800;font-size:11px;padding:10px 14px 5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;justify-content:space-between}

/* DISH ROW */
.dr{display:flex;align-items:center;gap:9px;padding:8px 14px;border-bottom:1px solid var(--border)}
.de{font-size:22px;width:32px;text-align:center;flex-shrink:0}
.di{flex:1;min-width:0}
.dn{font-weight:800;font-size:12px}.dt{font-size:9px;color:var(--txt3);margin-top:1px}.ds{font-size:10px;color:var(--txt2);margin-top:2px}
.wish-btn{padding:4px 8px;border-radius:6px;border:1.5px solid var(--gold);background:transparent;color:var(--gold);font-size:9px;font-weight:800;cursor:pointer;font-family:'Nunito';white-space:nowrap;transition:all .2s}
.wish-btn:hover,.wish-btn.on{background:var(--gold);color:var(--bg)}

/* MY CHECKINS in venue */
.ci{padding:10px 14px;border-bottom:1px solid var(--border)}
.ci-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.ci-dish{font-weight:800;font-size:12px}.ci-date{font-size:9px;color:var(--txt3)}
.ci-review{font-size:10px;color:var(--txt2);margin-top:2px;font-style:italic}

/* FEED */
.fi{display:flex;gap:9px;padding:10px 12px;border-bottom:1px solid var(--border);align-items:flex-start}
.fa{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;color:#fff;border:1.5px solid rgba(127,212,88,.3)}
.fb{flex:1;min-width:0}
.fu{font-weight:800;font-size:11px}.ft{font-size:10px;color:var(--txt2);margin-top:2px}.fm{font-size:10px;color:var(--txt3);margin-top:1px;font-style:italic}
.fe{font-size:20px;align-self:center;flex-shrink:0}

/* WISHLIST */
.wl-tabs{display:flex;border-bottom:1px solid var(--border)}
.wl-tab{flex:1;padding:8px;text-align:center;font-weight:800;font-size:10px;color:var(--txt3);border:none;background:none;cursor:pointer;font-family:'Nunito';border-bottom:2px solid transparent;transition:all .2s}
.wl-tab.a{color:var(--gold);border-color:var(--gold)}
.wi{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--border)}
.wic{width:32px;height:32px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:17px;border:1px solid var(--border)}
.wif{flex:1;min-width:0}.win{font-weight:800;font-size:12px}.wint{font-size:9px;color:var(--txt3);margin-top:1px}
.wr{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);background:none;color:var(--txt3);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.wr:hover{background:rgba(255,80,80,.15);color:#ff5050;border-color:#ff5050}

/* MY CHECKINS TAB */
.ck{padding:10px 12px;border-bottom:1px solid var(--border)}
.ck-venue{font-weight:800;font-size:12px}.ck-meta{display:flex;gap:6px;margin-top:3px;align-items:center}
.ck-dish{font-size:11px;color:var(--txt2)}.ck-date{font-size:9px;color:var(--txt3)}
.ck-review{font-size:10px;color:var(--txt3);margin-top:3px;font-style:italic}

/* EMPTY STATE */
.empty{text-align:center;padding:40px 20px;color:var(--txt3)}
.empty-ico{font-size:36px;margin-bottom:10px}.empty-txt{font-size:12px;font-weight:700}

/* PROFILE */
.prof-hero{padding:20px 16px;text-align:center;border-bottom:1px solid var(--border);background:linear-gradient(180deg,var(--bg3),var(--bg2))}
.prof-av{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;border:2.5px solid var(--gold)}
.prof-name{font-family:'Dela Gothic One';font-size:18px}.prof-title{display:inline-block;margin-top:5px;padding:3px 12px;background:linear-gradient(90deg,var(--grn),var(--grn2));border-radius:12px;font-size:10px;font-weight:800;color:#fff}
.prof-xp-bar{margin:12px 16px 0;height:6px;background:var(--bg3);border-radius:4px;overflow:hidden}
.prof-xp-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:4px;transition:width .5s}
.prof-xp-lbl{text-align:center;font-size:9px;color:var(--txt3);margin-top:3px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px}
.stat-card{text-align:center;padding:8px 4px;background:var(--card);border-radius:var(--rad);border:1px solid var(--border)}
.stat-n{font-family:'Dela Gothic One';font-size:16px;color:var(--grn3)}.stat-l{font-size:8px;color:var(--txt3);margin-top:2px;font-weight:700}

/* ACHIEVEMENTS */
.ach{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--border)}
.ach-icon{width:34px;height:34px;border-radius:9px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:1px solid var(--border)}
.ach-icon.done{background:linear-gradient(135deg,var(--grn),var(--grn3));border-color:var(--grn2)}
.ach-info{flex:1;min-width:0}.ach-name{font-weight:800;font-size:11px}.ach-desc{font-size:9px;color:var(--txt3);margin-top:1px}
.ach-bar{height:3px;background:var(--bg3);border-radius:2px;margin-top:4px;overflow:hidden}
.ach-bar-fill{height:100%;background:var(--grn2);border-radius:2px}
.ach-cnt{font-size:9px;color:var(--txt2);font-weight:800;flex-shrink:0}

/* MODAL */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
.md{width:400px;max-height:82vh;background:var(--bg2);border-radius:16px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column;animation:popIn .2s ease;color:var(--txt)}
@keyframes popIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
.md-head{padding:16px 18px 0;text-align:center;flex-shrink:0}
.md-steps{display:flex;justify-content:center;gap:6px;margin-bottom:10px}
.md-step{width:24px;height:4px;border-radius:3px;background:var(--bg3);transition:all .25s}
.md-step.a{background:var(--gold);width:32px}
.md-title{font-family:'Dela Gothic One';font-size:16px;margin-bottom:4px}
.md-body{padding:12px 18px 18px;overflow-y:auto;flex:1}
.cam{width:100%;height:150px;border-radius:var(--rad);background:var(--bg3);border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:13px;color:var(--txt3);cursor:pointer;margin-bottom:12px;transition:all .2s}
.cam:hover{border-color:var(--gold);color:var(--gold)}
.cam.done{border-color:var(--grn2);background:rgba(90,156,53,.1);color:var(--grn3)}
.minput{width:100%;padding:9px 11px;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--rad);color:var(--txt);font-family:'Nunito';font-size:12px;margin-bottom:7px;outline:none;transition:border-color .2s}
.minput:focus{border-color:var(--grn2)}.minput::placeholder{color:var(--txt3)}
.mbtn{width:100%;padding:11px;border-radius:var(--rad);border:none;font-family:'Nunito';font-weight:800;font-size:13px;cursor:pointer;margin-top:6px;transition:all .2s}
.mbtn.pri{background:linear-gradient(90deg,var(--gold),var(--gold2));color:var(--bg)}.mbtn.pri:hover{opacity:.9}
.mbtn.sec{background:var(--bg3);color:var(--txt2)}.mbtn.sec:hover{background:var(--border)}
.mbtn:disabled{opacity:.4;cursor:default}

/* SUCCESS */
.success-overlay{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.success-card{text-align:center;background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:30px 40px}
.success-xp{font-family:'Dela Gothic One';font-size:36px;color:var(--gold);margin:8px 0}
`}</style>

    {!fontsReady&&(
      <div style={{position:"fixed",inset:0,background:"#090c08",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <div style={{fontFamily:"'Dela Gothic One',sans-serif",fontSize:42,letterSpacing:4,color:"#7fd458",animation:"splashPulse 1.6s ease-in-out infinite"}}>
          FOG<span style={{color:"#e8a838"}}>EAT</span>
        </div>
        <div style={{fontSize:12,color:"#5a5648",fontFamily:"sans-serif",letterSpacing:2}}>Владикавказ</div>
      </div>
    )}
    <div className="app" style={{opacity:fontsReady?1:0,transition:"opacity .4s"}}>

      {sr&&(
        <div className="success-overlay">
          <div className="success-card">
            <div style={{fontSize:54}}>{srType==="checkin"?"🎉":"✅"}</div>
            <div className="success-xp">{srType==="checkin"?"+50 XP":"+20 XP"}</div>
            <div style={{fontSize:13,color:"var(--txt2)",fontFamily:"'Nunito',sans-serif"}}>{srType==="checkin"?"Чекин сохранён!":"Посещение отмечено!"}</div>
          </div>
        </div>
      )}

    {isMobile ? (
      /* ===== МОБИЛЬНЫЙ LAYOUT ===== */
      <>
        {/* Карта на весь экран */}
        <div className="mob-map">
          <div id="mapEl" ref={mapRef} style={{width:"100%",height:"100%"}}/>
          <button className="fab" onClick={()=>setShowAddVenue(true)}>+</button>
        </div>

        {/* Хедер */}
        <div className="mob-hdr">
          <div className="logo" style={{fontSize:16}}>FOG<span>EAT</span></div>
          <div className="hmode" style={{transform:"scale(.85)",transformOrigin:"left"}}>
            <button className={mm==="city"?"a":""} onClick={()=>setMm("city")}>🌍 Город</button>
            <button className={mm==="my"?"a":""} onClick={()=>setMm("my")}>👤 Моя</button>
          </div>
          <div style={{marginLeft:"auto",fontSize:10,color:"var(--txt3)",fontWeight:700}}>{visitedIds.size}/{allVenues.length}</div>
        </div>

        {/* Панель заведения — полноэкранная шторка */}
        {sv&&allVenues.find(v=>v.id===sv.id)&&(()=>{
          const visited=visitedIds.has(String(sv.id));
          const col=VENUE_COLOR(visited);
          const wished=wishVenues.find(w=>w.id===sv.id);
          const myci=checkins.filter(c=>c.venueId===sv.id);
          return(
            <div className="mob-vp"
              onTouchStart={e=>{e.currentTarget._sx=e.touches[0].clientX;e.currentTarget._sy=e.touches[0].clientY;e.currentTarget._moved=false;}}
              onTouchMove={e=>{
                const dx=e.touches[0].clientX-e.currentTarget._sx;
                const dy=Math.abs(e.touches[0].clientY-e.currentTarget._sy);
                if(dx>10&&dy<60)e.currentTarget._moved=true;
              }}
              onTouchEnd={e=>{
                const dx=e.changedTouches[0].clientX-e.currentTarget._sx;
                if(e.currentTarget._moved&&dx>80)setSv(null);
              }}
            >
              <div style={{position:"sticky",top:0,background:"var(--bg2)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontFamily:"'Dela Gothic One'",fontSize:16}}>{sv.n}</div>
                <button onClick={()=>setSv(null)} style={{width:30,height:30,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--txt2)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
              <div style={{padding:"12px 16px 6px"}}>
                <div style={{fontSize:12,color:"var(--txt3)",marginBottom:8}}>📍 {sv.a}</div>
                <div className="vp-tags">
                  {mm==="city"&&sv.r>0&&<span className="vp-tag gold">★ {sv.r} · {sv.rc} отз.</span>}
                  {mm==="my"&&(()=>{
                    const myRatings=myci.filter(c=>c.rating>0);
                    if(!myRatings.length)return null;
                    const avg=(myRatings.reduce((s,c)=>s+c.rating,0)/myRatings.length).toFixed(1);
                    return <span className="vp-tag gold">★ {avg} · моя оценка</span>;
                  })()}
                  <span className="vp-tag">{sv.c}</span>
                  {sv.s&&<span className="vp-tag">{sv.s}</span>}
                  {visited&&<span className="vp-tag grn">✓ Был</span>}
                </div>
              </div>
              <div className="vp-actions">
                <button className="btn-primary" onClick={()=>{setSelectedVenueForCheckin(sv);setSc(true)}}>📸 Чекин</button>
                <button className={`btn-outline ${wished?"active":""}`} onClick={()=>wished?removeWishVenue(sv.id):addWishVenue(sv)}>
                  {wished?"📌 Вишлист":"📌 Хочу"}
                </button>
              </div>
              {sv.ig&&(
                <div style={{padding:"0 14px 10px"}}>
                  <div onClick={()=>{const a=document.createElement("a");a.href=`https://instagram.com/${sv.ig}`;a.target="_blank";a.rel="noreferrer";document.body.appendChild(a);a.click();document.body.removeChild(a);}}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(192,80,240,.1)",border:"1px solid rgba(192,80,240,.25)",color:"#c080f0",cursor:"pointer"}}>
                    <span style={{fontSize:18}}>📷</span>
                    <div><div style={{fontSize:12,fontWeight:800,fontFamily:"'Nunito'"}}>@{sv.ig}</div><div style={{fontSize:9,color:"rgba(192,80,240,.7)"}}>Instagram</div></div>
                    <span style={{marginLeft:"auto"}}>→</span>
                  </div>
                </div>
              )}
              {customLabels.length>0&&(
                <div style={{padding:"0 14px 10px"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:6,textTransform:"uppercase"}}>🏷️ Теги</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {customLabels.map(l=>{
                      const has=(venueLabels[String(sv.id)]||[]).includes(l.id);
                      return(
                        <button key={l.id} style={{padding:"4px 10px",borderRadius:12,border:`1.5px solid ${has?l.color:"var(--border)"}`,background:has?`${l.color}22`:"transparent",color:has?l.color:"var(--txt3)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'"}}
                          onClick={()=>{const cur=venueLabels[String(sv.id)]||[];const updated={...venueLabels,[String(sv.id)]:has?cur.filter(x=>x!==l.id):[...cur,l.id]};setVenueLabels(updated);saveVenueLabels(updated);}}>
                          {l.emoji} {l.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{padding:"0 14px 10px"}}>
                <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:5,textTransform:"uppercase"}}>📝 Заметка</div>
                <textarea value={venueNotes[sv.id]||""} onChange={e=>{const u={...venueNotes,[sv.id]:e.target.value};setVenueNotes(u);saveVenueNotes(u);}}
                  placeholder="Общее впечатление..." rows={3}
                  style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none",resize:"none"}}/>
              </div>
              <div style={{padding:"0 14px 8px"}}>
                <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid var(--grn2)",background:"rgba(90,156,53,.12)",color:"var(--grn3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                  onClick={()=>setShowVisitModal(true)}>{visited?"✓ Отметить ещё":"✓ Отметить посещение"}</button>
              </div>
              <div style={{padding:"0 14px 8px"}}>
                <button className="btn-outline" style={{width:"100%"}} onClick={()=>setShowMenuModal(true)}>
                  📋 {menuPhotos[sv.id]?.length>0?`Меню (${menuPhotos[sv.id].length} фото)`:"Добавить меню"}
                </button>
              </div>
              <div style={{padding:"0 14px 12px"}}>
                {sv._confirmDelete?(
                  <div style={{borderRadius:10,border:"1.5px solid rgba(200,50,50,.5)",background:"rgba(200,50,50,.1)",padding:"10px 12px"}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#d06060",marginBottom:8,textAlign:"center"}}>Удалить «{sv.n}»?</div>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{flex:1,padding:8,borderRadius:8,border:"none",background:"#c03030",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                        onClick={()=>{
                          if(sv.custom){const u=customVenues.filter(v=>v.id!==sv.id);setCustomVenues(u);saveCustomVenues(u);}
                          else{const tombstone={id:sv.id,deleted:true};const u=[...customVenues.filter(v=>v.id!==sv.id),tombstone];setCustomVenues(u);saveCustomVenues(u);}
                          setSv(null);
                        }}>Удалить</button>
                      <button style={{flex:1,padding:8,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                        onClick={()=>setSv(v=>({...v,_confirmDelete:false}))}>Отмена</button>
                    </div>
                  </div>
                ):(
                  <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.07)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                    onClick={()=>setSv(v=>({...v,_confirmDelete:true}))}>🗑 Удалить заведение</button>
                )}
              </div>
              {myci.length>0&&<>
                <div className="sec-hdr">📸 Мои чекины <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{myci.length}</span></div>
                {myci.map((c,i)=>(
                  <div key={i} className="ci" style={{position:"relative"}}>
                    {checkinPhotos[c.id]&&<img src={checkinPhotos[c.id]} alt="" style={{width:"100%",height:120,objectFit:"cover",borderRadius:8,marginBottom:6}}/>}
                    <div className="ci-top"><span className="ci-dish">{c.dish||"Чекин"}</span><span className="ci-date">{c.date} {c.time}</span></div>
                    {c.rating>0&&<div style={{fontSize:11,color:"var(--gold)",margin:"2px 0"}}>★ {c.rating}</div>}
                    {c.review&&<div className="ci-review">«{c.review}»</div>}
                    <button onClick={async()=>{if(c.photoKey){try{await storage.delete(c.photoKey);}catch(e){}}const u=checkins.filter(ch=>ch.id!==c.id);setCheckins(u);saveCheckins(u);setCheckinPhotos(p=>{const n={...p};delete n[c.id];return n;});}}
                      style={{display:"block",marginTop:6,marginLeft:"auto",padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>🗑 удалить</button>
                  </div>
                ))}
              </>}
              <div style={{height:20}}/>
            </div>
          );
        })()}

        {/* Нижняя шторка со списком/вишлистом/чекинами/профилем */}
        {!sv&&(
          <div className="mob-sheet" style={{
            height: sheetOpen ? `${sheetHeight}vh` : "36px",
            transition: sheetDragRef.current ? "none" : "height .3s cubic-bezier(.4,0,.2,1)"
          }}>
            <div className="mob-sheet-handle"
              onTouchStart={e=>{
                const startY=e.touches[0].clientY;
                const startH=sheetHeight;
                let moved=false;
                const onMove=ev=>{
                  moved=true;
                  const dy=startY-ev.touches[0].clientY;
                  const newH=Math.min(72,Math.max(20,startH+dy/window.innerHeight*100));
                  setSheetHeight(newH);
                  if(!sheetOpen)setSheetOpen(true);
                };
                const onEnd=()=>{
                  sheetDragRef.current=false;
                  if(!moved){
                    // просто тап — toggle
                    setSheetOpen(o=>{
                      if(!o){setSheetHeight(55);}
                      return !o;
                    });
                  } else {
                    // после драга — если совсем маленькая то свернуть
                    if(sheetHeight<15)setSheetOpen(false);
                  }
                  document.removeEventListener("touchmove",onMove);
                  document.removeEventListener("touchend",onEnd);
                };
                sheetDragRef.current=true;
                document.addEventListener("touchmove",onMove,{passive:true});
                document.addEventListener("touchend",onEnd);
              }}
            >
              <span className="mob-sheet-tip">{sheetOpen?"нажми, чтобы свернуть":"нажми, чтобы развернуть"}</span>
            </div>

            {tab==="map"&&(
              <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
                <div style={{padding:"8px 10px 4px",position:"relative"}}>
                  <span style={{position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
                  <input className="srch" placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
                </div>
                <div className="chips" onMouseDown={e=>{const el=e.currentTarget;el.classList.add("dragging");const sx=e.pageX-el.offsetLeft,sl=el.scrollLeft;const mv=ev=>{el.scrollLeft=sl-(ev.pageX-el.offsetLeft-sx);};const up=()=>{el.classList.remove("dragging");window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);}}>
                  {CATS.map(c=><button key={c.k} className={`chip ${cf===c.k?"a":""}`} onClick={()=>setCf(c.k)}>{c.l}</button>)}
                  {customLabels.map(l=><button key={`lbl_${l.id}`} className={`chip ${cf===`lbl_${l.id}`?"a":""}`} onClick={()=>setCf(`lbl_${l.id}`)}>{l.emoji} {l.name}</button>)}
                  <button className="chip" style={{borderStyle:"dashed",opacity:.7}} onClick={()=>setShowLabelManager(true)}>⚙️</button>
                </div>
                <div style={{padding:"2px 12px 4px",fontSize:9,color:"var(--txt3)",fontWeight:700,display:"flex",justifyContent:"space-between"}}>
                  <span>{fl.length} заведений</span>
                  <button onClick={()=>setShowAddVenue(true)} style={{padding:"2px 8px",borderRadius:6,background:"var(--grn)",color:"#fff",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>+ Добавить</button>
                </div>
                <div className="sc">
                  {fl.map(v=>{
                    const visited=visitedIds.has(String(v.id));
                    const col=VENUE_COLOR(visited);
                    return(
                      <div key={v.id} className="vi" onClick={()=>{setSv(v);mapInst.current?.flyTo([v.lat,v.lng],16,{duration:.5})}}>
                        <div className="vi-strip" style={{background:col.accent}}/>
                        <div className="vi-icon" style={{background:col.bg}}>{v.i}</div>
                        <div className="vi-info"><div className="vi-name">{v.n}</div><div className="vi-sub">{v.a}{v.s?` · ${v.s}`:""}</div></div>
                        <div className="vi-right">
                          {mm==="city"&&v.r>0&&<div className="vi-rating">★ {v.r}</div>}
                          {mm==="my"&&(()=>{const myR=checkins.filter(c=>c.venueId===v.id&&c.rating>0);if(!myR.length)return null;const avg=(myR.reduce((s,c)=>s+c.rating,0)/myR.length).toFixed(1);return<div className="vi-rating" style={{color:"var(--grn3)"}}>★ {avg}</div>;})()}
                          {visited&&<div className="vi-visited"/>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab==="wishlist"&&(
              <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
                <div className="wl-tabs">{["venues","done"].map(k=><button key={k} className={`wl-tab ${wt===k?"a":""}`} onClick={()=>setWt(k)}>{k==="venues"?"📍 Места":"✅ Готово"}</button>)}</div>
                <div className="sc">
                  {wt==="venues"&&(wishVenues.length===0?<div className="empty"><div className="empty-ico">📌</div><div className="empty-txt">Нет мест</div></div>:wishVenues.map((w,i)=>(
                    <div key={i} className="wi"><div className="wic">{w.c}</div><div className="wif"><div className="win">{w.n}</div></div><button className="wr" onClick={()=>removeWishVenue(w.id)}>×</button></div>
                  )))}
                  {wt==="done"&&checkins.slice(0,20).map((c,i)=>(
                    <div key={i} className="wi" style={{opacity:.7}}><div className="wic">✅</div><div className="wif"><div className="win" style={{textDecoration:"line-through"}}>{c.venueName}</div><div className="wint">{c.date}</div></div></div>
                  ))}
                </div>
              </div>
            )}

            {tab==="checkins"&&(
              <div className="sc">
                {checkins.length===0?<div className="empty"><div className="empty-ico">📸</div><div className="empty-txt">Нет чекинов</div></div>:checkins.map((c,i)=>(
                  <div key={i} className="ck" style={{display:"flex",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="ck-venue">{c.venueName}</div>
                      <div className="ck-meta">
                        <span style={{color:"var(--gold)",fontSize:10}}>{c.rating>0?`★ ${c.rating}`:""}</span>
                        {c.dish&&<span className="ck-dish">{c.dish}</span>}
                        <span className="ck-date">{c.date}</span>
                      </div>
                      {c.review&&<div className="ck-review">«{c.review}»</div>}
                    </div>
                    <button onClick={async()=>{if(c.photoKey){try{await storage.delete(c.photoKey);}catch(e){}}const u=checkins.filter(ch=>ch.id!==c.id);setCheckins(u);saveCheckins(u);}}
                      style={{flexShrink:0,marginTop:2,width:20,height:20,borderRadius:"50%",border:"1px solid var(--border)",background:"none",color:"var(--txt3)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {tab==="profile"&&(
              <div className="sc">
                <div className="prof-hero">
                  <div className="prof-av">{user.name[0]}</div>
                  <div className="prof-name">{user.name}</div>
                  <div className="prof-title">Lv.{user.level} · {user.title}</div>
                  <div className="prof-xp-bar"><div className="prof-xp-fill" style={{width:`${(user.xp/user.nxp)*100}%`}}/></div>
                  <div className="prof-xp-lbl">{user.xp} / {user.nxp} XP</div>
                </div>
                <div className="stats-grid">
                  {[{n:visitedIds.size,l:"Открыто"},{n:checkins.length,l:"Чекинов"},{n:checkins.filter(c=>c.review&&c.review.trim()).length,l:"Отзывов"},{n:checkins.filter(c=>c.photoKey).length,l:"Фото"}].map((s,i)=>(
                    <div key={i} className="stat-card"><div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div></div>
                  ))}
                </div>
                <div className="sec-hdr">🏆 Достижения</div>
                {computedAchs.map((a,i)=>(
                  <div key={i} className="ach">
                    <div className={`ach-icon ${a.ok?"done":""}`}>{a.i}</div>
                    <div className="ach-info"><div className="ach-name">{a.n}</div><div className="ach-desc">{a.d}</div>{!a.ok&&<div className="ach-bar"><div className="ach-bar-fill" style={{width:`${Math.min(100,(a.p/a.t)*100)}%`}}/></div>}</div>
                    <div className="ach-cnt">{a.ok?"✅":`${a.p}/${a.t}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Фиксированный таббар снизу */}
        <div className="mob-tabs">
          {[["map","📍","Места"],["wishlist","📌","Вишлист"],["checkins","✅","Чекины"],["profile","👤","Профиль"]].map(([k,ico,lbl])=>(
            <button key={k} className={`mob-tab ${tab===k?"a":""}`} onClick={()=>{setTab(k);if(!sheetOpen)setSheetOpen(true);}}>
              <span className="ico">{ico}</span>{lbl}
            </button>
          ))}
        </div>

      </>
    ) : (
      <>
      <div className="hdr">
        <div className="logo">FOG<span>EAT</span></div>
        <div className="hmode">
          <button className={mm==="city"?"a":""} onClick={()=>setMm("city")}>🌍 Город</button>
          <button className={mm==="my"?"a":""} onClick={()=>setMm("my")}>👤 Моя</button>
        </div>
        <div className="hprog">
          <span className="hprog-txt">{visitedIds.size}/{allVenues.length}</span>
          <div className="hprog-bar"><div className="hprog-fill" style={{width:`${(visitedIds.size/allVenues.length)*100}%`}}/></div>
        </div>
        <div className="havatar" onClick={()=>setTab("profile")}>
          <div className="hav-icon">{user.name[0]}</div>
          <div><div className="hav-name">{user.name}</div><div className="hav-lvl">Lv.{user.level} {user.title}</div></div>
        </div>
      </div>

      <div className="main">

        {/* SIDEBAR */}
        <div className={`side ${sideOpen?"":"cl"}`}>
          <div className="tabs">
            {Object.entries(TAB_ICONS).map(([k,ico])=>(
              <button key={k} className={`tab-btn ${tab===k?"a":""}`} onClick={()=>setTab(k)}>
                {ico}<span className="tab-lbl">{k==="map"?"Места":k==="wishlist"?"Вишлист":k==="checkins"?"Чекины":"Профиль"}</span>
              </button>
            ))}
          </div>

          {/* MAP TAB */}
          {tab==="map"&&(
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
              <div className="srch-wrap">
                <span className="srch-ico">🔍</span>
                <input className="srch" placeholder="Поиск заведений..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="chips"
                onMouseDown={e=>{
                  const el=e.currentTarget;
                  el.classList.add("dragging");
                  const startX=e.pageX-el.offsetLeft;
                  const scrollLeft=el.scrollLeft;
                  const onMove=ev=>{
                    const x=ev.pageX-el.offsetLeft;
                    el.scrollLeft=scrollLeft-(x-startX);
                  };
                  const onUp=()=>{
                    el.classList.remove("dragging");
                    window.removeEventListener("mousemove",onMove);
                    window.removeEventListener("mouseup",onUp);
                  };
                  window.addEventListener("mousemove",onMove);
                  window.addEventListener("mouseup",onUp);
                }}>
                {CATS.map(c=><button key={c.k} className={`chip ${cf===c.k?"a":""}`} onClick={()=>setCf(c.k)}>{c.l}</button>)}
                {customLabels.map(l=><button key={`lbl_${l.id}`} className={`chip ${cf===`lbl_${l.id}`?"a":""}`} onClick={()=>setCf(`lbl_${l.id}`)}>{l.emoji} {l.name}</button>)}
                <button className="chip" style={{borderStyle:"dashed",opacity:.7}} onClick={()=>setShowLabelManager(true)}>⚙️</button>
              </div>
              <div style={{padding:"5px 12px 4px",fontSize:9,color:"var(--txt3)",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{fl.length} {mm==="my"?"посещено":"заведений"}</span>
                <button onClick={()=>setShowAddVenue(true)} style={{padding:"2px 8px",borderRadius:6,background:"var(--grn)",color:"#fff",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>+ Добавить</button>
              </div>
              <div className="sc">
                {fl.map(v=>{
                  const visited=visitedIds.has(String(v.id));
                  const col=VENUE_COLOR(visited);
                  return(
                    <div key={v.id} className="vi" onClick={()=>{setSv(v);mapInst.current?.flyTo([v.lat,v.lng],16,{duration:.5})}}>
                      <div className="vi-strip" style={{background:col.accent}}/>
                      <div className="vi-icon" style={{background:col.bg}}>{v.i}</div>
                      <div className="vi-info">
                        <div className="vi-name">{v.n}</div>
                        <div className="vi-sub">{v.a}{v.s?` · ${v.s}`:""}</div>
                      </div>
                      <div className="vi-right">
                        {mm==="city"&&v.r>0&&<div className="vi-rating">★ {v.r}</div>}
                        {mm==="my"&&(()=>{
                          const myR=checkins.filter(c=>c.venueId===v.id&&c.rating>0);
                          if(!myR.length)return null;
                          const avg=(myR.reduce((s,c)=>s+c.rating,0)/myR.length).toFixed(1);
                          return <div className="vi-rating" style={{color:"var(--grn3)",borderColor:"rgba(90,156,53,.3)"}}>★ {avg}</div>;
                        })()}
                        {visited&&<div className="vi-visited" title="Ты здесь был"/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEED TAB */}
          {/* WISHLIST TAB */}
          {tab==="wishlist"&&(
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
              <div className="wl-tabs">
                {["venues","done"].map(k=>(
                  <button key={k} className={`wl-tab ${wt===k?"a":""}`} onClick={()=>setWt(k)}>
                    {k==="venues"?"📍 Места":"✅ Готово"}
                  </button>
                ))}
              </div>
              <div className="sc">
                {wt==="venues"&&(wishVenues.length===0?(
                  <div className="empty"><div className="empty-ico">📌</div><div className="empty-txt">Нет сохранённых мест</div></div>
                ):wishVenues.map((w,i)=>(
                  <div key={i} className="wi">
                    <div className="wic">{w.c}</div>
                    <div className="wif"><div className="win">{w.n}</div>{w.no&&<div className="wint">{w.no}</div>}</div>
                    <button className="wr" onClick={()=>removeWishVenue(w.id)}>×</button>
                  </div>
                )))}
                {wt==="done"&&checkins.slice(0,20).map((c,i)=>(
                  <div key={i} className="wi" style={{opacity:.7}}>
                    <div className="wic">✅</div>
                    <div className="wif">
                      <div className="win" style={{textDecoration:"line-through"}}>{c.venueName}</div>
                      <div className="wint">{c.date} · {c.dish||"Чекин"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHECKINS TAB */}
          {tab==="checkins"&&(
            <div className="sc">
              {checkins.length===0?(
                <div className="empty">
                  <div className="empty-ico">📸</div>
                  <div className="empty-txt">Ещё нет чекинов</div>
                  <div style={{fontSize:10,marginTop:6,color:"var(--txt3)"}}>Нажми + на карте чтобы добавить</div>
                </div>
              ):checkins.map((c,i)=>(
                <div key={i} className="ck" style={{display:"flex",alignItems:"flex-start",gap:6}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="ck-venue">{c.venueName}</div>
                    <div className="ck-meta">
                      <span style={{color:"var(--gold)",fontSize:10}}>{c.rating>0?(`★ ${c.rating}`):""}</span>
                      {c.dish&&<span className="ck-dish">{c.dish}</span>}
                      <span className="ck-date">{c.date}</span>
                    </div>
                    {c.review&&<div className="ck-review">«{c.review}»</div>}
                  </div>
                  <button onClick={async()=>{
                    if(c.photoKey){try{await storage.delete(c.photoKey);}catch(e){}}
                    const updated=checkins.filter(ch=>ch.id!==c.id);
                    setCheckins(updated);saveCheckins(updated);
                  }} style={{flexShrink:0,marginTop:2,width:20,height:20,borderRadius:"50%",border:"1px solid var(--border)",background:"none",color:"var(--txt3)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab==="profile"&&(
            <div className="sc">
              <div className="prof-hero">
                <div className="prof-av">{user.name[0]}</div>
                <div className="prof-name">{user.name}</div>
                <div className="prof-title">Lv.{user.level} · {user.title}</div>
                <div className="prof-xp-bar"><div className="prof-xp-fill" style={{width:`${(user.xp/user.nxp)*100}%`}}/></div>
                <div className="prof-xp-lbl">{user.xp} / {user.nxp} XP</div>
              </div>
              <div className="stats-grid">
                {[
                  {n:visitedIds.size,l:"Открыто"},
                  {n:checkins.length,l:"Чекинов"},
                  {n:checkins.filter(c=>c.review&&c.review.trim()).length,l:"Отзывов"},
                  {n:checkins.filter(c=>c.photoKey).length,l:"Фото"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div className="stat-n">{s.n}</div>
                    <div className="stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="sec-hdr">🏆 Достижения</div>
              {computedAchs.map((a,i)=>(
                <div key={i} className="ach">
                  <div className={`ach-icon ${a.ok?"done":""}`}>{a.i}</div>
                  <div className="ach-info">
                    <div className="ach-name">{a.n}</div>
                    <div className="ach-desc">{a.d}</div>
                    {!a.ok&&<div className="ach-bar"><div className="ach-bar-fill" style={{width:`${Math.min(100,(a.p/a.t)*100)}%`}}/></div>}
                  </div>
                  <div className="ach-cnt">{a.ok?"✅":`${a.p}/${a.t}`}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAP AREA */}
        <div className="ma">
          <button className="tog" onClick={()=>setSideOpen(!sideOpen)}>{sideOpen?"◀":"▶"}</button>
          <div id="mapEl" ref={mapRef}/>
          
          <button className="fab" onClick={()=>setShowAddVenue(true)}>+</button>

          {/* VENUE DETAIL PANEL */}
          {sv&&allVenues.find(v=>v.id===sv.id)&&(()=>{
            const visited=visitedIds.has(String(sv.id));
            const col=VENUE_COLOR(visited);
            const wished=wishVenues.find(w=>w.id===sv.id);
            const myci=checkins.filter(c=>c.venueId===sv.id);
            return(
              <div className="vp">
                <div className="vp-hero" style={{background:`linear-gradient(160deg,${col.bg},var(--bg2))`}}>
                  <button className="vp-close" onClick={()=>setSv(null)}>✕</button>
                  <span className="vp-emoji">{sv.i}</span>
                  <div className="vp-name">{sv.n}</div>
                  <div className="vp-addr">📍 {sv.a}</div>
                  <div className="vp-tags">
                    {mm==="city"&&sv.r>0&&<span className="vp-tag gold">★ {sv.r} · {sv.rc} отз.</span>}
                    {mm==="my"&&(()=>{
                      const myRatings=myci.filter(c=>c.rating>0);
                      if(myRatings.length===0)return null;
                      const avg=(myRatings.reduce((s,c)=>s+c.rating,0)/myRatings.length).toFixed(1);
                      return <span className="vp-tag gold">★ {avg} · моя оценка</span>;
                    })()}
                    <span className="vp-tag">{sv.c}</span>
                    {sv.s&&<span className="vp-tag">{sv.s}</span>}
                    {visited&&<span className="vp-tag grn">✓ Ты здесь был</span>}
                  </div>
                </div>
                <div className="vp-actions">
                  <button className="btn-primary" onClick={()=>{setSelectedVenueForCheckin(sv);setSc(true)}}>📸 Чекин</button>
                  <button className={`btn-outline ${wished?"active":""}`} onClick={()=>wished?removeWishVenue(sv.id):addWishVenue(sv)}>
                    {wished?"📌 В вишлисте":"📌 Хочу сюда"}
                  </button>
                </div>
                {sv.ig&&(
                  <div style={{padding:"0 14px 10px"}}>
                    <div onClick={()=>{const a=document.createElement("a");a.href=`https://instagram.com/${sv.ig}`;a.target="_blank";a.rel="noreferrer";document.body.appendChild(a);a.click();document.body.removeChild(a);}}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(192,80,240,.1)",border:"1px solid rgba(192,80,240,.25)",color:"#c080f0",cursor:"pointer"}}>
                      <span style={{fontSize:18}}>📷</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:800,fontFamily:"'Nunito'"}}>@{sv.ig}</div>
                        <div style={{fontSize:9,color:"rgba(192,80,240,.7)"}}>Instagram</div>
                      </div>
                      <span style={{marginLeft:"auto",fontSize:12}}>→</span>
                    </div>
                  </div>
                )}
                {/* VENUE LABELS */}
                {customLabels.length>0&&(
                  <div style={{padding:"0 14px 10px"}}>
                    <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>🏷️ Теги</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {customLabels.map(l=>{
                        const has=(venueLabels[String(sv.id)]||[]).includes(l.id);
                        return(
                          <button key={l.id}
                            style={{padding:"4px 10px",borderRadius:12,border:`1.5px solid ${has?l.color:"var(--border)"}`,background:has?`${l.color}22`:"transparent",color:has?l.color:"var(--txt3)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'",transition:"all .15s"}}
                            onClick={()=>{
                              const cur=venueLabels[String(sv.id)]||[];
                              const updated={...venueLabels,[String(sv.id)]:has?cur.filter(x=>x!==l.id):[...cur,l.id]};
                              setVenueLabels(updated);saveVenueLabels(updated);
                            }}>
                            {l.emoji} {l.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* VENUE NOTE */}
                <div style={{padding:"0 14px 10px"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>📝 Заметка</div>
                  <textarea
                    value={venueNotes[sv.id]||""}
                    onChange={e=>{
                      const updated={...venueNotes,[sv.id]:e.target.value};
                      setVenueNotes(updated);
                      saveVenueNotes(updated);
                    }}
                    placeholder="Общее впечатление, что попробовать, с кем прийти..."
                    rows={3}
                    style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none",resize:"none",transition:"border-color .2s"}}
                    onFocus={e=>e.target.style.borderColor="var(--txt2)"}
                    onBlur={e=>e.target.style.borderColor="var(--border)"}
                  />
                </div>
                <div style={{padding:"0 14px 8px"}}>
                  <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid var(--grn2)",background:"rgba(90,156,53,.12)",color:"var(--grn3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                    onClick={()=>setShowVisitModal(true)}>
                    {visited?"✓ Был здесь · отметить ещё":"✓ Отметить посещение"}
                  </button>
                </div>
                <div style={{padding:"0 14px 12px"}}>
                  <button className="btn-outline" style={{width:"100%"}} onClick={()=>setShowMenuModal(true)}>
                    📋 {menuPhotos[sv.id]?.length>0?`Меню (${menuPhotos[sv.id].length} фото)`:"Добавить меню"}
                  </button>
                </div>
                <div style={{padding:"0 14px 12px"}}>
                  {sv._confirmDelete?(
                    <div style={{borderRadius:10,border:"1.5px solid rgba(200,50,50,.5)",background:"rgba(200,50,50,.1)",padding:"10px 12px"}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#d06060",marginBottom:8,textAlign:"center"}}>Удалить «{sv.n}»?</div>
                      <div style={{display:"flex",gap:6}}>
                        <button style={{flex:1,padding:8,borderRadius:8,border:"none",background:"#c03030",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                          onClick={()=>{
                            if(sv.custom){
                              const updated=customVenues.filter(v=>v.id!==sv.id);
                              setCustomVenues(updated);saveCustomVenues(updated);
                            } else {
                              const tombstone={id:sv.id,deleted:true};
                              const updated=[...customVenues.filter(v=>v.id!==sv.id),tombstone];
                              setCustomVenues(updated);saveCustomVenues(updated);
                            }
                            setSv(null);
                          }}>Удалить</button>
                        <button style={{flex:1,padding:8,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                          onClick={()=>setSv(v=>({...v,_confirmDelete:false}))}>Отмена</button>
                      </div>
                    </div>
                  ):(
                    <button
                      style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.07)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                      onClick={()=>setSv(v=>({...v,_confirmDelete:true}))}>
                      🗑 Удалить заведение
                    </button>
                  )}
                </div>
                {menuPhotos[sv.id]?.length>0&&<>
                  <div className="sec-hdr">📋 Меню заведения <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{menuPhotos[sv.id].length} фото</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"4px 14px 12px"}}>
                    {menuPhotos[sv.id].map((p,i)=>(
                      <div key={i} style={{width:96,height:96,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--border)"}}>
                        <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        <button onClick={()=>{
                          const updated={...menuPhotos,[sv.id]:menuPhotos[sv.id].filter((_,j)=>j!==i)};
                          setMenuPhotos(updated);saveMenuPhotos(updated);
                        }} style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:"50%",background:"rgba(180,30,30,.85)",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>×</button>
                      </div>
                    ))}
                    <div onClick={()=>setShowMenuModal(true)} style={{width:96,height:96,borderRadius:8,background:"var(--bg3)",border:"2px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:22,color:"var(--txt3)"}}>+</div>
                  </div>
                </>}
                {sv.dishes&&<>
                  <div className="sec-hdr">🍽️ Народное меню <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{sv.dishes.length} блюд</span></div>
                  {sv.dishes.map(d=>(
                    <div key={d.id} className="dr">
                      <div className="de">{d.ph}</div>
                      <div className="di">
                        <div className="dn">{d.nm}</div>
                        <div className="dt">{d.tg}</div>
                        <div className="ds"><span style={{color:"var(--gold)"}}>★ {d.rt}</span> · {d.pr}₽ · {d.rv} отз.</div>
                      </div>
                      <button className={`wish-btn ${wishDishes.find(w=>w.d===d.nm)?"on":""}`}
                        onClick={()=>{
                          if(wishDishes.find(w=>w.d===d.nm)){
                            const u=wishDishes.filter(w=>w.d!==d.nm);setWishDishes(u);saveWishDishes(u);
                          }else{
                            const u=[{v:sv.n,d:d.nm,e:d.ph},...wishDishes];setWishDishes(u);saveWishDishes(u);
                          }
                        }}>
                        {wishDishes.find(w=>w.d===d.nm)?"✓":"+ Хочу"}
                      </button>
                    </div>
                  ))}
                </>}
                {myci.length>0&&<>
                  <div className="sec-hdr">📸 Мои чекины <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{myci.length}</span></div>
                  {myci.map((c,i)=>(
                    <div key={i} className="ci" style={{position:"relative"}}>
                      {checkinPhotos[c.id]&&<img src={checkinPhotos[c.id]} alt="" style={{width:"100%",height:120,objectFit:"cover",borderRadius:8,marginBottom:6}}/>}
                      <div className="ci-top">
                        <span className="ci-dish">{c.dish||"Чекин"}</span>
                        <span className="ci-date">{c.date} {c.time}</span>
                      </div>
                      {c.rating>0&&<div style={{fontSize:11,color:"var(--gold)",margin:"2px 0"}}>★ {c.rating}</div>}
                      {c.price&&<div style={{fontSize:10,color:"var(--txt3)"}}>{c.price}₽</div>}
                      {c.review&&<div className="ci-review">«{c.review}»</div>}
                      <button onClick={async()=>{
                        if(c.photoKey){try{await window.storage.delete(c.photoKey);}catch(e){}}
                        const updated=checkins.filter(ch=>ch.id!==c.id);
                        setCheckins(updated);saveCheckins(updated);
                        setCheckinPhotos(p=>{const n={...p};delete n[c.id];return n;});
                      }} style={{display:"block",marginTop:6,marginLeft:"auto",padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>🗑 удалить</button>
                    </div>
                  ))}
                </>}
              </div>
            );
          })()}
        </div>
      </div>
      </>
    )} {/* конец десктопного layout */}
    </div> {/* конец .app */}

    {/* CHECKIN MODAL */}
    {sc&&(
      <div className="mo" onClick={()=>{setSc(false);setCs(2);setCr(0);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");}}>
        <div className="md" onClick={e=>e.stopPropagation()}>
          <div className="md-head">
            <div className="md-title">🍽️ Блюдо и фото</div>
            {(sv||selectedVenueForCheckin)&&<div style={{fontSize:11,color:"var(--txt3)",textAlign:"center",marginBottom:6}}>{(selectedVenueForCheckin||sv).n}</div>}
          </div>
          <div className="md-body">
              {/* PHOTO UPLOAD */}
              <div style={{marginBottom:10}}>
                <label style={{display:"block",cursor:"pointer"}}>
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const file=e.target.files[0];
                      if(!file)return;
                      const reader=new FileReader();
                      reader.onload=ev=>setCheckinPhoto(ev.target.result);
                      reader.readAsDataURL(file);
                    }}/>
                  {checkinPhoto
                    ? <div style={{width:"100%",height:140,borderRadius:10,overflow:"hidden",position:"relative",border:"1px solid var(--grn2)"}}>
                        <img src={checkinPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        <div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,.6)",borderRadius:6,padding:"2px 7px",fontSize:10,color:"#fff"}}>📷 нажми чтобы заменить</div>
                      </div>
                    : <div style={{width:"100%",height:100,borderRadius:10,background:"var(--bg3)",border:"2px dashed var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,color:"var(--txt3)",fontSize:12,transition:"all .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt3)"}}>
                        <span style={{fontSize:28}}>📷</span>
                        <span>Добавить фото блюда (необязательно)</span>
                      </div>
                  }
                </label>
              </div>

              <input className="minput" placeholder="Название блюда" value={dishName} onChange={e=>setDishName(e.target.value)}/>
              <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
                {["🫓 Пироги","🥩 Мясо","🥗 Салаты","☕ Напитки","🍺 Пиво"].map(t=>(
                  <button key={t} className={`chip ${dishName===t.split(" ").slice(1).join(" ")?"a":""}`}
                    onClick={()=>setDishName(t.split(" ").slice(1).join(" "))}>{t}</button>
                ))}
              </div>
              <div style={{textAlign:"center",fontSize:11,fontWeight:800,marginBottom:4,color:"var(--txt2)"}}>Оценка</div>
              <Stars v={cr} onChange={setCr}/>
              <input className="minput" placeholder="Цена в ₽" value={price} onChange={e=>setPrice(e.target.value)}/>
              <textarea className="minput" placeholder="Коротко о впечатлении..." value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={2} style={{resize:"none"}}/>
              <button className="mbtn pri" disabled={cr===0} onClick={doCheckin}>✅ Сохранить чекин</button>
              <button className="mbtn sec" onClick={()=>{setSc(false);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");}}>Отмена</button>

          </div>
        </div>
      </div>
    )}

    {/* QUICK VISIT MODAL */}
    {showVisitModal&&sv&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>{setShowVisitModal(false);setVisitNote("");setVisitRating(0)}}>
        <div style={{width:380,background:"var(--bg2)",borderRadius:16,overflow:"hidden",border:"1px solid var(--border)"}}
          onClick={e=>e.stopPropagation()}>
          <div style={{padding:"20px 20px 0",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:6}}>{sv.i}</div>
            <div style={{fontFamily:"'Dela Gothic One'",fontSize:17,marginBottom:3}}>{sv.n}</div>
            <div style={{fontSize:11,color:"var(--txt3)",marginBottom:16}}>📍 {sv.a}</div>
          </div>
          <div style={{padding:"0 20px 20px"}}>

            {/* HALF-STAR RATING */}
            <div style={{textAlign:"center",fontSize:11,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>
              Оценка {visitRating>0?<span style={{color:"var(--gold)"}}>{visitRating} ★</span>:""}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:16,position:"relative",height:36}}>
              {[1,2,3,4,5].map(i=>{
                const full=visitRating>=i;
                const half=!full&&visitRating>=i-0.5;
                return(
                  <div key={i} style={{position:"relative",width:36,height:36,cursor:"pointer"}}>
                    {/* left half */}
                    <div style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",zIndex:2}}
                      onClick={()=>setVisitRating(i-0.5)}/>
                    {/* right half */}
                    <div style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",zIndex:2}}
                      onClick={()=>setVisitRating(i)}/>
                    {/* star bg (empty) */}
                    <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#252525"}}>★</span>
                    {/* star fill */}
                    {(full||half)&&<span style={{
                      position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:28,color:"var(--gold)",
                      clipPath:full?"none":"inset(0 50% 0 0)",
                      WebkitClipPath:full?"none":"inset(0 50% 0 0)",
                    }}>★</span>}
                  </div>
                );
              })}
            </div>

            <textarea
              style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,marginBottom:10,outline:"none",resize:"none"}}
              placeholder={"Заметка (необязательно)\nНапример: был с семьёй, приятная атмосфера..."}
              value={visitNote}
              onChange={e=>setVisitNote(e.target.value)}
              rows={3}
              onFocus={e=>e.target.style.borderColor="var(--grn2)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:6}}
              onClick={doQuickVisit}>✓ Отметить посещение</button>
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer"}}
              onClick={()=>{setShowVisitModal(false);setVisitNote("");setVisitRating(0)}}>Отмена</button>
          </div>
        </div>
      </div>
    )}

    {/* MENU PHOTO MODAL */}
    {showMenuModal&&sv&&(()=>{
      const MENU_EMOJIS=["📄","📃","📜","🗒️","📋","🖼️","📷","🍽️","🥘","🍱"];
      const addMenuPhoto=(emoji)=>{
        const now=new Date();
        const photo={emoji,date:now.toLocaleDateString("ru-RU"),time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`};
        const existing=menuPhotos[sv.id]||[];
        const updated={...menuPhotos,[sv.id]:[...existing,photo]};
        setMenuPhotos(updated);saveMenuPhotos(updated);
        setShowMenuModal(false);
      };
      return(
        <div className="mo" onClick={()=>setShowMenuModal(false)}>
          <div className="md" onClick={e=>e.stopPropagation()}>
            <div className="md-head">
              <div className="md-title">📋 Меню заведения</div>
              <div style={{fontSize:11,color:"var(--txt3)",marginBottom:6}}>{sv.n}</div>
            </div>
            <div className="md-body">
              <label style={{display:"block",cursor:"pointer",marginBottom:10}}>
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{
                    const file=e.target.files[0];
                    if(!file)return;
                    const reader=new FileReader();
                    reader.onload=ev=>{
                      const now=new Date();
                      const photo={
                        src:ev.target.result,
                        date:now.toLocaleDateString("ru-RU"),
                        time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
                      };
                      const existing=menuPhotos[sv.id]||[];
                      const updated={...menuPhotos,[sv.id]:[...existing,photo]};
                      setMenuPhotos(updated);saveMenuPhotos(updated);
                    };
                    reader.readAsDataURL(file);
                  }}/>
                <div style={{width:"100%",height:110,borderRadius:10,background:"var(--bg3)",border:"2px dashed var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:"var(--txt3)",fontSize:12,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt3)"}}>
                  <span style={{fontSize:30}}>📷</span>
                  <span>Добавить фото меню</span>
                </div>
              </label>
              {menuPhotos[sv.id]?.length>0&&<>
                <div style={{fontSize:11,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>Добавлено {menuPhotos[sv.id].length} фото</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                  {menuPhotos[sv.id].map((p,i)=>(
                    <div key={i} style={{width:90,height:90,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--border)"}}>
                      <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <button onClick={()=>{
                        const updated={...menuPhotos,[sv.id]:menuPhotos[sv.id].filter((_,j)=>j!==i)};
                        setMenuPhotos(updated);saveMenuPhotos(updated);
                      }} style={{position:"absolute",top:3,right:3,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,.7)",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.6)",fontSize:8,color:"#aaa",padding:"2px 4px",textAlign:"center"}}>{p.date}</div>
                    </div>
                  ))}
                </div>
              </>}
              <button className="mbtn sec" onClick={()=>setShowMenuModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      );
    })()}
    {/* LABEL MANAGER MODAL */}
    {showLabelManager&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>setShowLabelManager(false)}>
        <div style={{width:380,maxHeight:"80vh",background:"var(--bg2)",borderRadius:16,border:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"}}
          onClick={e=>e.stopPropagation()}>
          <div style={{padding:"16px 18px 12px",borderBottom:"1px solid var(--border)",fontFamily:"'Dela Gothic One'",fontSize:15}}>🏷️ Мои теги</div>
          <div style={{padding:"12px 18px",overflowY:"auto",flex:1}}>
            {customLabels.map(l=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:18}}>{l.emoji}</span>
                <span style={{flex:1,fontWeight:700,fontSize:12,color:l.color}}>{l.name}</span>
                <button onClick={()=>{
                  const updated=customLabels.filter(x=>x.id!==l.id);
                  setCustomLabels(updated);saveCustomLabels(updated);
                  const vl={};Object.entries(venueLabels).forEach(([k,v])=>{vl[k]=v.filter(x=>x!==l.id);});
                  setVenueLabels(vl);saveVenueLabels(vl);
                }} style={{padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:10,cursor:"pointer",fontFamily:"'Nunito'",fontWeight:700}}>
                  удалить
                </button>
              </div>
            ))}
            {customLabels.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"var(--txt3)",fontSize:12}}>Пока нет тегов</div>}

            <div style={{marginTop:14,padding:"12px",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>Новый тег</div>
              <div style={{display:"flex",gap:7,marginBottom:8}}>
                <input value={newLabelEmoji} onChange={e=>setNewLabelEmoji(e.target.value)}
                  style={{width:44,padding:"7px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:16,textAlign:"center",outline:"none"}}/>
                <input value={newLabelName} onChange={e=>setNewLabelName(e.target.value)}
                  placeholder="Название тега..."
                  style={{flex:1,padding:"7px 10px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none"}}/>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {["#e8a838","#5a9c35","#4a8fd4","#d45a9c","#d4845a","#9c5ad4","#5ad4c8"].map(c=>(
                  <div key={c} onClick={()=>setNewLabelColor(c)}
                    style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:newLabelColor===c?"3px solid #fff":"2px solid transparent",boxSizing:"border-box"}}/>
                ))}
              </div>
              <button disabled={!newLabelName.trim()}
                style={{width:"100%",padding:9,borderRadius:9,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",opacity:!newLabelName.trim()?0.5:1}}
                onClick={()=>{
                  const label={id:`lbl_${Date.now()}`,name:newLabelName.trim(),emoji:newLabelEmoji,color:newLabelColor};
                  const updated=[...customLabels,label];
                  setCustomLabels(updated);saveCustomLabels(updated);
                  setNewLabelName("");setNewLabelEmoji("⭐");setNewLabelColor("#e8a838");
                }}>+ Создать тег</button>
            </div>
          </div>
          <div style={{padding:"10px 18px",borderTop:"1px solid var(--border)"}}>
            <button style={{width:"100%",padding:10,borderRadius:9,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
              onClick={()=>setShowLabelManager(false)}>Закрыть</button>
          </div>
        </div>
      </div>
    )}

    {/* ADD VENUE MODAL */}
    {showAddVenue&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>setShowAddVenue(false)}>
        <div style={{width:400,maxHeight:"88vh",background:"var(--bg2)",borderRadius:16,border:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden",color:"var(--txt)"}}
          onClick={e=>e.stopPropagation()}>
          <div style={{padding:"16px 18px 0",textAlign:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Dela Gothic One'",fontSize:16,marginBottom:12}}>📍 Новое заведение</div>
          </div>
          <div style={{padding:"0 18px 18px",overflowY:"auto",flex:1}}>

            {/* FIELDS */}
            {[
              {k:"n",label:"Название *",ph:"Например: Новое место"},
              {k:"a",label:"Адрес",ph:"ул. Коста, 10"},
              {k:"s",label:"Кухня / описание",ph:"Итальянская, гриль..."},
              {k:"r",label:"Рейтинг (0–5)",ph:"4.5"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>{f.label}</div>
                <input value={newV[f.k]} onChange={e=>setNewV(p=>({...p,[f.k]:e.target.value}))}
                  placeholder={f.ph}
                  style={{width:"100%",padding:"8px 10px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none"}}/>
              </div>
            ))}

            <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:4}}>Категория</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
              {["Ресторан","Кафе","Бар","Пиццерия","Хинкальная","Бургерная","Фастфуд","Гриль-бар","Суши-бар"].map(cat=>(
                <button key={cat} onClick={()=>setNewV(p=>({...p,c:cat}))}
                  style={{padding:"4px 9px",borderRadius:12,border:`1.5px solid ${newV.c===cat?"var(--grn2)":"var(--border)"}`,background:newV.c===cat?"var(--grn)":"transparent",color:newV.c===cat?"#fff":"var(--txt2)",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'"}}>
                  {cat}
                </button>
              ))}
            </div>

            {/* GEO */}
            <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:6}}>Местоположение *</div>

            {/* Geocoder */}
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <input value={geoSearch} onChange={e=>setGeoSearch(e.target.value)}
                onKeyDown={async e=>{
                  if(e.key!=="Enter")return;
                  setGeoLoading(true);
                  try{
                    const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geoSearch+", Владикавказ")}&format=json&limit=1`);
                    const data=await res.json();
                    if(data[0]){
                      placeTempMarker(parseFloat(data[0].lat),parseFloat(data[0].lon));
                    }
                  }catch(e){}
                  setGeoLoading(false);
                }}
                placeholder="Поиск по названию → Enter"
                style={{flex:1,padding:"8px 10px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:11,outline:"none"}}/>
              {geoLoading&&<div style={{fontSize:10,color:"var(--txt3)",alignSelf:"center"}}>...</div>}
            </div>

            {/* Place on map button */}
            <button
              style={{width:"100%",padding:"9px",borderRadius:9,border:`2px dashed ${newV.lat?"var(--grn2)":"var(--border)"}`,background:newV.lat?"rgba(90,156,53,.1)":"transparent",color:newV.lat?"var(--grn3)":"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",marginBottom:4,transition:"all .2s"}}
              onClick={()=>{
                setShowAddVenue(false);
                placingMarkerRef.current=true;
                setPlacingMarker(true);
                if(mapInst.current)mapInst.current.getContainer().style.cursor="crosshair";
              }}>
              {newV.lat?"📍 Метка установлена — нажми чтобы переставить":"🗺️ Нажми и поставь метку на карте"}
            </button>
            {newV.lat&&<div style={{fontSize:9,color:"var(--txt3)",textAlign:"center",marginBottom:10}}>или перетащи оранжевый маркер на карте</div>}
            {!newV.lat&&<div style={{fontSize:9,color:"var(--txt3)",textAlign:"center",marginBottom:10}}>или найди через поиск выше</div>}

            <button
              style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:7,opacity:(!newV.n||!newV.lat)?0.5:1}}
              onClick={()=>{
                if(!newV.n){alert("Введи название заведения");return;}
                if(!newV.lat){alert("Поставь метку на карте");return;}
                const CAT_ICON={Ресторан:"🏛️",Кафе:"☕",Бар:"🍺",Пиццерия:"🍕",Хинкальная:"🥟",Бургерная:"🍔",Фастфуд:"🌯","Гриль-бар":"🥩","Суши-бар":"🍣"};
                const venue={
                  id:`custom_${Date.now()}`,
                  n:newV.n,c:newV.c,s:newV.s,a:newV.a,
                  i:CAT_ICON[newV.c]||"📍",
                  r:parseFloat(newV.r)||0,rc:0,
                  lat:parseFloat(newV.lat),lng:parseFloat(newV.lng),
                  custom:true,
                };
                const updated=[...customVenues,venue];
                setCustomVenues(updated);saveCustomVenues(updated);
                if(tempMarkerRef.current){tempMarkerRef.current.remove();tempMarkerRef.current=null;}
                setNewV({n:"",a:"",c:"Ресторан",s:"",r:"",lat:"",lng:""});
                setGeoSearch("");
                setShowAddVenue(false);
                if(mapInst.current){
                  mapInst.current.getContainer().style.cursor="";
                  mapInst.current.flyTo([venue.lat,venue.lng],16,{duration:.8});
                }
              }}>
              ✓ Добавить на карту
            </button>
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer"}}
              onClick={()=>{
                setShowAddVenue(false);
                if(tempMarkerRef.current){tempMarkerRef.current.remove();tempMarkerRef.current=null;}
                if(mapInst.current)mapInst.current.getContainer().style.cursor="";
                setNewV({n:"",a:"",c:"Ресторан",s:"",r:"",lat:"",lng:""});
                setGeoSearch("");
              }}>Отмена</button>
          </div>
        </div>
      </div>
    )}

    {/* MAP PLACEMENT HINT */}
    {placingMarker&&(
      <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:"rgba(232,168,56,.95)",color:"#1a1a0a",padding:"10px 20px",borderRadius:30,fontFamily:"'Nunito'",fontWeight:800,fontSize:13,pointerEvents:"none",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}}>
        📍 Нажми на карту чтобы поставить метку
      </div>
    )}

  </>);}
