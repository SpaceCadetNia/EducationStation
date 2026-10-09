// Workbook exercises (Văn Lang Cấp 2 workbook), one set per page.
// Written as strict JSON (quoted keys) so the Python tools can read it.
// Each item: a sentence with "___" for the blank and the options from the
// workbook. For each option: "vi" as printed, "en" = meaning of the phrase,
// "result" = English for the whole sentence with that option, "hl" = the part
// of "result" that comes from the option (highlighted), "correct" = makes sense.
// Audio clips: tools/make_voices.py speaks every filled-in sentence.
window.VN_WORKBOOK = [
  {
    "id": "vl2-p20",
    "title": "Em tập đặt câu",
    "page": 20,
    "pdfPage": 36,
    "instructions": "Câu a: Dùng từ cho sẵn điền vào chỗ trống. Câu b: Dùng từ cho sẵn để đặt câu bằng miệng.",
    "instructionsEn": "Sentence a: fill the blank with the given words. Sentence b: make up a sentence out loud with the given words (a sample is shown).",
    "items": [
      { "kind": "a", "sentence": "Ba ___ đi chợ.",
        "options": [ { "vi": "bà già", "en": "old women", "result": "Three old women go to the market.", "hl": "old women", "correct": true } ] },
      { "kind": "b", "sentence": "Ông bà em ___.",
        "options": [ { "vi": "đã già", "en": "already old", "result": "My grandparents are already old.", "hl": "already old", "correct": true } ] },
      { "kind": "a", "sentence": "___ mẹ cha.",
        "options": [ { "vi": "Chi từ giã", "en": "Chi says goodbye to", "result": "Chi says goodbye to her parents.", "hl": "Chi says goodbye to", "correct": true } ] },
      { "kind": "b", "sentence": "___ ngủ.",
        "options": [ { "vi": "Em giả bộ", "en": "I pretend", "result": "I pretend to sleep.", "hl": "I pretend", "correct": true } ] },
      { "kind": "a", "sentence": "Bố mẹ ___.",
        "options": [ { "vi": "đi ăn giỗ", "en": "go to a memorial feast", "result": "Mom and Dad go to a memorial feast.", "hl": "go to a memorial feast", "correct": true } ] },
      { "kind": "b", "sentence": "Hôm nay em ___.",
        "options": [ { "vi": "đi ăn giỗ", "en": "go to a memorial feast", "result": "Today I go to a memorial feast.", "hl": "go to a memorial feast", "correct": true } ] },
      { "kind": "a", "sentence": "___ đổ nhà.",
        "options": [ { "vi": "Gió to", "en": "strong wind", "result": "The strong wind knocks the house down.", "hl": "The strong wind", "correct": true } ] },
      { "kind": "b", "sentence": "Bánh mì có kẹp ___.",
        "options": [ { "vi": "giò chả", "en": "Vietnamese pork sausage", "result": "The bread has Vietnamese pork sausage in it.", "hl": "Vietnamese pork sausage", "correct": true } ] },
      { "kind": "a", "sentence": "Đồ cũ ___.",
        "options": [ { "vi": "giá rẻ rề", "en": "dirt cheap", "result": "Used things are dirt cheap.", "hl": "dirt cheap", "correct": true } ] },
      { "kind": "b", "sentence": "___ giá rẻ.",
        "options": [ { "vi": "Xe ô tô cũ", "en": "the old car", "result": "The old car is cheap.", "hl": "The old car", "correct": true } ] }
    ]
  },
  {
    "id": "hw3-p150",
    "title": "Bài làm ở nhà #3",
    "page": 150,
    "pdfPage": 166,
    "instructions": "Em khoanh tròn từ trong ngoặc đơn rồi điền vào chỗ trống mỗi câu cho hợp nghĩa.",
    "instructionsEn": "Pick the word in parentheses that fills the blank so the sentence makes sense.",
    "items": [
      {
        "sentence": "___ cha em đi vô sở.",
        "options": [
          { "vi": "Ba giờ", "en": "three o'clock", "result": "At three o'clock, my father goes to work.", "hl": "At three o'clock", "correct": true },
          { "vi": "đã già", "en": "already old", "result": "Already old, my father goes to work.", "hl": "Already old", "correct": false }
        ]
      },
      {
        "sentence": "Xe ô tô cũ ___ rề.",
        "options": [
          { "vi": "cụ già", "en": "an old person, an elder", "result": "The old car … old grandpa … rề?", "hl": "old grandpa", "correct": false },
          { "vi": "giá rẻ", "en": "cheap price", "result": "The old car is dirt cheap.", "hl": "dirt cheap", "correct": true }
        ]
      },
      {
        "sentence": "Em bé ___ là chú hề.",
        "options": [
          { "vi": "giá cả", "en": "prices", "result": "The little one … prices … is a clown?", "hl": "prices", "correct": false },
          { "vi": "giả bộ", "en": "to pretend", "result": "The little one pretends to be a clown.", "hl": "pretends", "correct": true }
        ]
      },
      {
        "sentence": "Bố em mê ăn ___.",
        "options": [
          { "vi": "chả giò", "en": "fried egg rolls", "result": "My dad loves eating egg rolls.", "hl": "egg rolls", "correct": true },
          { "vi": "gió to", "en": "strong wind", "result": "My dad loves eating strong wind!", "hl": "strong wind", "correct": false }
        ]
      },
      {
        "sentence": "Có chó để ___.",
        "options": [
          { "vi": "giỗ tổ", "en": "the ancestors' memorial day", "result": "We have a dog for the ancestors' memorial day?", "hl": "the ancestors' memorial day", "correct": false },
          { "vi": "giữ nhà", "en": "to guard the house", "result": "We have a dog to guard the house.", "hl": "to guard the house", "correct": true }
        ]
      }
    ]
  }
];
