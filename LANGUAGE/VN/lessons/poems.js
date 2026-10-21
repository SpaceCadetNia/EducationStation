// Poems for Đọc Thơ (poem reader). Strict JSON (quoted keys) so the Python
// tools can read it. Per line: "vi", "en" (translation of the line) and
// "align" (Vietnamese word -> English text copied exactly from "en").
// "book": 3 = Tiếng Việt 3 (none = Tiếng Việt 2); "prose": true = a reading
// passage (smaller text). "say" = text the voice tool speaks instead of "vi"
// (a respelling or extra comma when the recording gets a word wrong). "notes" are the workbook footnotes, shown with the line they belong to.
window.VN_POEMS = [
  {
    "id": "poem-em-yeu-men",
    "title": "Em Yêu Mến",
    "titleEn": "I Love Them Dearly",
    "source": "",
    "page": 9,
    "pdfPage": 25,
    "lines": [
      { "vi": "Em có ông bà,", "en": "I have grandparents,",
        "align": { "em": "I", "có": "have", "ông": "grandparents", "bà": "grandparents" } },
      { "vi": "Và có mẹ cha.", "en": "And I have a mother and father.",
        "align": { "và": "And", "có": "have", "mẹ": "a mother", "cha": "father" } },
      { "vi": "Anh chị một nhà,", "en": "Brothers and sisters, one family,",
        "align": { "anh": "Brothers", "chị": "sisters", "một": "one", "nhà": "family" } },
      { "vi": "Yêu mến thiết tha.", "en": "We love each other dearly.",
        "align": { "yêu": "love", "mến": "love", "thiết": "dearly", "tha": "dearly" } }
    ]
  },
  {
    "id": "poem-ga-gay",
    "title": "Gà Gáy",
    "titleEn": "The Rooster Crows",
    "source": "Em học vần lớp Năm",
    "page": 21,
    "pdfPage": 37,
    "lines": [
      { "vi": "Gà cồ hay gáy.", "en": "The rooster likes to crow.",
        "align": { "gà": "The rooster", "cồ": "The rooster", "hay": "likes to", "gáy": "crow" } },
      { "vi": "Gà mái hay la.", "en": "The hen likes to cluck.",
        "align": { "gà": "The hen", "mái": "The hen", "hay": "likes to", "la": "cluck" } },
      { "vi": "Gác cửa giữ nhà,", "en": "Guarding the door and keeping the house,",
        "align": { "gác": "Guarding", "cửa": "the door", "giữ": "keeping", "nhà": "the house" } },
      { "vi": "Là con chó mực.", "en": "Is the black dog.",
        "align": { "là": "Is", "con": "the", "chó": "dog", "mực": "black" },
        "notes": [ { "vi": "Chó mực: Chó có lông màu đen.", "en": "Chó mực: a dog with black fur." } ] },
      { "vi": "Ngủ gà ngủ gật,", "en": "Dozing and nodding off,",
        "align": { "ngủ": "Dozing", "gà": "Dozing", "gật": "nodding off" } },
      { "vi": "Là con mèo mun.", "en": "Is the black cat.",
        "align": { "là": "Is", "con": "the", "mèo": "cat", "mun": "black" },
        "notes": [ { "vi": "Mèo mun: Mèo có lông màu đen.", "en": "Mèo mun: a cat with black fur." } ] }
    ]
  },
  {
    "id": "poem-ke-kho",
    "title": "Kẻ Khó",
    "titleEn": "The Poor",
    "source": "",
    "page": 33,
    "pdfPage": 49,
    "lines": [
      { "vi": "Kẻ khó xót xa,", "en": "The poor suffer bitterly,",
        "align": { "kẻ": "The poor", "khó": "The poor", "xót": "suffer bitterly", "xa": "suffer bitterly" } },
      { "vi": "Đâu có cửa nhà!", "en": "They have no home at all!",
        "align": { "đâu": "no", "có": "have", "cửa": "home", "nhà": "home" } },
      { "vi": "Ra đường lam lũ.", "en": "Out on the street, worn and ragged.",
        "align": { "ra": "Out on", "đường": "the street", "lam": "worn and ragged", "lũ": "worn and ragged" } },
      { "vi": "Áo quần không đủ.", "en": "Not enough clothes to wear.",
        "align": { "áo": "clothes", "quần": "clothes", "không": "Not", "đủ": "enough" } },
      { "vi": "Lạnh ho khù khụ.", "en": "Cold, coughing hard.", "say": "Lạnh, ho khù khụ.",
        "align": { "lạnh": "Cold", "ho": "coughing", "khù": "hard", "khụ": "hard" } },
      { "vi": "Ai nhủ lòng thương?", "en": "Who will open their heart to them?",
        "align": { "ai": "Who", "nhủ": "will open", "lòng": "their heart", "thương": "to them" } }
    ]
  },
  {
    "id": "v3-poem-quy-men-me-cha",
    "book": 3,
    "title": "Quý Mến Mẹ Cha",
    "titleEn": "Cherishing Mom and Dad",
    "source": "Tập đọc",
    "page": 20,
    "pdfPage": 36,
    "prose": true,
    "lines": [
      {
        "vi": "Từ sáng sớm, cha mẹ Mai đã phải thức dậy đi làm.",
        "en": "From early morning, Mai's parents have to get up and go to work.",
        "align": {
          "từ": "From",
          "sáng": "early morning",
          "sớm": "early morning",
          "cha": "parents",
          "mẹ": "parents",
          "mai": "Mai's",
          "đã": "have to",
          "phải": "have to",
          "thức": "get up",
          "dậy": "get up",
          "đi": "go to work",
          "làm": "go to work"
        }
      },
      {
        "vi": "Chiều về đến nhà, mẹ sắp đặt việc làm có thứ tự.",
        "en": "In the afternoon, back home, Mom arranges the chores in good order.",
        "align": {
          "chiều": "In the afternoon",
          "về": "back home",
          "đến": "back home",
          "nhà": "back home",
          "mẹ": "Mom",
          "sắp": "arranges",
          "đặt": "arranges",
          "việc": "the chores",
          "làm": "the chores",
          "có": "in good order",
          "thứ": "in good order",
          "tự": "in good order"
        }
      },
      {
        "vi": "Nào nấu ăn, giặt áo quần. Nào nhắc nhở các em làm bài.",
        "en": "She cooks and washes the clothes. She reminds the children to do their homework.",
        "align": {
          "nấu": "cooks",
          "ăn": "cooks",
          "giặt": "washes",
          "áo": "the clothes",
          "quần": "the clothes",
          "nhắc": "reminds",
          "nhở": "reminds",
          "các": "the children",
          "em": "the children",
          "làm": "do their homework",
          "bài": "do their homework"
        }
      },
      {
        "vi": "Cha hãy còn ở sở. Vất vả vì con cái mà cha mẹ vẫn vui.",
        "en": "Dad is still at work. They work hard for their children, yet they are still happy.",
        "align": {
          "cha": "Dad",
          "hãy": "still",
          "còn": "still",
          "ở": "at work",
          "sở": "at work",
          "vất": "work hard",
          "vả": "work hard",
          "vì": "for",
          "con": "their children",
          "cái": "their children",
          "mà": "yet",
          "vẫn": "still",
          "vui": "happy"
        },
        "notes": [
          {
            "vi": "Vất vả: Khó nhọc vì phải bỏ nhiều sức lực và tâm trí.",
            "en": "Vất vả: hard, tiring work that takes a lot of strength and care."
          },
          {
            "vi": "Con cái: Các con.",
            "en": "Con cái: one's children."
          }
        ]
      },
      {
        "vi": "Em rất quý mến mẹ cha.",
        "en": "I truly cherish my mother and father.",
        "align": {
          "em": "I",
          "rất": "truly",
          "quý": "cherish",
          "mến": "cherish",
          "mẹ": "my mother",
          "cha": "father"
        }
      }
    ]
  }
];
