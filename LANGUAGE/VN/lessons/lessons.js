// Vietnamese lesson sets. Each lesson: id, title, focus (letters to highlight),
// sentences [vi, en] (optional 3rd item = text the voice tool speaks instead),
// and align: one object per sentence mapping each Vietnamese word (lowercase)
// to the English text it matches, a string or a list of strings copied exactly
// from the English. Words with no English equivalent can be left out.
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
  }
];
