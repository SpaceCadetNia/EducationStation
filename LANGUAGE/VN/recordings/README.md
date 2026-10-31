# Hand recordings

Words or sentences the voice model gets wrong, recorded by hand. Name each
file exactly after what it says (Voice Memos or QuickTime, saved as .m4a):

- a word: `ghẻ.m4a` → used for that word in every lesson
- a sentence: `Ở dơ dễ bị ghẻ.m4a` → used wherever that sentence is spoken
  (capital letters and the final full stop don't matter)

Then run `./vt` (or `./vt --recordings` to only copy these in, no model).
A recording always wins over a generated clip, and `./vt` never replaces it.

Wanted now (from the voice check):

| File name | Say |
| --- | --- |
| ghe.m4a | ghe |
| ghê.m4a | ghê |
| ghế.m4a | ghế |
| ghẻ.m4a | ghẻ |
| ghẽ.m4a | ghẽ |
| nghèo.m4a | nghèo |
| Ở dơ dễ bị ghẻ.m4a | Ở dơ dễ bị ghẻ. |
| Hãy xếp đặt gọn ghẽ.m4a | Hãy xếp đặt gọn ghẽ. |
