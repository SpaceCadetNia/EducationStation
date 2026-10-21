// Nghĩa Là Gì? (meaning game): Vietnamese terms from a workbook page; the
// child picks the English meaning. Strict JSON (quoted keys) so the Python
// tools can read it. Per term: "vi", "en" (the right answer), optional "note"
// (shown after answering), optional "parts" ([vi, en] pairs: how to break
// the term down after answering; default = glossary words and phrases). Wrong choices are the other terms' "en" from the
// same set, unless a term lists its own "distractors" (English strings).
// "book": 3 = Tiếng Việt 3 (none = Tiếng Việt 2).
// Audio clips: tools/make_voices.py speaks every term (s01 = term 1).
window.VN_MEANINGS = [
  {
    "id": "mean-p155-words",
    "title": "Từ ngữ",
    "titleEn": "Words and phrases",
    "page": 155,
    "pdfPage": 171,
    "instructions": "Em chọn nghĩa tiếng Anh đúng.",
    "instructionsEn": "Pick the English meaning.",
    "terms": [
      {
        "vi": "Cha mẹ",
        "en": "Mom and Dad"
      },
      {
        "vi": "Chi và Tú",
        "en": "Chi and Tú"
      },
      {
        "vi": "Gió to",
        "en": "a strong wind"
      },
      {
        "vi": "Ông bà em",
        "en": "my grandparents"
      },
      {
        "vi": "Chó để",
        "en": "a dog is kept for",
        "note": "để = for, in order to"
      },
      {
        "vi": "Bé ăn",
        "en": "the little one eats"
      },
      {
        "vi": "Mẹ bỏ gà",
        "en": "Mom puts the chicken"
      },
      {
        "vi": "Xe cũ",
        "en": "an old car",
        "note": "cũ = old (for things); già = old (for people)"
      },
      {
        "vi": "làm đổ nhà",
        "en": "knocks the house down"
      },
      {
        "vi": "giữ nhà",
        "en": "guards the house"
      },
      {
        "vi": "vào lò",
        "en": "into the oven"
      },
      {
        "vi": "bán rẻ rề",
        "en": "sells very cheap",
        "note": "rẻ = cheap; rẻ rề = dirt cheap"
      },
      {
        "vi": "học bài",
        "en": "study their lessons"
      },
      {
        "vi": "đi ghe đò",
        "en": "go by ferry boat",
        "note": "ghe đò = a small ferry boat"
      },
      {
        "vi": "giỗ tổ",
        "en": "honor the ancestors' memorial day",
        "note": "giỗ = a death anniversary; tổ = ancestors"
      },
      {
        "vi": "chả quế",
        "en": "cinnamon pork sausage",
        "note": "quế = cinnamon"
      }
    ]
  },
  {
    "id": "mean-p155-sentences",
    "title": "Cả câu",
    "titleEn": "Whole sentences",
    "page": 155,
    "pdfPage": 171,
    "instructions": "Em nối các từ ở hai bên để thành một câu có nghĩa. Câu này nghĩa là gì?",
    "instructionsEn": "The workbook joins the two halves into sentences. What does each sentence mean?",
    "terms": [
      {
        "vi": "Cha mẹ đi ghe đò.",
        "en": "Mom and Dad go by ferry boat.",
        "parts": [
          [
            "Cha mẹ",
            "Mom and Dad"
          ],
          [
            "đi ghe đò",
            "go by ferry boat"
          ]
        ]
      },
      {
        "vi": "Chi và Tú học bài.",
        "en": "Chi and Tú study their lessons.",
        "parts": [
          [
            "Chi và Tú",
            "Chi and Tú"
          ],
          [
            "học bài",
            "study their lessons"
          ]
        ]
      },
      {
        "vi": "Gió to làm đổ nhà.",
        "en": "The strong wind knocks the house down.",
        "parts": [
          [
            "Gió to",
            "a strong wind"
          ],
          [
            "làm đổ nhà",
            "knocks the house down"
          ]
        ]
      },
      {
        "vi": "Ông bà em giỗ tổ.",
        "en": "My grandparents honor the ancestors' memorial day.",
        "parts": [
          [
            "Ông bà em",
            "my grandparents"
          ],
          [
            "giỗ tổ",
            "honor the ancestors' memorial day"
          ]
        ]
      },
      {
        "vi": "Chó để giữ nhà.",
        "en": "Dogs are kept to guard the house.",
        "parts": [
          [
            "Chó để",
            "a dog is kept for"
          ],
          [
            "giữ nhà",
            "guards the house"
          ]
        ]
      },
      {
        "vi": "Bé ăn chả quế.",
        "en": "The little one eats cinnamon pork sausage.",
        "parts": [
          [
            "Bé ăn",
            "the little one eats"
          ],
          [
            "chả quế",
            "cinnamon pork sausage"
          ]
        ]
      },
      {
        "vi": "Mẹ bỏ gà vào lò.",
        "en": "Mom puts the chicken into the oven.",
        "parts": [
          [
            "Mẹ bỏ gà",
            "Mom puts the chicken"
          ],
          [
            "vào lò",
            "into the oven"
          ]
        ]
      },
      {
        "vi": "Xe cũ bán rẻ rề.",
        "en": "The old car sells very cheap.",
        "parts": [
          [
            "Xe cũ",
            "an old car"
          ],
          [
            "bán rẻ rề",
            "sells very cheap"
          ]
        ]
      }
    ]
  }
];
