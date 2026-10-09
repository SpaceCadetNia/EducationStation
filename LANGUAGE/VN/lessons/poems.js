// Poems for Đọc Thơ (poem reader). Strict JSON (quoted keys) so the Python
// tools can read it. Per line: "vi", "en" (translation of the line) and
// "align" (Vietnamese word -> English text copied exactly from "en").
// "notes" are the workbook footnotes, shown with the line they belong to.
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
  }
];
