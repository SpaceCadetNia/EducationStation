// Workbook exercises (Văn Lang Cấp 2 workbook), one set per page.
// Written as strict JSON (quoted keys) so the Python tools can read it.
// Each item: a sentence with "___" for the blank and the options from the
// workbook. For each option: "vi" as printed, "en" = meaning of the phrase,
// "result" = English for the whole sentence with that option, "hl" = the part
// of "result" that comes from the option (highlighted), "correct" = makes sense.
// "book": 3 = Tiếng Việt 3 (none = Tiếng Việt 2). "verdict": "fit" or "best"
// changes the right/wrong labels (default: makes sense / doesn't make sense).
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
  },
  {
    "id": "hw4-p154",
    "title": "Bài làm ở nhà #4",
    "page": 154,
    "pdfPage": 170,
    "verdict": "fit",
    "instructions": "Em khoanh tròn từ trong ngoặc đơn rồi điền vào chỗ trống mỗi câu cho hợp nghĩa.",
    "instructionsEn": "Each group of words fills two sentences: pick the word that fits each one.",
    "items": [
      {
        "sentence": "Ghe đò ___.",
        "options": [
          {
            "vi": "đi chợ",
            "en": "go to the market",
            "result": "The ferry boat goes to the market?",
            "hl": "goes to the market",
            "correct": false
          },
          {
            "vi": "chở ghế",
            "en": "carry chairs",
            "result": "The ferry boat carries chairs.",
            "hl": "carries chairs",
            "correct": true
          },
          {
            "vi": "ghẻ lở",
            "en": "scabies sores",
            "result": "The ferry boat has scabies?",
            "hl": "has scabies",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Chi và mẹ ___.",
        "options": [
          {
            "vi": "đi chợ",
            "en": "go to the market",
            "result": "Chi and Mom go to the market.",
            "hl": "go to the market",
            "correct": true
          },
          {
            "vi": "chở ghế",
            "en": "carry chairs",
            "result": "Chi and Mom carry chairs?",
            "hl": "carry chairs",
            "correct": false
          },
          {
            "vi": "ghẻ lở",
            "en": "scabies sores",
            "result": "Chi and Mom have scabies?",
            "hl": "have scabies",
            "correct": false
          }
        ]
      },
      {
        "sentence": "___ Chi đã già.",
        "options": [
          {
            "vi": "cha mẹ",
            "en": "parents",
            "result": "Chi's parents are already old.",
            "hl": "Chi's parents",
            "correct": true
          },
          {
            "vi": "giá rẻ",
            "en": "cheap price",
            "result": "Cheap price, Chi is already old?",
            "hl": "Cheap price",
            "correct": false
          },
          {
            "vi": "ghê sợ",
            "en": "terrified, frightening",
            "result": "Frightening, Chi is already old?",
            "hl": "Frightening",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Tú ___ hổ dữ.",
        "options": [
          {
            "vi": "cha mẹ",
            "en": "parents",
            "result": "Tú parents fierce tiger?",
            "hl": "parents",
            "correct": false
          },
          {
            "vi": "giá rẻ",
            "en": "cheap price",
            "result": "Tú cheap fierce tiger?",
            "hl": "cheap",
            "correct": false
          },
          {
            "vi": "ghê sợ",
            "en": "terrified, frightening",
            "result": "Tú is terrified of the fierce tiger.",
            "hl": "is terrified of",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Bố và mẹ ăn ___.",
        "options": [
          {
            "vi": "ghe đò",
            "en": "ferry boat",
            "result": "Mom and Dad eat a ferry boat!",
            "hl": "a ferry boat",
            "correct": false
          },
          {
            "vi": "chả giò",
            "en": "egg rolls",
            "result": "Mom and Dad eat egg rolls.",
            "hl": "egg rolls",
            "correct": true
          },
          {
            "vi": "cụ già",
            "en": "an old person",
            "result": "Mom and Dad eat an old man!",
            "hl": "an old man",
            "correct": false
          }
        ]
      },
      {
        "sentence": "___ chở em về quê.",
        "options": [
          {
            "vi": "ghe đò",
            "en": "ferry boat",
            "result": "The ferry boat takes me to the countryside.",
            "hl": "The ferry boat",
            "correct": true
          },
          {
            "vi": "chả giò",
            "en": "egg rolls",
            "result": "Egg rolls take me to the countryside?",
            "hl": "Egg rolls",
            "correct": false
          },
          {
            "vi": "cụ già",
            "en": "an old person",
            "result": "The old man takes me to the countryside.",
            "hl": "The old man",
            "correct": false
          }
        ]
      },
      {
        "sentence": "___ gụ, tủ gỗ gõ.",
        "options": [
          {
            "vi": "chả quế",
            "en": "cinnamon pork sausage",
            "result": "Cinnamon pork of gụ wood, a gõ-wood cabinet?",
            "hl": "Cinnamon pork",
            "correct": false
          },
          {
            "vi": "đi ghe",
            "en": "go by boat",
            "result": "Go by boat of gụ wood, a gõ-wood cabinet?",
            "hl": "Go by boat",
            "correct": false
          },
          {
            "vi": "ghế gỗ",
            "en": "wooden chairs",
            "result": "Wooden chairs of gụ wood, a cabinet of gõ wood.",
            "hl": "Wooden chairs",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Chi và Tú ăn ___.",
        "options": [
          {
            "vi": "chả quế",
            "en": "cinnamon pork sausage",
            "result": "Chi and Tú eat cinnamon pork sausage.",
            "hl": "cinnamon pork sausage",
            "correct": true
          },
          {
            "vi": "đi ghe",
            "en": "go by boat",
            "result": "Chi and Tú eat go-by-boat?",
            "hl": "go-by-boat",
            "correct": false
          },
          {
            "vi": "ghế gỗ",
            "en": "wooden chairs",
            "result": "Chi and Tú eat wooden chairs!",
            "hl": "wooden chairs",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Đồ cũ ___ rẻ rề.",
        "options": [
          {
            "vi": "giá",
            "en": "price",
            "result": "Used things are priced dirt cheap.",
            "hl": "priced",
            "correct": true
          },
          {
            "vi": "gió to",
            "en": "strong wind",
            "result": "Used things strong wind dirt cheap?",
            "hl": "strong wind",
            "correct": false
          },
          {
            "vi": "che dù",
            "en": "hold an umbrella",
            "result": "Used things umbrella dirt cheap?",
            "hl": "umbrella",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Mẹ ___ cho bé.",
        "options": [
          {
            "vi": "giá",
            "en": "price",
            "result": "Mom price for the baby?",
            "hl": "price",
            "correct": false
          },
          {
            "vi": "gió to",
            "en": "strong wind",
            "result": "Mom strong wind for the baby?",
            "hl": "strong wind",
            "correct": false
          },
          {
            "vi": "che dù",
            "en": "hold an umbrella",
            "result": "Mom holds an umbrella over the baby.",
            "hl": "holds an umbrella",
            "correct": true
          }
        ]
      }
    ]
  },
  {
    "id": "hw5-p158",
    "title": "Bài làm ở nhà #5",
    "page": 158,
    "pdfPage": 174,
    "verdict": "fit",
    "instructions": "Em khoanh tròn từ trong ngoặc đơn rồi điền vào chỗ trống mỗi câu cho hợp nghĩa.",
    "instructionsEn": "Circle the word in the brackets that fits, and fill in the blank.",
    "items": [
      {
        "sentence": "Cô em ca ___.",
        "options": [
          {
            "vi": "khe khẽ",
            "en": "softly",
            "result": "My aunt sings softly.",
            "hl": "softly",
            "correct": true
          },
          {
            "vi": "ca sĩ",
            "en": "singer",
            "result": "My aunt sings singer?",
            "hl": "singer",
            "correct": false
          },
          {
            "vi": "khò khè",
            "en": "wheezing",
            "result": "My aunt sings wheezing?",
            "hl": "wheezing",
            "correct": false
          }
        ]
      },
      {
        "sentence": "___ ăn khế.",
        "options": [
          {
            "vi": "khù khờ",
            "en": "simple-minded",
            "result": "Simple-minded eats starfruit?",
            "hl": "Simple-minded",
            "correct": false
          },
          {
            "vi": "Khỉ già",
            "en": "old monkey",
            "result": "The old monkey eats starfruit.",
            "hl": "The old monkey",
            "correct": true
          },
          {
            "vi": "khò khò",
            "en": "snoring",
            "result": "Snoring eats starfruit?",
            "hl": "Snoring",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Cụ già ho ___.",
        "options": [
          {
            "vi": "to quá",
            "en": "so loud",
            "result": "The old man coughs so loud?",
            "hl": "so loud",
            "correct": false
          },
          {
            "vi": "khù khụ",
            "en": "hard and deep (coughing)",
            "result": "The old man coughs hard and deep.",
            "hl": "hard and deep",
            "correct": true
          },
          {
            "vi": "bé quá",
            "en": "so small",
            "result": "The old man coughs so small?",
            "hl": "so small",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Em chớ có khi ___.",
        "options": [
          {
            "vi": "kẻ khó",
            "en": "poor people",
            "result": "You must never look down on poor people.",
            "hl": "poor people",
            "correct": true
          },
          {
            "vi": "về quê",
            "en": "going to the countryside",
            "result": "You must never look down on going to the countryside?",
            "hl": "going to the countryside",
            "correct": false
          },
          {
            "vi": "đi chợ",
            "en": "going to the market",
            "result": "You must never look down on going to the market?",
            "hl": "going to the market",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Ăn no dễ ___.",
        "options": [
          {
            "vi": "ho khù khụ",
            "en": "cough hard",
            "result": "After a big meal, it's easy to cough hard?",
            "hl": "cough hard",
            "correct": false
          },
          {
            "vi": "ghê sợ",
            "en": "get scared",
            "result": "After a big meal, it's easy to get scared?",
            "hl": "get scared",
            "correct": false
          },
          {
            "vi": "ngủ khò",
            "en": "fall sound asleep",
            "result": "After a big meal, it's easy to fall sound asleep.",
            "hl": "fall sound asleep",
            "correct": true
          }
        ]
      }
    ]
  },
  {
    "id": "hw5-p159",
    "title": "Bài làm ở nhà #5 · Cột A, Cột B",
    "page": 159,
    "pdfPage": 175,
    "verdict": "fit",
    "instructions": "Em khoanh tròn từ bên cột A hoặc cột B rồi điền vào chỗ trống mỗi câu cho hợp nghĩa.",
    "instructionsEn": "Pick the word from column A or column B that fits the blank.",
    "items": [
      {
        "sentence": "Chi làm bài ___.",
        "options": [
          {
            "vi": "khá",
            "en": "fairly well",
            "result": "Chi does her homework fairly well.",
            "hl": "fairly well",
            "correct": true
          },
          {
            "vi": "khà",
            "en": "ahh (a satisfied sigh)",
            "result": "Chi does her homework ahh?",
            "hl": "ahh",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Chớ ___ kẻ khó.",
        "options": [
          {
            "vi": "khi",
            "en": "to look down on",
            "result": "Don't look down on poor people.",
            "hl": "look down on",
            "correct": true
          },
          {
            "vi": "khỉ",
            "en": "monkey",
            "result": "Don't monkey poor people?",
            "hl": "monkey",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Khỉ già ăn ___.",
        "options": [
          {
            "vi": "khế",
            "en": "starfruit",
            "result": "The old monkey eats starfruit.",
            "hl": "starfruit",
            "correct": true
          },
          {
            "vi": "khề",
            "en": "(a slow drawl)",
            "result": "The old monkey eats a drawl?",
            "hl": "a drawl",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Mẹ bé Tý ___ cá.",
        "options": [
          {
            "vi": "khỏ",
            "en": "(not a word)",
            "result": "Little Tý's mom khỏ the fish?",
            "hl": "khỏ",
            "correct": false
          },
          {
            "vi": "kho",
            "en": "to braise",
            "result": "Little Tý's mom braises fish.",
            "hl": "braises",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Chú Tư ăn cá ___.",
        "options": [
          {
            "vi": "khố",
            "en": "loincloth",
            "result": "Uncle Tư eats loincloth fish?",
            "hl": "loincloth",
            "correct": false
          },
          {
            "vi": "khô",
            "en": "dried",
            "result": "Uncle Tư eats dried fish.",
            "hl": "dried",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Tủ hư có ___ hở.",
        "options": [
          {
            "vi": "khê",
            "en": "burnt (rice)",
            "result": "The broken cabinet has a burnt opening?",
            "hl": "burnt",
            "correct": false
          },
          {
            "vi": "khe",
            "en": "gap, crack",
            "result": "The broken cabinet has a gap.",
            "hl": "a gap",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Ăn no dễ ngủ ___.",
        "options": [
          {
            "vi": "khó",
            "en": "hard, difficult",
            "result": "After a big meal, it's easy to sleep with difficulty?",
            "hl": "with difficulty",
            "correct": false
          },
          {
            "vi": "khò",
            "en": "soundly (snoring)",
            "result": "After a big meal, it's easy to sleep soundly.",
            "hl": "soundly",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Cô Ba ca ___ khẽ.",
        "options": [
          {
            "vi": "khé",
            "en": "sharp, harsh",
            "result": "Aunt Ba sings sharply softly?",
            "hl": "sharply",
            "correct": false
          },
          {
            "vi": "khe",
            "en": "(khe khẽ = softly)",
            "result": "Aunt Ba sings softly.",
            "hl": "softly",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Kẻ khó ___ sở.",
        "options": [
          {
            "vi": "khổ",
            "en": "to suffer (khổ sở = miserable)",
            "result": "Poor people are miserable.",
            "hl": "miserable",
            "correct": true
          },
          {
            "vi": "khố",
            "en": "loincloth",
            "result": "Poor people are loincloth-sở?",
            "hl": "loincloth",
            "correct": false
          }
        ]
      }
    ]
  },
  {
    "id": "v3-hw4-p117a",
    "book": 3,
    "title": "Điền vào chỗ trống",
    "page": 117,
    "pdfPage": 133,
    "verdict": "fit",
    "instructions": "Em tìm từ hợp nghĩa trong bài tập đọc \"Quý Mến Mẹ Cha\" điền vào chỗ trống.",
    "instructionsEn": "Find the word from the reading \"Quý Mến Mẹ Cha\" that fills each blank.",
    "items": [
      {
        "sentence": "Về ___ nhà, mẹ nấu ăn, sắp đặt việc nhà thật có thứ tự.",
        "options": [
          {
            "vi": "đến",
            "en": "to arrive at",
            "result": "Arriving home, Mom cooks and arranges the housework in good order.",
            "hl": "Arriving home",
            "correct": true
          },
          {
            "vi": "có thứ",
            "en": "in order (có thứ tự)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "vất vả",
            "en": "to work very hard",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "mến",
            "en": "to be fond of (quý mến = cherish)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Về đến nhà, mẹ nấu ăn, sắp đặt việc nhà thật ___ tự.",
        "options": [
          {
            "vi": "đến",
            "en": "to arrive at",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "có thứ",
            "en": "in order (có thứ tự)",
            "result": "Arriving home, Mom cooks and arranges the housework in good order.",
            "hl": "in good order",
            "correct": true
          },
          {
            "vi": "vất vả",
            "en": "to work very hard",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "mến",
            "en": "to be fond of (quý mến = cherish)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Cha mẹ thật ___ vì con cái mà vẫn lấy làm vui.",
        "options": [
          {
            "vi": "đến",
            "en": "to arrive at",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "có thứ",
            "en": "in order (có thứ tự)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "vất vả",
            "en": "to work very hard",
            "result": "Mom and Dad work so hard for their children, yet they are still happy.",
            "hl": "work so hard",
            "correct": true
          },
          {
            "vi": "mến",
            "en": "to be fond of (quý mến = cherish)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          }
        ]
      },
      {
        "sentence": "Em rất quý ___ cha mẹ.",
        "options": [
          {
            "vi": "đến",
            "en": "to arrive at",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "có thứ",
            "en": "in order (có thứ tự)",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "vất vả",
            "en": "to work very hard",
            "result": "That word doesn't fit here.",
            "hl": "doesn't fit",
            "correct": false
          },
          {
            "vi": "mến",
            "en": "to be fond of (quý mến = cherish)",
            "result": "I truly cherish my parents.",
            "hl": "cherish",
            "correct": true
          }
        ]
      }
    ]
  },
  {
    "id": "v3-hw4-p117b",
    "book": 3,
    "title": "Chọn câu đúng nhất",
    "page": 117,
    "pdfPage": 133,
    "verdict": "best",
    "instructions": "Em đánh dấu (X) vào ô vuông cho đúng theo bài tập đọc \"Quý Mến Mẹ Cha\".",
    "instructionsEn": "Pick the ending that matches the reading \"Quý Mến Mẹ Cha\".",
    "items": [
      {
        "sentence": "Em còn ngủ, ___.",
        "options": [
          {
            "vi": "mẹ đi nấu ăn",
            "en": "Mom goes to cook",
            "result": "I'm still asleep, Mom goes to cook.",
            "hl": "Mom goes to cook",
            "correct": false
          },
          {
            "vi": "mẹ giặt áo quần",
            "en": "Mom washes the clothes",
            "result": "I'm still asleep, Mom washes the clothes.",
            "hl": "Mom washes the clothes",
            "correct": false
          },
          {
            "vi": "cha mẹ đã đi làm từ lâu",
            "en": "Mom and Dad left for work long ago",
            "result": "I'm still asleep, but Mom and Dad left for work long ago.",
            "hl": "Mom and Dad left for work long ago",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Cha còn làm ở sở, ___.",
        "options": [
          {
            "vi": "mẹ còn làm ở sở",
            "en": "Mom is still at work",
            "result": "Dad is still at work, Mom is still at work too.",
            "hl": "Mom is still at work too",
            "correct": false
          },
          {
            "vi": "mẹ về nhà nghỉ mệt",
            "en": "Mom comes home to rest",
            "result": "Dad is still at work, Mom comes home to rest.",
            "hl": "Mom comes home to rest",
            "correct": false
          },
          {
            "vi": "mẹ nấu ăn, sắp đặt việc nhà",
            "en": "Mom cooks and arranges the housework",
            "result": "Dad is still at work, Mom cooks and arranges the housework.",
            "hl": "Mom cooks and arranges the housework",
            "correct": true
          }
        ]
      },
      {
        "sentence": "Em quý mến cha mẹ vì ___.",
        "options": [
          {
            "vi": "cha mẹ đã già",
            "en": "they are already old",
            "result": "I cherish my parents because they are already old.",
            "hl": "they are already old",
            "correct": false
          },
          {
            "vi": "cha mẹ làm việc có thứ tự",
            "en": "they work in good order",
            "result": "I cherish my parents because they work in good order.",
            "hl": "they work in good order",
            "correct": false
          },
          {
            "vi": "cha mẹ vất vả, lo cho con",
            "en": "they work hard and care for me",
            "result": "I cherish my parents because they work hard and care for me.",
            "hl": "they work hard and care for me",
            "correct": true
          }
        ]
      }
    ]
  }
];
