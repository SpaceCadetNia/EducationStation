// Vietnamese lesson sets. Each lesson: id, title, focus (letters to highlight),
// sentences [vi, en] (optional 3rd item = text the voice tool speaks instead),
// and align: one object per sentence mapping each Vietnamese word (lowercase)
// to the English text it matches, a string or a list of strings copied exactly
// from the English. Words with no English equivalent can be left out.
// "book": 3 marks Tiếng Việt 3 pages (no "book" = Tiếng Việt 2); each menu
// only shows its own book.
// Keep text in NFC (normal typing is fine). Check with: python3 tools/glossary.py
window.VN_LESSONS = [
  {
    id: "bai-1",
    title: "Bài 1",
    focus: "gh",
    sentences: [
      ["Ba đi ghe", "Dad goes by boat."],
      ["Má ghì em bé", "Mom holds/hugs the baby tightly."],
      ["Ghê sợ hổ dữ", "Afraid of the fierce tiger."],
      ["Em ngồi ghế", "I sit on a chair."],
      ["Ghi vô sổ", "Write it in the notebook."],
      ["Ghe ghé vô bờ", "The boat comes to the shore."],
      ["Ghi ơn cha mẹ", "Be grateful to one's parents."],
      ["Ghẹ bò trên cát", "The crab crawls on the sand."],
      ["Ghê sợ ghẻ lở", "Disgusted by / afraid of sores."]
    ],
    align: [
      { "ba": "Dad", "đi": "goes", "ghe": "by boat" },
      { "má": "Mom", "ghì": ["holds/hugs", "tightly"], "em": "the baby", "bé": "the baby" },
      { "ghê": "Afraid of", "sợ": "Afraid of", "hổ": "tiger", "dữ": "fierce" },
      { "em": "I", "ngồi": "sit", "ghế": "a chair" },
      { "ghi": "Write", "vô": "in", "sổ": "the notebook" },
      { "ghe": "The boat", "ghé": "comes", "vô": "to", "bờ": "the shore" },
      { "ghi": "Be grateful", "ơn": "Be grateful", "cha": "parents", "mẹ": "parents" },
      { "ghẹ": "The crab", "bò": "crawls", "trên": "on", "cát": "the sand" },
      { "ghê": ["Disgusted by", "afraid of"], "sợ": "afraid of", "ghẻ": "sores", "lở": "sores" }
    ]
  },
  {
    id: "vl2-p18",
    title: "Ráp vần gia · Trang 18",
    short: "Trang 18",
    page: 18,
    pdfPage: 34,
    focus: "gi",
    sentences: [
      ["Chú em là sử gia", "My uncle is a historian."],
      ["Giá nhà lên cao quá", "House prices have gone up so high."],
      ["Ông bà em đã già", "My grandparents are already old."],
      ["Chớ mua lầm đồ giả", "Don't buy fake things by mistake."],
      ["Lấy chày để giã gạo", "Use a pestle to pound the rice."],
      ["Cái giạ để đong lúa", "The giạ basket is for measuring rice grain."]
    ],
    align: [
      { "chú": "My uncle", "em": "My", "là": "is", "sử": "a historian", "gia": "a historian" },
      { "giá": "prices", "nhà": "House", "lên": "gone up", "cao": "high", "quá": "so" },
      { "ông": "grandparents", "bà": "grandparents", "em": "My", "đã": "already", "già": "old" },
      { "chớ": "Don't", "mua": "buy", "lầm": "by mistake", "đồ": "things", "giả": "fake" },
      { "lấy": "Use", "chày": "a pestle", "để": "to", "giã": "pound", "gạo": "the rice" },
      { "cái": "The giạ basket", "giạ": "The giạ basket", "để": "for", "đong": "measuring", "lúa": "rice grain" }
    ]
  },
  {
    id: "vl2-p19",
    title: "Ráp vần gio · Trang 19",
    short: "Trang 19",
    page: 19,
    pdfPage: 35,
    focus: "gi",
    sentences: [
      ["Em thích ăn bánh gio", "I like to eat bánh gio (lye rice cakes)."],
      ["Hôm nay có gió to", "Today there is a strong wind."],
      ["Bánh mì có kẹp giò", "The bread has pork roll in it."],
      ["Hái hoa để vào giỏ", "Pick flowers and put them in the basket."]
    ],
    align: [
      { "em": "I", "thích": "like", "ăn": "eat", "bánh": "bánh gio", "gio": "bánh gio" },
      { "hôm": "Today", "nay": "Today", "có": "there is", "gió": "wind", "to": "strong" },
      { "bánh": "The bread", "mì": "The bread", "có": "has", "kẹp": "in it", "giò": "pork roll" },
      { "hái": "Pick", "hoa": "flowers", "để": "and", "vào": "in", "giỏ": "the basket" }
    ]
  },
  {
    id: "vl2-p22",
    title: "Bài làm trong lớp · Trang 22",
    short: "Trang 22",
    page: 22,
    pdfPage: 38,
    focus: "gi",
    sentences: [
      ["Bà em đã già", "My grandmother is already old."],
      ["Bé từ giã mẹ", "The little one says goodbye to Mom."],
      ["Bà lễ tổ", "Grandma bows to the ancestors."],
      ["Gió to đổ cây", "The strong wind knocks the trees down."],
      ["Em giả bộ ngủ", "I pretend to sleep."],
      ["Xe cũ giá rẻ", "The old car is cheap."],
      ["Chi ăn giá", "Chi eats bean sprouts."],
      ["Tú ăn chả giò", "Tú eats egg rolls."],
      ["Ba giờ đúng", "Exactly three o'clock."]
    ],
    align: [
      { "bà": "grandmother", "em": "My", "đã": "already", "già": "old" },
      { "bé": "The little one", "từ": "says goodbye", "giã": "says goodbye", "mẹ": "Mom" },
      { "bà": "Grandma", "lễ": "bows to", "tổ": "the ancestors" },
      { "gió": "wind", "to": "strong", "đổ": "knocks", "cây": "the trees" },
      { "em": "I", "giả": "pretend", "bộ": "pretend", "ngủ": "sleep" },
      { "xe": "car", "cũ": "old", "giá": "cheap", "rẻ": "cheap" },
      { "chi": "Chi", "ăn": "eats", "giá": "bean sprouts" },
      { "tú": "Tú", "ăn": "eats", "chả": "egg rolls", "giò": "egg rolls" },
      { "ba": "three o'clock", "giờ": "three o'clock", "đúng": "Exactly" }
    ]
  },
  {
    id: "vl2-p31",
    title: "Ráp vần khi · Trang 31",
    short: "Trang 31",
    page: 31,
    pdfPage: 47,
    focus: "kh",
    sentences: [
      ["Chớ khi kẻ nghèo khó", "Don't look down on poor people."],
      ["Khí cầu bay theo gió", "The balloon flies with the wind."],
      ["Gặp khó vẫn cười khì", "Even in trouble, still chuckle."],
      ["Con khỉ giỏi trèo cây", "The monkey is good at climbing trees."],
      ["Chỉ có tài dụ khị", "Only good at sweet-talking."]
    ],
    align: [
      { "chớ": "Don't", "khi": "look down on", "kẻ": "people", "nghèo": "poor", "khó": "poor" },
      { "khí": "The balloon", "cầu": "The balloon", "bay": "flies", "theo": "with", "gió": "the wind" },
      { "gặp": "in", "khó": "trouble", "vẫn": "still", "cười": "chuckle", "khì": "chuckle" },
      { "con": "The", "khỉ": "monkey", "giỏi": "good at", "trèo": "climbing", "cây": "trees" },
      { "chỉ": "Only", "có": "good at", "tài": "good at", "dụ": "sweet-talking", "khị": "sweet-talking" }
    ]
  },
  {
    id: "hw3-p151",
    title: "Bài làm #3 · Trang 151",
    short: "Trang 151",
    page: 151,
    pdfPage: 167,
    focus: "gi",
    sentences: [
      ["Em ăn chả giò", "I eat egg rolls."],
      ["Chả giò to quá", "The egg rolls are so big."],
      ["Tú có giò chả", "Tú has Vietnamese pork sausage."],
      ["Có chó giữ nhà", "There is a dog guarding the house."],
      ["Gió to đổ cây", "The strong wind knocks the trees down."],
      ["Gió hú ghê sợ", "The wind howls frighteningly."],
      ["Dì Ba đã già", "Aunt Ba is already old."],
      ["Cụ già đi bộ", "The old man walks."],
      ["Bé giả bộ té", "The little one pretends to fall."],
      ["Bỏ cà vô giỏ", "Put the eggplants in the basket."],
      ["Giỏ có cà bể", "The basket has squashed eggplants."],
      ["Đồng hồ chỉ ba giờ", "The clock shows three o'clock."]
    ],
    align: [
      { "em": "I", "ăn": "eat", "chả": "egg rolls", "giò": "egg rolls" },
      { "chả": "The egg rolls", "giò": "The egg rolls", "to": "big", "quá": "so" },
      { "tú": "Tú", "có": "has", "giò": "Vietnamese pork sausage", "chả": "Vietnamese pork sausage" },
      { "có": "There is", "chó": "a dog", "giữ": "guarding", "nhà": "the house" },
      { "gió": "wind", "to": "strong", "đổ": "knocks", "cây": "the trees" },
      { "gió": "The wind", "hú": "howls", "ghê": "frighteningly", "sợ": "frighteningly" },
      { "dì": "Aunt", "ba": "Ba", "đã": "already", "già": "old" },
      { "cụ": "The old man", "già": "The old man", "đi": "walks", "bộ": "walks" },
      { "bé": "The little one", "giả": "pretends", "bộ": "pretends", "té": "fall" },
      { "bỏ": "Put", "cà": "the eggplants", "vô": "in", "giỏ": "the basket" },
      { "giỏ": "The basket", "có": "has", "cà": "eggplants", "bể": "squashed" },
      { "đồng": "The clock", "hồ": "The clock", "chỉ": "shows", "ba": "three o'clock", "giờ": "three o'clock" }
    ]
  },
  {
    id: "hw4-p153",
    title: "Bài làm #4 · Trang 153",
    short: "Trang 153",
    page: 153,
    pdfPage: 169,
    focus: "gi",
    sentences: [
      ["Bà đã già", "Grandma is already old."],
      ["Chú chỉ chỏ", "Uncle points here and there."],
      ["Chi đi ăn giỗ", "Chi goes to a memorial feast."],
      ["Chả giò, chả quế", "Egg rolls and cinnamon pork sausage."],
      ["Cụ già giỗ tổ", "The old man honours the ancestors' memorial day."]
    ],
    align: [
      { "bà": "Grandma", "đã": "already", "già": "old" },
      { "chú": "Uncle", "chỉ": "points here and there", "chỏ": "points here and there" },
      { "chi": "Chi", "đi": "goes to", "ăn": "a memorial feast", "giỗ": "a memorial feast" },
      { "chả": "Egg rolls", "giò": "Egg rolls", "quế": "cinnamon" },
      { "cụ": "The old man", "già": "The old man", "giỗ": "the ancestors' memorial day", "tổ": "the ancestors' memorial day" }
    ]
  },
  {
    id: "hw5-p157",
    title: "Bài làm #5 · Trang 157",
    short: "Trang 157",
    page: 157,
    pdfPage: 173,
    focus: "kh",
    sentences: [
      ["Khò khè", "Wheezing."],
      ["Khù khụ", "Coughing hard and deep."],
      ["Khỉ già ăn khế", "The old monkey eats starfruit."],
      ["Mợ Hai ca khe khẽ", "Aunt Hai sings softly."],
      ["An ủi kẻ khù khờ", "Comfort the simple-minded person."]
    ],
    align: [
      { "khò": "Wheezing", "khè": "Wheezing" },
      { "khù": "Coughing hard and deep", "khụ": "Coughing hard and deep" },
      { "khỉ": "The old monkey", "già": "old", "ăn": "eats", "khế": "starfruit" },
      { "mợ": "Aunt", "hai": "Hai", "ca": "sings", "khe": "softly", "khẽ": "softly" },
      { "an": "Comfort", "ủi": "Comfort", "kẻ": "person", "khù": "simple-minded", "khờ": "simple-minded" }
    ]
  },
  {
    id: "v3-hw4-p119",
    book: 3,
    title: "Bài làm #4 · Trang 119",
    short: "Trang 119",
    page: 119,
    pdfPage: 135,
    focus: "",
    sentences: [
      ["Nệm êm", "A soft mattress."],
      ["Cà tím", "Eggplant."],
      ["Chim kên kên", "A vulture."],
      ["Em hái sim chín", "I pick ripe rose-myrtle berries."],
      ["Chim én bay sát mặt đất", "Swallows fly close to the ground."]
    ],
    align: [
      { "nệm": "mattress", "êm": "soft" },
      { "cà": "Eggplant", "tím": "Eggplant" },
      { "chim": "A vulture", "kên": "A vulture" },
      { "em": "I", "hái": "pick", "sim": "rose-myrtle berries", "chín": "ripe" },
      { "chim": "Swallows", "én": "Swallows", "bay": "fly", "sát": "close to", "mặt": "the ground", "đất": "the ground" }
    ]
  }
];
