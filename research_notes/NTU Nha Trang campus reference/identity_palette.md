# NTU (Trường Đại học Nha Trang) — Visual Identity & Colour Palette

> Method note: every hex below is either (a) pixel-sampled by me from a file downloaded from an
> `ntu.edu.vn` host, with the pixel count given, or (b) quoted verbatim from a CSS file served by
> `ntu.edu.vn`. Anything eyeballed is marked **ESTIMATE**. A local copy of the official logo PNG was
> saved next to this file as `ts_logo.png`.

---

## Q1 — The logo/emblem: what is actually in it

### Takeaway
**CONFIRMED.** The NTU emblem is a **circular badge**: a thin indigo-violet ring enclosing a white
field, inside which sits a **symmetrical five-bar "stepped skyline" block in sky blue**, a **small red
five-pointed star floating above the tallest centre bar**, the letters **"NTU"** in indigo outline
laid across the bars, and beneath them the wordmark **"ĐẠI HỌC NHA TRANG"** with the year **"1959"**
on its own line below. There is **no fish, no ship, no anchor, no book and no literal wave** in the
current mark — the fisheries heritage is carried by the *name history* and the slogan, not by the
emblem's shapes.

### Cited Findings
- I downloaded the official logo raster from the admissions microsite and rendered it:
  `https://tuyensinh.ntu.edu.vn/uploads/2/images/contact/3/logo-large-260521150708.png`
  (200×200 PNG, RGBA) — referenced on [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/) as
  `/uploads/2/images/contact/3/logo-large-260521150708_thumb.png`.
- Element inventory, read directly off that rendered file:
  1. **Outer ring** — a single thin circle, indigo/blue-violet, not quite a perfect circle (very
     slightly ovoid at this raster size).
  2. **Five vertical rectangular bars**, sky blue, solid, flat-topped, no outline, arranged
     symmetrically: short – medium – tall(centre) – medium – short. They read simultaneously as a
     campus skyline, as a stepped podium/monument, and (loosely) as a stylised wave crest or set of
     sails. The centre bar is noticeably narrower and taller than the rest.
  3. **Red five-pointed star**, small, sitting free in the white space directly above the centre bar
     (not touching it).
  4. **"NTU"** — large, set in an indigo outline/stroke weight, overlapping the lower half of the
     blue bars so the bars show through the counters of the letters.
  5. **"ĐẠI HỌC NHA TRANG"** — indigo, small caps-height sans, centred, sitting on/below the bar
     block's baseline.
  6. **"1959"** — indigo, smaller, centred on its own line under the wordmark.
- The same emblem appears top-right on NTU's official admissions print cover *"Cẩm nang ngành nghề
  2024/2025"*, which is embedded as a base64 PNG (500×627) in the homepage HTML of
  [ntu.edu.vn](https://ntu.edu.vn/).
- **1959 is confirmed as the founding/tradition year.** NTU traces to Khoa Thủy sản, founded
  01/8/1959 at Học viện Nông Lâm Hà Nội; renamed Trường Thủy sản (1966), moved Hải Phòng → Nha Trang
  and renamed Trường Đại học Hải sản (1976), Trường Đại học Thủy sản (1981), and Trường Đại học Nha
  Trang (2006) — [Wikipedia tiếng Việt](https://vi.wikipedia.org/wiki/Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Nha_Trang).
- **Physical echo of the emblem on campus:** the campus entrance monument is a group of stacked
  white/cream rectangular blocks spelling **N T U**, stepped in height, topped by a **red
  five-pointed star** — i.e. the logo built in concrete, set on a lawn above the bay. Photographed in
  NTU's own article image
  `https://ntu.edu.vn/uploads/56/images/news/12293/img/nhung-tran-tro-khi-thiet-ke-logo-truong-dai-hoc-nha-trang_thumb400.jpg`
  (article title: *"Những trăn trở khi thiết kế logo Trường Đại học Nha Trang"*, listed on
  [ntu.edu.vn](https://ntu.edu.vn/)).
- NTU ran a **separate logo design contest for the 65th anniversary (01/8/1959 – 01/8/2024)**; the
  rules state the university *may or may not* adopt the winning mark as the official logo for the
  65-year event, so the anniversary logo is a commemorative lockup, **not** a replacement of the
  emblem above — [TB tổ chức cuộc thi sáng tác logo (PDF, ntu.edu.vn)](https://www.ntu.edu.vn/Uploads/56/TB%20to%20chuc%20cuoc%20thi%20sang%20tac%20logo.pdf),
  [award ceremony, en.ntu.edu.vn](https://en.ntu.edu.vn/blog/award-ceremony-of-the-logo-design-contest-to-celebrate-the-65th-anniversary-of-nha-trang-university-s-tradition-day).

### Inferences
- The five stepped bars + star are a direct 2D abstraction of the campus NTU monument (or vice
  versa). For a 3D game theme this is the single strongest identity asset: the monument *is* the
  logo, placeable as a landmark prop.
- The bar silhouette is deliberately ambiguous (buildings / sails / wave). A game theme can lean on
  any of the three readings without going off-brand.
- The 1959 lockup means any in-game signage should carry the year under the wordmark, not beside it.

### Gaps
- NTU publishes a news article on the *thinking behind* the logo
  (`.../12293/Nhung-tran-tro-khi-thiet-ke-logo-Truong-Dai-hoc-Nha-Trang`) but the article URL I
  constructed returned **HTTP 404** — I could not read the designer's own account of the symbolism.
  The article is reachable from the ntu.edu.vn homepage news list; a future pass should click
  through from there rather than guess the slug.
- I found **no official vector (SVG/EPS/AI)** of the logo anywhere on `ntu.edu.vn`. Highest-fidelity
  raster found is 200×200 PNG. No Wikimedia Commons file was located.

---

## Q2 — Exact brand colours (sampled)

### Takeaway
**CONFIRMED (from the logo file).** The emblem is a **two-blue + red-accent** mark:
**sky blue `#48B4E7`** (the bars) and **indigo / blue-violet `#4A489D`** (ring, "NTU", wordmark,
"1959"), with **red `#EC2028`** on the star and white as the field. The *institutional publication*
palette widens this to a **royal-blue + navy + orange** system.

### Cited Findings — PRIMARY (pixel-sampled from the official logo)
Source file: `https://tuyensinh.ntu.edu.vn/uploads/2/images/contact/3/logo-large-260521150708.png`
(200×200 RGBA PNG). Counts are opaque pixels (alpha > 230) of exactly that RGB value:

| Role | Hex | Pixels | Element |
|---|---|---|---|
| Field / knockout | `#FFFFFF` | 19 010 | disc interior |
| **Primary — sky blue** | **`#48B4E7`** | 4 890 | the five bars |
| **Secondary — indigo** | **`#4A489D`** | 3 349 | outer ring, "NTU", "ĐẠI HỌC NHA TRANG", "1959" |
| **Accent — red** | **`#EC2028`** | 84 | the five-pointed star |

Antialiasing ramps present in the same file (useful as tints, not as brand colours):
`#76C7ED`, `#A4DAF3`, `#D1ECF9` (blue tints); `#7776B6`, `#A5A4CE`, `#D2D1E7` (indigo tints);
`#4999D5`, `#497EC2`, `#4A63B0` (the blue→indigo blend band).

### Cited Findings — SECONDARY (pixel-sampled from official NTU print material)
Source file: the **"Cẩm nang ngành nghề 2024/2025"** cover, embedded as a base64 PNG (500×627) in the
HTML of [ntu.edu.vn](https://ntu.edu.vn/). Sampled by coordinate + frequency:

| Role | Hex | Where |
|---|---|---|
| Royal blue (dominant, 3 962 px bucket) | `#0048A8` / `#0048A7` | large right-hand triangle, "NGÀNH NGHỀ" headline |
| Deep navy | `#003070` / `#003172` | dark blue band |
| Brand orange (3 390 px bucket) | `#F8A818` / sampled `#FFAD21` | top-left triangle block |
| Deeper orange (1 938 px bucket) | `#F89800` / sampled `#FA9E00` | bottom "CẬP NHẬT MỚI NHẤT" bar |
| Orange shadow edge | `#E87008` | triangle edges |
| Cyan accent | `#00A8D8` | sea / small accents |
| Paper | `#F8F8F8` → `#FFFFFF` | ground |

### Cited Findings — SITE CSS (NTU's own overrides only)
- `https://ntu.edu.vn/Portals/6/portal.css` — the partners strip is
  `.our-partners{background-color: rgb(253 167 45);}` → **`#FDA72D`** (amber/orange). Section ground
  `#f2f2f2`; hairline rules `#ededed`.
- `https://ntu.edu.vn/Portals/_default/skins/xcillion/css/custom.css` — NTU's own skin override:
  `.help-decor-back{background:#1e88c3; border-left:5px solid darkorange;}` → **`#1E88C3`** blue slab
  with a **`darkorange` (#FF8C00)** 5px rule. This is NTU-authored, not vendor default.
- `https://ntu.edu.vn/` inline markup contains one deep navy `#081B3A`.
- [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/) markup contains `#005BB1` (link/CTA blue) and
  `#FF0000`.
- Mission/vision banner `https://ntu.edu.vn/Uploads/6/Sliders/1725/su-menh-tam-nhin-triet-ly-giao-duc-ntu-251222143420.png`
  (2000×562) is white-grounded with **`#FF3131`** red headline and red→orange gradient chips, blue
  body text.

### ⚠ Colours you must NOT treat as NTU brand
- `https://ntu.edu.vn/Portals/6-System/dnn-css-variables.css` declares
  `--dnn-color-primary:#00A5E0`, `--dnn-color-secondary:#ED3D46`, `--dnn-color-tertiary:#0E2936`,
  `--dnn-color-foreground:#472A2B`. These are **DotNetNuke platform defaults** shipped with the CMS
  (the site runs DNN), not an NTU decision. They are also unmodified from DNN stock.
- `.../skins/xcillion/css/style.css` top hexes are `#484848` (231), **`#FF5A5F`** (128), `#EBEBEB`,
  `#FF1053`, `#006C70`, `#BCC52A`. `#FF5A5F` is the stock **Xcillion/Airbnb-red** template accent.
  **Vendor theme defaults — do not use.**

### Inferences (proposed game-theme tokens)
```
--ntu-blue        #48B4E7   /* logo bars — hero/primary, sea-sky */
--ntu-indigo      #4A489D   /* logo ring + letterforms — ink/structure */
--ntu-red         #EC2028   /* the star — single small accent only */
--ntu-royal       #0048A8   /* publication blue — large fields, UI chrome */
--ntu-navy        #003172   /* depth, night, shadow blue */
--ntu-orange      #F8A818   /* publication orange — CTA / highlight */
--ntu-orange-deep #F89800
--ntu-cyan        #00A8D8   /* shallow-water accent */
--ntu-paper       #F8F8F8
```
- Ratio in the emblem is roughly 60 % white : 25 % sky blue : 17 % indigo : <0.5 % red. The red star
  is a *spot* accent; using it as a large field would be off-brand.

### Gaps
- No Pantone/CMYK references found anywhere (none published).
- No vector source, so the hexes carry raster antialias error at the edges; the four dominant values
  above are solid interior pixels and are reliable.

---

## Q3 — Is there a published brand/identity guideline (bộ nhận diện thương hiệu)?

### Takeaway
**No — NOT FOUND, and I believe it does not exist publicly.** Two targeted Vietnamese searches
(`"Đại học Nha Trang bộ nhận diện thương hiệu logo quy định"`, `logo Trường Đại học Nha Trang ý nghĩa`)
surfaced brand manuals from *other* Vietnamese universities but none from NTU. Treat the palette
above as reverse-engineered, not as quoted guideline values.

### Cited Findings
- The only NTU-authored logo *governance* document found is the 65th-anniversary logo **contest
  announcement**, which sets entry rules (original work, no IP disputes, winner supplies source
  files, university may decline to use the winner) — not a usage standard —
  [TB tổ chức cuộc thi sáng tác logo (PDF)](https://www.ntu.edu.vn/Uploads/56/TB%20to%20chuc%20cuoc%20thi%20sang%20tac%20logo.pdf).
- Comparable Vietnamese university manuals that *did* surface, useful only as format reference:
  [ĐH Cần Thơ — Sổ tay thương hiệu (PDF)](https://www.ctu.edu.vn/images/branding/SotayThuonghieu_DaihocCanThosigned.pdf),
  [ĐH Bà Rịa–Vũng Tàu — Logo Guideline (PDF)](https://bvu.edu.vn/wp-content/uploads/2026/01/240402-BVU-Logo-Guideline.pdf),
  [ĐH Quy Nhơn — Nhận diện thương hiệu (PDF)](https://kgdctqlnn.qnu.edu.vn/Resources/Docs/NHAN%20DIEN%20THUONG%20HIEU%20QNU1.pdf).

### Inferences
- With no clearspace rule published, a safe default for the circular badge is **clearspace = 0.25 ×
  badge diameter** on all sides — **ESTIMATE**, my own convention, not NTU's.
- Minimum legible size for the full badge (with "ĐẠI HỌC NHA TRANG" + "1959") is around **56 px**;
  below that the wordmark closes up. **ESTIMATE**, based on inspecting the 200 px raster.

### Gaps
- No clearspace, minimum-size, incorrect-use, co-branding, or Pantone rules exist in public. The
  university's communications office (Phòng Hợp tác Đối ngoại / Văn phòng Trường) would be the
  holder if an internal one exists.

---

## Q4 — Typefaces

### Takeaway
**CONFIRMED for the website: Tahoma is the house face.** NTU's theme CSS declares `font-family:"Tahoma"`
250 times, `"Tahoma SemiBold"` 20 times, `'Tahoma', sans-serif` 18 times, with **Open Sans** (59) as
the secondary and a single stray **Lato**. **No Google Fonts link is loaded at all** — the site relies
on locally installed fonts.

### Cited Findings
- Counts above are from `https://ntu.edu.vn/Portals/_default/skins/xcillion/css/style.css` (423 KB),
  `.../custom.css` and `.../bootstrap-custom.css`, which `skin.css` `@import`s
  (`https://ntu.edu.vn/Portals/_default/skins/xcillion/skin.css`).
- Grep for `fonts.googleapis.com` across `ntu.edu.vn` and `tuyensinh.ntu.edu.vn` homepage HTML:
  **zero hits**. No `@font-face src:url(...)` for a text face either — only icon fonts
  (`FontAwesome`, `bootstrap-icons`, `flaticon`).
- DNN admin chrome uses the platform stack
  `SegoeuiPc, 'Segoe UI', 'San Francisco', 'Helvetica Neue', Helvetica, …` — CMS default, not brand.
- **Print material** (Cẩm nang ngành nghề 2024/2025 cover, embedded PNG on ntu.edu.vn): headline is a
  **heavy geometric/grotesque sans, all caps, tight tracking**, with full Vietnamese diacritic
  support (ề, Ầ). **ESTIMATE** — I could not identify the family from a 500 px raster; it is *not*
  Tahoma and reads closest to a Montserrat/Open Sans ExtraBold family.
- The mission/vision banner sets its body copy in a **bold humanist sans** with Vietnamese diacritics
  and the headline in a heavy italic-ish grotesque — **ESTIMATE**, same limitation.

### Inferences
- For a game theme: **Tahoma / Verdana-class grotesque for UI chrome** (matches the web property),
  and a **heavy geometric sans in caps for display/banner type** (matches print). Both must have full
  Vietnamese diacritics — the project's UI copy is Vietnamese.

### Gaps
- No typeface is *mandated* anywhere; Tahoma is an observed default, likely inherited from the CMS
  skin rather than chosen. Treat as "what they actually use", not "what they specify".

---

## Q5 — Motto, slogan, tagline, English name, abbreviation

### Takeaway
**CONFIRMED.** Educational philosophy / motto: **"Khai phóng – Dụng hành – Phụng sự."**
Slogan (2019 internal contest winner): **"Căng buồm tri thức vươn khơi – Sail to wisdom."**
English name **Nha Trang University**, abbreviation **NTU**.

### Cited Findings
- Motto **"Khai phóng – Dụng hành – Phụng sự"** is given as the school's khẩu hiệu on
  [Wikipedia tiếng Việt](https://vi.wikipedia.org/wiki/Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Nha_Trang)
  **and independently confirmed** on NTU's own homepage banner (image below), where it is labelled
  *"Triết lý giáo dục"*. Rough English: *Liberate – Apply – Serve*.
- From the official banner `https://ntu.edu.vn/Uploads/6/Sliders/1725/su-menh-tam-nhin-triet-ly-giao-duc-ntu-251222143420.png`, read directly:
  - **Sứ mệnh:** "Nghiên cứu khoa học, đào tạo nhân lực trình độ cao và chuyển giao tri thức đa lĩnh
    vực, chú trọng phát huy thế mạnh lĩnh vực Khoa học – Công nghệ biển và thủy sản."
  - **Tầm nhìn đến 2045:** "Đến năm 2045 là đại học có thứ hạng cao của Việt Nam; thuộc nhóm đầu các
    đại học ở Châu Á về một số ngành khoa học – công nghệ biển và thủy sản."
  - **Triết lý giáo dục:** "Khai phóng – Dụng hành – Phụng sự"
- Slogan **"Căng buồm tri thức vươn khơi – Sail to wisdom"** won first prize in NTU's message-writing
  contest, per the university's own Q1/2019 newsletter —
  [Bản tin NTU Quý 1.2019 (PDF, phonghtdn.ntu.edu.vn)](https://phonghtdn.ntu.edu.vn/uploads/45/files/old/newsletter/B%E1%BA%A2n%20tin%20NTU%20-%20Q%C3%BAy%201.2019.pdf).
  The same source notes the imagery of a ship/sail recalls the university's founding history and its
  link to the fisheries sector.
- Naming conventions as used by the institution itself: Vietnamese **"Trường Đại học Nha Trang"**;
  English **"Nha Trang University"**, styled **"Nha Trang University – NTU"** and
  **"NHA TRANG UNIVERSITY"** in caps in the masthead of [en.ntu.edu.vn](https://en.ntu.edu.vn/).
  English self-description from that site: *"Nha Trang University (NTU) evolved from the Department
  of Fisheries which was established in 1959…"*
- Hostname convention: `ntu.edu.vn` (VN), `en.ntu.edu.vn` (EN), `tuyensinh.ntu.edu.vn` (admissions).

### Inferences
- **"Sail to wisdom"** is the single most game-usable line: it licenses sails, boats, horizon and
  open-sea motifs in a theme even though the emblem itself has none.
- The brand voice is a *maritime/fisheries* institution that has deliberately modernised its mark
  away from literal fish-and-anchor iconography.

### Gaps
- I could not confirm the slogan is still *currently* official; the only source is a 2019 newsletter
  reporting a contest result, and it does not appear in the 2025/26 homepage banner.
- No official English translation of "Khai phóng – Dụng hành – Phụng sự" was found on NTU sites.

---

## Q6 — Dominant self-representation imagery

### Takeaway
**CONFIRMED, with a very consistent formula:** NTU pictures itself as a **green hilltop campus
overlooking Nha Trang Bay** — turquoise-to-deep-blue water, offshore islands/headlands as a
silhouetted background ridge, a pale sky with cumulus, tropical greenery in the foreground, and the
white **NTU-monument** as the hero object. Admissions material swaps the ground-level view for an
**aerial city-and-bay shot** cut into **orange and blue diagonal/triangular blocks**.

### Cited Findings
- **Hero formula, ground level** — `https://ntu.edu.vn/uploads/56/images/news/12293/img/nhung-tran-tro-khi-thiet-ke-logo-truong-dai-hoc-nha-trang_thumb400.jpg`:
  a manicured circular lawn and red-brick paving, clipped hedges and flowering shrubs, a large
  spreading shade tree framing the left, white railings along a terrace edge, then the bay —
  turquoise shallows → mid-blue → a long low island/headland ridge in haze — under a pale sky with
  soft cumulus. Centre: the white/cream stacked-block **NTU monument with a red star** on top.
  Composition is **low-horizon, roughly one-third land / one-third sea / one-third sky**.
- **Admissions cover formula** — *Cẩm nang ngành nghề 2024/2025* (embedded on
  [ntu.edu.vn](https://ntu.edu.vn/)): aerial photo of Nha Trang — dense white/pastel mid-rise city,
  one tall red-and-white tower, green hill, curving coast road, teal water, brown mountain ridge
  under cloud. Photo is **masked into a diagonal geometry**: a solid **orange** triangle top-left, a
  solid **royal blue** triangle right, a **cyan** diagonal bottom-left, white field below carrying
  the headline, and an **orange bar** for the date strip. The **circular NTU badge sits top-right on
  white**. Headline is caps, dark navy + royal blue, left-aligned.
- **Other recurring subjects** in the homepage news thumbnails on [ntu.edu.vn](https://ntu.edu.vn/):
  the Fisheries Museum (*Bảo tàng Thủy sản*) as a study destination for international students;
  international cooperation/MoU signings; start-up and innovation activity; the *Đội Lasan* rowing/
  boat tradition ("đội Lasan – nơi những ước mơ vươn ra biển lớn"); 50-years-in-Khánh-Hòa and
  65-years-tradition retrospectives.
- **Recurring banners** served from `/Uploads/6/Sliders/`: `upm-ntu-…`, the
  `su-menh-tam-nhin-triet-ly-giao-duc-ntu-…` mission banner (white ground, red/orange chips, blue
  text, faint grey low-poly line mesh in the background), and `50-nam-…`.
- The **site-wide hero background** is set in NTU's own `portal.css`:
  `#main-content{background: #fff url(/uploads/50/images/Banner-Slider/dhnt-getway_optimized.jpg); background-size:cover}`
  — filename `dhnt-getway` = the campus gateway. ([portal.css](https://ntu.edu.vn/Portals/6/portal.css))

### Inferences (for a 3D scene brief)
- The canonical NTU "postcard" is: **hill → lawn/paving → white monument → railing → bay → island
  ridge → sky.** Build the scene to that layering and it will read as NTU to anyone who's been there.
- Palette of the *photography* (turquoise, deep blue, haze-grey ridge, warm paving brick, mid-green
  foliage, white concrete) sits naturally with the logo blues; the publication orange is the
  complementary spark used for UI/CTA, almost never in the photography itself.
- Monument + red star is the one silhouette that is unmistakably NTU; make it the scene's landmark.

### Gaps
- I did not fetch full-resolution hero slider images beyond the mission banner, so I have no pixel
  samples of the photography's water/sky values. The water/sky hexes a designer would want should be
  sampled from `/uploads/50/images/Banner-Slider/dhnt-getway_optimized.jpg` in a follow-up pass.

---

## Q7 — Student uniform, graduation gown/sash, team kit, campus signage

### Takeaway
**NOT FOUND / UNCERTAIN.** I could not source any official statement of NTU's uniform, gown, sash or
kit colours. Do not invent these.

### Cited Findings
- NTU's 2026 graduation ceremony for khóa 64 (1 772 graduands) is reported, but the coverage
  describes no robe colours —
  [nongnghiepmoitruong.vn](https://nongnghiepmoitruong.vn/truong-dai-hoc-nha-trang-trao-bang-tot-nghiep-cho-1772-tan-cu-nhan-ky-su-d821166.html);
  [en.ntu.edu.vn, 2023 graduation](https://en.ntu.edu.vn/blog/nha-trang-university-holds-the-graduation-ceremony-of-the-university-degree-in-2023).
- Nationally, **Thông tư 26/2009/TT-BGDĐT** governs đồng phục and lễ phục but **does not prescribe
  colour, material or cut** — it sets only principles (consistency within a school/discipline, and a
  visible distinction between trung cấp and đại học graduands). Each university chooses its own —
  [lsvn.vn](https://lsvn.vn/hieu-truong-mac-ao-nhung-cam-quyen-truong-o-le-tot-nghiep-trang-phuc-la-nhung-khong-vi-pham-phap-luat1659524900.html);
  background on the 2022 Vietnamese controversy over non-standard academic dress —
  [tuoitre.vn](https://tuoitre.vn/hieu-truong-mac-ao-nhung-cam-quyen-truong-o-le-trao-bang-tot-nghiep-dai-hoc-gay-tranh-cai-202207311948343.htm).

### Inferences
- Because the regulation leaves it to the institution and NTU publishes nothing, **any gown/sash
  colour in the game theme must be treated as invented**, or else sourced from NTU's Facebook
  graduation photo albums (not fetched here).

### Gaps
- Uniform, gown, sash, sports kit and signage colours: **all unsourced.** The practical route is
  NTU's official Facebook photo albums from a graduation or sports event, read as photographs.

---

## Q8 — Faculty/school colours and the campus-map colour coding

### Takeaway
**UNVERIFIED.** I found **no evidence of per-faculty colours**, and I was **unable to independently
confirm the campus-map colour coding** described in the brief (yellow = dormitories, purple = lecture
halls, red-brown = administrative, cyan, magenta = meeting halls, green = sports). It is recorded
here as an unverified input, not as a finding.

### Cited Findings
- No faculty-colour scheme appears in any NTU page or CSS I inspected
  ([ntu.edu.vn](https://ntu.edu.vn/), [en.ntu.edu.vn](https://en.ntu.edu.vn/),
  [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/), and the four theme CSS files).
- NTU's own skin CSS contains exactly one NTU-authored colour pairing used to distinguish a content
  block — `#1E88C3` with a `darkorange` rule
  ([custom.css](https://ntu.edu.vn/Portals/_default/skins/xcillion/css/custom.css)) — which is a
  layout device, not a faculty code.

### Inferences
- The map coding, if real, is a **wayfinding convention on a specific campus map artefact**, not part
  of the brand system. For a game it is still a good building-type legend, and it does not conflict
  with the logo palette: dormitory-yellow and lecture-purple sit comfortably beside `#48B4E7`/`#4A489D`.
- If adopted, mark it in the theme file as *map-derived*, with the source map image committed
  alongside, so a later reader can check it.

### Gaps
- The campus map image/PDF itself was not located on `ntu.edu.vn`. Until it is, treat every one of
  those six colour assignments as **unsourced**, and sample hexes from the map file rather than
  guessing them.

---

## Q9 — Social media colour treatment

### Takeaway
**NOT ESTABLISHED.** I did not fetch NTU's Facebook page or YouTube channel in this pass, so I cannot
state whether their cover art and post templates use a consistent treatment.

### Cited Findings
- The university's own digital properties that I *did* inspect are internally consistent in one
  respect: the **circular NTU badge on a white field** is the avatar/mark used on
  [ntu.edu.vn](https://ntu.edu.vn/), [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/) (served as
  `logo-large-260521150708.png`) and [en.ntu.edu.vn](https://en.ntu.edu.vn/) (served as a horizontal
  lockup, `Portals/0/nha-trang-university-logo.jpg`, 394×68 — badge + wordmark on one line).
- The two official banner templates I sampled are **not** consistent with each other: the admissions
  cover is **orange + royal blue on white**, while the mission/vision banner is **red + orange on
  white**. There is no single enforced post template.

### Inferences
- The absence of a brand manual (Q3) shows here: NTU's templates share *white ground + diagonal
  geometry + a warm accent over blue type*, but the exact accent drifts between orange `#F8A818` and
  red `#FF3131`. A game theme should pick one and be more disciplined than the source.
- There are **two logo lockups** in active use — the circular badge (square contexts) and a
  horizontal badge+wordmark bar (394×68, website headers). A theme should ship both.

### Gaps
- Facebook, YouTube and any Zalo/TikTok presence were not examined. Cover-photo and post-template
  colour treatment remains an open question.

---

## Summary: CONFIRMED vs UNCERTAIN

**CONFIRMED (sampled or quoted from an ntu.edu.vn source)**
- Emblem contents: circle, five stepped sky-blue bars, red star above centre bar, outlined "NTU",
  "ĐẠI HỌC NHA TRANG", "1959". No fish/ship/anchor/book/wave.
- Logo hexes `#48B4E7`, `#4A489D`, `#EC2028`, `#FFFFFF` (pixel counts given).
- Publication hexes `#0048A8`, `#003172`, `#F8A818`, `#F89800`, `#00A8D8`.
- NTU-authored site CSS colours `#FDA72D`, `#1E88C3` + `darkorange`, `#005BB1`, `#081B3A`.
- Web typography: Tahoma / Tahoma SemiBold primary, Open Sans secondary, no webfonts loaded.
- Motto "Khai phóng – Dụng hành – Phụng sự"; mission and 2045 vision text verbatim.
- Slogan "Căng buồm tri thức vươn khơi – Sail to wisdom" (2019).
- Names: Trường Đại học Nha Trang / Nha Trang University / NTU; founded 1 Aug 1959 as Khoa Thủy sản.
- The campus NTU-monument-with-red-star and the hilltop-over-the-bay hero formula.

**UNCERTAIN / NOT FOUND**
- Any official brand guideline, clearspace rule, minimum size, Pantone/CMYK, or vector logo.
- Print typeface identity (raster-only inspection).
- Whether "Sail to wisdom" is still the current official slogan.
- The designer's stated symbolism (article URL 404'd).
- Uniform, graduation gown/sash, sports kit, campus signage colours — entirely unsourced.
- Faculty/school colours — no evidence any exist.
- The campus-map building-type colour coding — could not locate the map; unverified.
- Social media colour treatment — not examined.

**EXPLICITLY NOT BRAND (do not use)**
- `#00A5E0`, `#ED3D46`, `#0E2936`, `#472A2B` — DotNetNuke CMS defaults.
- `#FF5A5F`, `#FF1053`, `#006C70`, `#BCC52A`, `#484848` — Xcillion vendor template defaults.
