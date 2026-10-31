// Ghép Chữ (letter pairs): the "Em ráp vần" page after each "Em học ghép
// chữ" unit (Bài 1–5: pages 6, 12, 18, 24, 30). Strict JSON (quoted keys).
// Per unit: "build" = the pair taught (ch + a = cha; Bài Bốn: ch + vần),
// "pool" = every word the page builds (the quiz picks 6 choices from it),
// optional "rule" (the page's Chú ý note). Per card (one vowel choice):
// "vowel" and the "word" it makes, the page's sample "sentence" with English
// "en" and English under each word ("wordsEn"), "target" = index of the word
// in the sentence (blanked in the quiz; "targetLen" words when it is a phrase, "targetEn" its English), optional "spell" (đánh vần), "words"
// (Bài Bốn's "Em học từ"), "note" (footnote) and "say" (spoken text).
// Audio clips (tools/make_voices.py): one per sentence, then one per card
// word, then one per "build".
window.VN_LETTERS = [
  {
    "id": "ghep-bai-1",
    "title": "Bài Một",
    "page": 6,
    "pdfPage": 22,
    "unitPage": 5,
    "build": [
      {
        "parts": [
          "ch",
          "a"
        ],
        "result": "cha",
        "sound": "cha"
      }
    ],
    "pool": [
      "cha",
      "chá",
      "chà",
      "chả",
      "chã",
      "chạ"
    ],
    "cards": [
      {
        "vowel": "a",
        "word": "cha",
        "sentence": "Em yêu mến mẹ cha.",
        "en": "I love my mom and dad.",
        "target": 4,
        "wordsEn": [
          "I",
          "love",
          "(love)",
          "mom",
          "dad"
        ],
        "spell": "chờ-a-cha"
      },
      {
        "vowel": "à",
        "word": "chà",
        "sentence": "Ba mua hộp chà là.",
        "en": "Dad buys a box of dates.",
        "target": 3,
        "wordsEn": [
          "Dad",
          "buys",
          "a box of",
          "dates",
          "(dates)"
        ],
        "spell": "chờ-a-cha-huyền-chà"
      },
      {
        "vowel": "ả",
        "word": "chả",
        "sentence": "Chi mua nem mua chả.",
        "en": "Chi buys pork rolls and pork pâté.",
        "target": 4,
        "wordsEn": [
          "Chi",
          "buys",
          "pork rolls",
          "buys",
          "pork pâté"
        ],
        "spell": "chờ-a-cha-hỏi-chả"
      },
      {
        "vowel": "ã",
        "word": "chã",
        "sentence": "Nước mưa rơi lã chã.",
        "en": "The rain drips down without stopping.",
        "target": 4,
        "wordsEn": [
          "water",
          "rain",
          "falls",
          "(dripping)",
          "dripping"
        ],
        "spell": "chờ-a-cha-ngã-chã",
        "note": {
          "vi": "Lã chã: Từng giọt và nhiều, tuôn ra liền liền không dứt.",
          "en": "Lã chã: falling in many drops, on and on without stopping."
        }
      },
      {
        "vowel": "ạ",
        "word": "chạ",
        "sentence": "Không nên để chung chạ.",
        "en": "Don't keep things all mixed up together.",
        "target": 4,
        "wordsEn": [
          "not",
          "should",
          "put",
          "together",
          "(mixed up)"
        ],
        "spell": "chờ-a-cha-nặng-chạ",
        "note": {
          "vi": "Chung chạ: Để chung lại với nhau, lộn xộn không phân biệt.",
          "en": "Chung chạ: put together in a messy jumble, not kept apart."
        }
      }
    ]
  },
  {
    "id": "ghep-bai-2",
    "title": "Bài Hai",
    "page": 12,
    "pdfPage": 28,
    "unitPage": 11,
    "build": [
      {
        "parts": [
          "gh",
          "e"
        ],
        "result": "ghe",
        "sound": "ghe"
      }
    ],
    "pool": [
      "ghe",
      "ghé",
      "ghè",
      "ghẻ",
      "ghẽ",
      "ghẹ"
    ],
    "rule": {
      "vi": "Phụ âm ghép gh chỉ ráp được với các nguyên âm e, ê, i. Phụ âm đơn g ráp được với các nguyên âm a, i, o, ô, ơ, u, ư.",
      "en": "gh only goes with the vowels e, ê, i. A single g goes with a, i, o, ô, ơ, u, ư."
    },
    "cards": [
      {
        "vowel": "e",
        "word": "ghe",
        "sentence": "Ba em đi trên ghe.",
        "en": "My dad rides on a boat.",
        "target": 4,
        "wordsEn": [
          "Dad",
          "my",
          "goes",
          "on",
          "boat"
        ],
        "spell": "gờ-hát-e-ghe"
      },
      {
        "vowel": "é",
        "word": "ghé",
        "sentence": "Ghe đã ghé vô bờ.",
        "en": "The boat has pulled in to the shore.",
        "target": 2,
        "wordsEn": [
          "boat",
          "has",
          "pulled in",
          "to",
          "shore"
        ],
        "spell": "gờ-hát-e-ghe-sắc-ghé"
      },
      {
        "vowel": "ẻ",
        "word": "ghẻ",
        "sentence": "Ở dơ dễ bị ghẻ.",
        "en": "Staying dirty, you easily get scabies.",
        "target": 4,
        "wordsEn": [
          "staying",
          "dirty",
          "easily",
          "get",
          "scabies"
        ],
        "spell": "gờ-hát-e-ghe-hỏi-ghẻ"
      },
      {
        "vowel": "ẽ",
        "word": "ghẽ",
        "sentence": "Hãy xếp đặt gọn ghẽ.",
        "en": "Put things away neatly.",
        "target": 4,
        "wordsEn": [
          "please",
          "arrange",
          "(arrange)",
          "neat",
          "(neatly)"
        ],
        "spell": "gờ-hát-e-ghe-ngã-ghẽ"
      },
      {
        "vowel": "ẹ",
        "word": "ghẹ",
        "sentence": "Mẹ đi chợ mua ghẹ.",
        "en": "Mom goes to the market to buy crabs.",
        "target": 4,
        "wordsEn": [
          "Mom",
          "goes to",
          "the market",
          "buy",
          "crabs"
        ],
        "spell": "gờ-hát-e-ghe-nặng-ghẹ",
        "note": {
          "vi": "Con ghẹ: Một loại cua biển.",
          "en": "Con ghẹ: a kind of sea crab."
        }
      }
    ]
  },
  {
    "id": "ghep-bai-3",
    "title": "Bài Ba",
    "page": 18,
    "pdfPage": 34,
    "unitPage": 17,
    "build": [
      {
        "parts": [
          "gi",
          "a"
        ],
        "result": "gia",
        "sound": "gia"
      }
    ],
    "pool": [
      "gia",
      "giá",
      "già",
      "giả",
      "giã",
      "giạ"
    ],
    "cards": [
      {
        "vowel": "a",
        "word": "gia",
        "sentence": "Chú em là sử gia.",
        "en": "My uncle is a historian.",
        "target": 4,
        "wordsEn": [
          "uncle",
          "my",
          "is",
          "history",
          "(-ian)"
        ],
        "spell": "giờ-a-gia",
        "note": {
          "vi": "Sử gia: Người viết sử.",
          "en": "Sử gia: a person who writes history."
        }
      },
      {
        "vowel": "á",
        "word": "giá",
        "sentence": "Giá nhà lên cao quá.",
        "en": "House prices have gone up so high.",
        "target": 0,
        "wordsEn": [
          "price",
          "house",
          "go up",
          "high",
          "so"
        ],
        "spell": "giờ-a-gia-sắc-giá"
      },
      {
        "vowel": "à",
        "word": "già",
        "sentence": "Ông bà em đã già.",
        "en": "My grandparents are old now.",
        "target": 4,
        "wordsEn": [
          "grandpa",
          "grandma",
          "my",
          "already",
          "old"
        ],
        "spell": "giờ-a-gia-huyền-già"
      },
      {
        "vowel": "ả",
        "word": "giả",
        "sentence": "Chớ mua lầm đồ giả.",
        "en": "Don't buy fake things by mistake.",
        "target": 4,
        "wordsEn": [
          "don't",
          "buy",
          "by mistake",
          "things",
          "fake"
        ],
        "spell": "giờ-a-gia-hỏi-giả"
      },
      {
        "vowel": "ã",
        "word": "giã",
        "sentence": "Lấy chày để giã gạo.",
        "en": "Use a pestle to pound rice.",
        "target": 3,
        "wordsEn": [
          "take",
          "pestle",
          "to",
          "pound",
          "rice"
        ],
        "spell": "giờ-a-gia-ngã-giã",
        "note": {
          "vi": "Chày: Vật dụng để giã gạo.",
          "en": "Chày: a tool for pounding rice."
        }
      },
      {
        "vowel": "ạ",
        "word": "giạ",
        "sentence": "Cái giạ để đong lúa.",
        "en": "A giạ basket is for measuring rice.",
        "target": 1,
        "wordsEn": [
          "(the)",
          "giạ basket",
          "for",
          "measuring",
          "rice grain"
        ],
        "spell": "giờ-a-gia-nặng-giạ",
        "note": {
          "vi": "Cái giạ: Vật dụng để đong lúa.",
          "en": "Cái giạ: a basket for measuring rice grain."
        }
      }
    ]
  },
  {
    "id": "ghep-bai-4",
    "title": "Bài Bốn",
    "page": 24,
    "pdfPage": 40,
    "unitPage": 23,
    "build": [
      {
        "result": "ch",
        "sound": "chờ"
      }
    ],
    "pool": [
      "cha mẹ",
      "chả giò",
      "che dù",
      "che chở",
      "chị em",
      "chỉ chỏ",
      "cho quà",
      "đi chợ",
      "chú Tư",
      "chủ xe"
    ],
    "cards": [
      {
        "vowel": "a",
        "word": "cha mẹ",
        "sentence": "… cha mẹ em đi …",
        "en": "… my mom and dad go …",
        "target": 1,
        "wordsEn": [
          "",
          "dad",
          "mom",
          "my",
          "go",
          ""
        ],
        "words": [
          "cha mẹ",
          "chả giò"
        ],
        "say": "Cha mẹ em đi.",
        "targetLen": 2,
        "targetEn": "mom and dad"
      },
      {
        "vowel": "e",
        "word": "che dù",
        "sentence": "… mẹ che dù cho …",
        "en": "… Mom holds an umbrella over …",
        "target": 2,
        "wordsEn": [
          "",
          "Mom",
          "holds",
          "umbrella",
          "over",
          ""
        ],
        "words": [
          "che dù",
          "che chở"
        ],
        "say": "Mẹ che dù cho.",
        "targetLen": 2,
        "targetEn": "holds an umbrella"
      },
      {
        "vowel": "i",
        "word": "chị em",
        "sentence": "… chị em có …",
        "en": "… my older sister has …",
        "target": 1,
        "wordsEn": [
          "",
          "older sister",
          "my",
          "has",
          ""
        ],
        "words": [
          "chị em",
          "chỉ chỏ"
        ],
        "say": "Chị em có.",
        "targetLen": 2,
        "targetEn": "my older sister"
      },
      {
        "vowel": "o",
        "word": "đi chợ",
        "sentence": "… em đi chợ với …",
        "en": "… I go to the market with …",
        "target": 2,
        "wordsEn": [
          "",
          "I",
          "go to",
          "the market",
          "with",
          ""
        ],
        "words": [
          "cho quà",
          "đi chợ"
        ],
        "say": "Em đi chợ với.",
        "targetLen": 2,
        "targetEn": "go to the market"
      },
      {
        "vowel": "u",
        "word": "chú Tư",
        "sentence": "… chú Tư cho em …",
        "en": "… Uncle Tư gives me …",
        "target": 1,
        "wordsEn": [
          "",
          "Uncle",
          "Tư",
          "gives",
          "me",
          ""
        ],
        "words": [
          "chú Tư",
          "chủ xe"
        ],
        "say": "Chú Tư cho em.",
        "targetLen": 2,
        "targetEn": "Uncle Tư"
      }
    ]
  },
  {
    "id": "ghep-bai-5",
    "title": "Bài Năm",
    "page": 30,
    "pdfPage": 46,
    "unitPage": 29,
    "build": [
      {
        "parts": [
          "kh",
          "o"
        ],
        "result": "kho",
        "sound": "kho"
      }
    ],
    "pool": [
      "kho",
      "khó",
      "khò",
      "khỏ",
      "khõ",
      "khọ"
    ],
    "cards": [
      {
        "vowel": "o",
        "word": "kho",
        "sentence": "Đức hạnh là kho tàng.",
        "en": "Being good is a treasure.",
        "target": 3,
        "wordsEn": [
          "virtue",
          "(virtue)",
          "is",
          "treasure",
          "(treasure)"
        ],
        "spell": "khờ-o-kho"
      },
      {
        "vowel": "ó",
        "word": "khó",
        "sentence": "Hãy an ủi kẻ khó.",
        "en": "Comfort poor people.",
        "target": 4,
        "wordsEn": [
          "please",
          "comfort",
          "(comfort)",
          "people",
          "poor"
        ],
        "spell": "khờ-o-kho-sắc-khó"
      },
      {
        "vowel": "ò",
        "word": "khò",
        "sentence": "Ăn no dễ ngủ khò.",
        "en": "After a big meal it's easy to sleep soundly.",
        "target": 4,
        "wordsEn": [
          "eat",
          "full",
          "easy",
          "sleep",
          "soundly"
        ],
        "spell": "khờ-o-kho-huyền-khò"
      },
      {
        "vowel": "ỏ",
        "word": "khỏ",
        "sentence": "Đánh nhẹ gọi là khỏ.",
        "en": "A light tap on the head is called khỏ.",
        "target": 4,
        "wordsEn": [
          "hit",
          "lightly",
          "called",
          "(called)",
          "khỏ"
        ],
        "spell": "khờ-o-kho-hỏi-khỏ"
      }
    ]
  }
];
