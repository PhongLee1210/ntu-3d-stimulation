# Physical site layout and geography — Trường Đại học Nha Trang (Nha Trang University, NTU), 02 Nguyễn Đình Chiểu, Nha Trang, Khánh Hòa

**Identity check (important):** every source below is about the Vietnamese university at 02 Nguyễn Đình Chiểu, Nha Trang. The OSM object carries `addr:housenumber=02`, `addr:street=Nguyễn Đình Chiểu`, `addr:city=Nha Trang`, `website=https://ntu.edu.vn/`, `wikidata=Q2740474`, `alt_name=Đại học Thủy Sản` (its historic Fisheries name), `start_date=1966`. This is NOT Nanyang Technological University, NOT National Taiwan University, NOT the Nha Trang Institute of Oceanography (which is a separate body, ~5 km south at Cầu Đá).

**All OSM-derived geometry below: © OpenStreetMap contributors, ODbL 1.0.** OSM data retrieved 2026-11-02 via Overpass API (overpass-api.de).

**Local metric frame used throughout (my own construction, not from a source):**
- Origin = OSM node 2403563080, tagged `barrier=gate`, `name="Main Gate for Nha Trang Campus"`, at **12.2685519 N, 109.2009298 E**.
- x = metres east, y = metres north. Scale factors: 1° lat = 110,574 m; 1° lon = 108,778 m (= 111,320 · cos 12.2684°). Flat-earth projection; error over the 630 m site is sub-metre.

---

## Q1. Bounding coordinates, total area, main-axis orientation, lat/lon of main gate and main building

### Takeaway
The campus polygon (OSM way 126760189) spans 12.26624–12.27019 N and 109.19886–109.20465 E — a footprint about **630 m (E–W) × 436 m (N–S)**, bounding-box area 27.4 ha, with the university's own admissions documents stating a **main-campus area of 23.4 ha** (press and the English site say "more than 20 ha" / "20 hectares"). The long axis runs **WSW–ENE at roughly azimuth 72–75°**, parallel to Nguyễn Đình Chiểu St.

### Cited Findings
- Campus polygon = OSM **way 126760189**, `amenity=university`, `name=Trường Đại học Nha Trang`, `name:en=Nha Trang University`, `operator=Bộ Giáo dục và Đào tạo`, `opening_hours=Mo-Su 06:00-22:00`, `internet_access=wlan`, `wheelchair=limited`, `start_date=1966`, `alt_name=Đại học Thủy Sản`. Centre **12.2682152 N, 109.2017541 E** — [Overpass API / OpenStreetMap](https://overpass-api.de/api/interpreter) (© OpenStreetMap contributors, ODbL 1.0) — *English/Vietnamese tags*
- Polygon bounding box: **minlat 12.2662440, minlon 109.1988606, maxlat 12.2701865, maxlon 109.2046475** — [Overpass API / OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Main-campus area **23.4 ha**, "on hilly land facing the sea on two sides", ~1.5 km from Nha Trang city centre — NTU admissions project document (đề án tuyển sinh), [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/uploads/2/files/DE%20AN%20CNTT_25_6.pdf) — *Vietnamese*
- Main campus **20 hectares**; on **LaSan hill**, facing the sea; **~3 km north of the city centre** — official NTU English site, [en.ntu.edu.vn Campus overview and infrastructure](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*
- Campus "**rộng hơn 20 ha**", over half of it green space, ~10 m² of greenery per staff member/student — [danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html) — *Vietnamese*
- Total land across **all** NTU sites (incl. Cam Lâm and Ninh Phụng experimental farms, Kiên Giang branch) = **515,835 m² ≈ 51.6 ha**, per NTU's public-disclosure form (biểu mẫu 19, NH 2022-23) — [ntu.edu.vn](https://ntu.edu.vn/uploads/56/files/3_biểu%20mẫu%2019_NH%2022-23.pdf) — *Vietnamese*. **Do not use this for the campus polygon.**
- **Main gate:** OSM node **2403563080**, `barrier=gate`, `name="Main Gate for Nha Trang Campus"`, tags `access=no; bicycle=yes; foot=yes`, at **12.2685519 N, 109.2009298 E** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- **Main / administrative building:** OSM way **231993835**, `name="Tòa nhà A1 (Khu hành chính)"`, `building=university`, centre **12.2674438 N, 109.2020642 E** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Nguyễn Đình Chiểu (OSM way 126480403, `highway=tertiary`) bounds 12.2687631,109.1979369 → 12.2707039,109.2047324 — i.e. it runs **WSW→ENE**, climbing 215 m north over 739 m east ⇒ bearing ≈ **74°** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)

### Inferences
- **Campus bbox in local metres (origin = main gate):** SW corner (−225, −255); SE (+404, −255); NW (−225, +181); NE (+404, +181). Size **629.5 m E–W × 435.9 m N–S**, bbox area **27.44 ha**. The gate therefore sits in the **north-west third** of the site, 181 m from the north edge and 225 m from the west edge — the bulk of the campus (404 m) extends **east** of it.
- Official 23.4 ha inside a 27.44 ha bbox = an 85 % fill ratio, which is consistent with a roughly rectangular-but-clipped polygon (corners cut by the three bounding streets). **23.4 ha is the number to model to**; 27.4 ha is only the bbox.
- Main axis: bearing from gate to Library 1 (+314, +106) = 71°; Nguyễn Đình Chiểu = 74°. So the whole site is **rotated ~72–75° clockwise from north** — a 3D scene should be built on a grid tilted ~17–18° off the cardinal axes if you want building rows to align with the streets, or build axis-aligned and rotate the whole site by −73°.
- The three bounding streets sit as the brief describes: Nguyễn Đình Chiểu along the **north / north-west** edge; Tôn Thất Tùng (`highway=secondary`, bounds 12.2660871–12.2680953, 109.1968021–109.2015267) along the **south-west**; Phạm Văn Đồng (`highway=primary`, one-way pair, bounds 12.2636812–12.2821869, 109.1997705–109.2058959) along the **south-east**, hugging the coast.

### Gaps
- I did not compute the true polygon area from its node list (only the bbox); the 23.4 ha official figure should be preferred over any OSM-derived area.
- Ward name: sources disagree on the current ward (Vĩnh Thọ, Vĩnh Phước, and post-2025-merger "Bắc Nha Trang" all appear). Not material to geometry.
- The brief's label "A-2" for the main building does not appear in OSM, which names the administrative block **A1**. Either the official campus map uses a different numbering, or the two refer to different wings of the same red-roofed complex. **Unresolved conflict — flagging rather than picking.**

---

## Q2. OSM query results — way IDs, local-metre centres, footprint sizes

### Takeaway
OSM has the campus mapped in unusual detail: 54 building ways, ~100 internal roads/footways/steps, a floodlit artificial-turf football pitch with a grandstand, basketball and badminton courts, two surface car parks, five hedge areas and a footbridge. The table below is the primary deliverable for a 3D artist.

### Cited Findings
All rows: [Overpass API / OpenStreetMap](https://overpass-api.de/api/interpreter), **© OpenStreetMap contributors, ODbL 1.0**, retrieved 2026-11-02. Names are the OSM `name` tag (Vietnamese).

**x = m east of main gate, y = m north of main gate. "EW"/"NS" are the axis-aligned bounding-box dimensions of the footprint in metres — these are upper bounds on the true footprint, since a building rotated relative to north has a bbox larger than itself. "bbox m²" = EW × NS.**

| Name (OSM) | way id | x (m E) | y (m N) | EW m | NS m | bbox m² | levels tag |
|---|---|---|---|---|---|---|---|
| Trường Thuỷ sản và Khoa học sự sống | 231980914 | −139.7 | −33.5 | 96.7 | 57.2 | 5527 | — |
| **Football pitch** (soccer, artificial_turf, lit=yes) | 231993996 | +236.1 | −26.7 | 61.2 | 89.1 | 5453 | — |
| Hội trường 3 (Viện KHCN Khai thác Thuỷ sản) = **HT-3** | 232039796 | −183.0 | +51.5 | 65.6 | 54.1 | 3550 | — |
| Tòa nhà **B3** | 231993716 | +255.6 | −135.5 | 54.4 | 56.7 | 3089 | — |
| Trường Kỹ thuật và Công nghệ | 231993706 | +206.1 | +81.3 | 66.9 | 45.1 | 3020 | **3** |
| Ký túc xá **K7** | 232041038 | −187.8 | −90.6 | 58.6 | 51.1 | 2997 | — |
| **Thư viện 1** (Library 1) | 231993710 | +314.2 | +106.2 | 60.3 | 49.1 | 2960 | — |
| **Nhà Thi Đấu Đa Năng** (gymnasium / multi-sport hall) | 231986641 | +157.8 | −44.1 | 46.8 | 63.0 | 2947 | — |
| Ký túc xá **K8** | 232039795 | +135.8 | +124.9 | 56.5 | 46.1 | 2605 | — |
| Ký túc xá **K5** | 231993703 | +53.6 | +55.8 | 59.3 | 35.9 | 2125 | — |
| Giảng đường **G7** | 231993713 | −103.2 | −107.3 | 59.6 | 32.0 | 1906 | — |
| Giảng đường **G6** | 231993707 | −41.3 | −151.1 | 55.8 | 32.4 | 1806 | — |
| Xưởng cơ khí (mechanical workshop) | 231993721 | +258.8 | +59.9 | 47.0 | 38.0 | 1786 | **1** |
| **Tòa nhà A1 (Khu hành chính)** — admin / main building | 231993835 | +123.4 | −122.5 | **90.2** | **18.3** | 1651 | — |
| Trường Kinh tế và Kinh Doanh – Nhà Đa Năng | 231993747 | −105.7 | −151.4 | 45.5 | 33.7 | 1534 | **12** |
| Giảng đường **G2** | 231993705 | +357.8 | −42.0 | 40.8 | 37.5 | 1529 | — |
| Giảng đường **G4** | 231993848 | +41.5 | −191.4 | 60.9 | 24.7 | 1508 | — |
| Tòa nhà **A9** | 231993844 | +314.6 | −45.1 | 32.8 | 42.4 | 1391 | — |
| Giảng đường **G1** | 231993851 | +323.7 | +37.0 | 49.4 | 27.7 | 1370 | — |
| Giảng đường **G3** | 231993727 | +308.1 | −145.3 | 72.2 | 18.1 | 1308 | — |
| **Grandstand** (football stand, `building=grandstand`) | 232039821 | +199.6 | −27.5 | 12.9 | 88.4 | 1138 | — |
| Nhà Truyền thống (heritage/tradition house) | 231993708 | +210.5 | −142.0 | 32.3 | 33.6 | 1085 | **1** |
| Khu thí nghiệm thực hành (practical labs) | 231993733 | +201.0 | −174.9 | 82.7 | 12.9 | 1065 | **3** |
| **Thư viện 2** (Library 2) | 231993842 | +278.9 | +93.7 | 31.8 | 31.4 | 999 | — |
| Khu thí nghiệm (labs) | 231993766 | +152.9 | −201.0 | 68.4 | 13.2 | 902 | — |
| Ký túc xá **K6** | 231993807 | +368.1 | −103.4 | 18.9 | 43.6 | 823 | — |
| **Thư viện 3** (Library 3) | 231993770 | +250.2 | +120.0 | 26.8 | 30.6 | 820 | — |
| Ký túc xá **K4** | 231993735 | +129.8 | +29.1 | 53.0 | 15.1 | 801 | — |
| Ký túc xá **K3** | 231993803 | +130.1 | +55.8 | 54.1 | 14.4 | 778 | — |
| Giảng đường **G8** | 231993725 | +62.1 | −6.1 | 48.8 | 15.7 | 768 | — |
| Giảng đường **G5** | 231993744 | +24.9 | −152.8 | 51.5 | 12.5 | 644 | — |
| **Cantine** (canteen) | 231993852 | +93.7 | +85.1 | 24.6 | 24.6 | 606 | — |
| commercial (NW corner, on Nguyễn Đình Chiểu) | 232004663 | −186.0 | +102.5 | 19.9 | 29.5 | 589 | — |
| Hội trường 2 = **HT-2** | 231993802 | +164.3 | −149.5 | 15.8 | 37.1 | 584 | — |
| Parking (surface) | 232002540 | +41.4 | +63.9 | 29.9 | 18.3 | 547 | — |
| commercial (NW corner) | 232004681 | −182.4 | +99.6 | 18.6 | 28.3 | 528 | — |
| commercial (NW corner) | 232004688 | −178.8 | +97.7 | 18.5 | 27.9 | 515 | — |
| commercial (NW corner) | 232004674 | −176.1 | +94.1 | 18.2 | 28.3 | 514 | — |
| **Basketball court** (concrete, lit=no) | 1545622610 | +114.5 | −10.1 | 31.7 | 15.2 | 483 | — |
| **A3** | 231993729 | +11.7 | +30.6 | 23.1 | 20.4 | 470 | — |
| Hội trường 1 = **HT-1** | 231993758 | +102.5 | −203.9 | 29.5 | 15.7 | 463 | — |
| Ký túc xá **K1** | 231993792 | +175.7 | +114.3 | 23.1 | 19.9 | 459 | — |
| Ký túc xá **K2** | 231993774 | +138.6 | +88.0 | 29.3 | 15.0 | 442 | — |
| Tòa nhà **A8** | 231993787 | +84.5 | −79.0 | 11.4 | 36.7 | 418 | — |
| CLB Sinh Viên (student club) | 231986639 | +119.8 | −54.0 | 13.8 | 29.9 | 412 | — |
| (unnamed) | 777346789 | −225.0 | −95.0 | 11.7 | 34.2 | 402 | **1** |
| **Badminton court** (concrete, lit=yes) | 1545622611 | +156.7 | −6.6 | 30.8 | 12.8 | 394 | — |
| Phòng họp số 4 – Nhà Cựu sinh viên (alumni house) | 231993809 | +73.8 | −50.1 | 28.2 | 13.4 | 378 | — |
| Ký túc xá **K9 (cũ)** — old dorm | 232039807 | −179.8 | −14.6 | 12.1 | 29.0 | 351 | — |
| (unnamed) | 231993762 | +296.5 | −36.4 | 11.8 | 28.9 | 342 | — |
| (unnamed) | 231993832 | +285.3 | −57.8 | 22.5 | 12.8 | 289 | — |
| Parking (surface) | 231993995 | +86.3 | +63.4 | 19.0 | 14.9 | 284 | — |
| **Bảo Tàng Thuỷ Sinh Vật** (aquatic-life museum) | 231986638 | +118.9 | −29.9 | 15.1 | 18.6 | 282 | — |
| (unnamed) | 777346773 | −209.0 | −128.4 | 13.0 | 16.0 | 207 | **1** |
| (unnamed, immediately beside the main gate) | 777346775 | −7.7 | +23.7 | 11.2 | 11.3 | 126 | **1** |
| (unnamed) | 231993800 | +345.1 | +86.8 | 11.5 | 10.1 | 116 | — |
| (unnamed) | 231993853 | +337.0 | +79.3 | 10.1 | 11.5 | 116 | — |
| (unnamed small) | 232002484 | −7.7 | −151.8 | 5.9 | 6.0 | 35 | — |

Additional OSM facts:
- Football pitch way **231993996**: `leisure=pitch`, `sport=soccer`, `surface=artificial_turf`, `lit=yes`. bbox 12.2679076,109.2028191 → 12.2687133,109.2033818 ⇒ **61.2 m × 89.1 m**, long axis running N–S (in the rotated site frame, running across the slope). Grandstand way 232039821 is a **12.9 m × 88.4 m** strip immediately **west** of it (x = +199.6 vs pitch +236.1) — a single long stand along one touchline.
- Other campus features present in OSM: `amenity=canteen`, `amenity=fountain`, `leisure=park` ×3 (ways 1545622609, 1545622622, 1545622623), `leisure=garden` (232004725), `amenity=library` node, `amenity=internet_cafe` node, `amenity=parking` ×2, and **five `barrier=hedge, area=yes`** strips (ways 1545622612–1545622616) in a row at y ≈ −110 spanning x ≈ +90 → +300.
- A **footbridge**: way 231993902, `highway=footway`, `bridge=yes`, `layer=1`, centre 12.2675984,109.2041991 (x ≈ +356, y ≈ −105), beside K6.
- An **underpass / sunken road segment**: way 232002525, `highway=service`, `name=Đường Thanh Niên`, `oneway=yes`, **`layer=-1`**, centre 12.2676069,109.2028176 (x ≈ +206, y ≈ −104).
- **Four `highway=steps`** ways, all `surface=paved`, `width=2`, `handrail=no`, `lit=no`: ways 1545622604 (x≈+309,y≈−92), 1545622608 (x≈+345,y≈−95), 1545622619 (x≈+195,y≈−92), 1545622620 (x≈+124,y≈−95).

### Inferences
- **Zoning reads clearly off the x/y table**, and matches the official-map labels in the brief:
  - **Dormitory belt K1–K5, K8** occupies the **north** strip (y = +29 to +125, x = +54 to +176), with **K7 / K9(cũ)** on the **west** edge (x ≈ −180 to −190). **K6** is the outlier, far **east** (x = +368, y = −103).
  - **Library cluster TV1/TV2/TV3** is the **north-east** corner (x = +250…+314, y = +94…+120) — exactly the brief's "north-east" placement.
  - **Canteen** is **centre-north** (x = +94, y = +85) — matches the brief.
  - **Gymnasium + courts + football pitch + grandstand** form a **central sports band** at y ≈ −45…−27, x = +115…+236 — the brief's "centre".
  - **A1 admin, HT-1, HT-2, B3, Nhà Truyền thống, G3, G4, G5, labs** form the **south** tier at y = −120 to −204 — the brief's "south-centre" main building.
  - **G lecture halls are genuinely scattered**: G7/G6 south-west, G5/G4 south, G8 centre-west, G1 north-east, G2 east, G3 south-east.
- **A1 is a long, thin east–west bar: 90.2 m × 18.3 m.** That shape (a 90 m frontage only ~18 m deep) is the signature of the "large red-roofed complex" the brief describes, read from above as a long ridge-roofed block facing the entrance drive from the south side. Model it as a 90 × 18 m bar, not a blocky mass.
- **The five hedge strips plus the four flights of steps, all at y ≈ −92…−110, line up into a single continuous east–west terrace edge** running across the middle of the campus at x = +90 → +350. This is almost certainly **a retaining terrace between the central sports/entrance level and the lower southern tier** — the most important terrain feature on the site after the hill crown itself. A 3D scene should model a planted retaining bank there with stairs punching through it at four points.
- `Đường Thanh Niên` with `layer=-1` at (x +206, y −104) sits on that same terrace line: the internal road dips **under** something (a building link bridge or a raised deck) exactly where the terrace is.

### Gaps
- OSM has **no `height` tag on any building** on this campus, and `building:levels` on only six of 54 buildings. Storeys are mostly unknown from OSM (see Q5).
- Footprint figures are **axis-aligned bounding boxes**, not true polygon outlines. For buildings rotated ~17° off north (most of them, since they align to the street grid), the true footprint is smaller than EW × NS — typically 70–85 % of the bbox. I did not retrieve full node geometry per building.
- The brief's labels A-2, A-4…A-7, X-1, X-3, TV-4, G-1…G-8-as-mapped, HT-1/HT-3 numbering do not all map onto OSM names. OSM has A1, A3, A8, A9, B3 only — **no A2, A4–A7, X-1, X-3**. Either the official campus map and OSM use different numbering, or OSM is incomplete. Unresolved.

---

## Q3. Elevation change, whether it is genuinely a hillside campus, slope direction, height of main building vs gate

### Takeaway
Yes — genuinely a hill, and specifically a **hill crown, not a one-way slope**. SRTM 30 m data gives a plateau of **28–30 m** through the centre-south of the campus, falling to **8–15 m** at every edge, with the steepest fall (~20 m over ~130 m, ≈15 %) on the **south and south-east side toward the sea**. The main building (A1) sits at **~30 m**, the main gate at **~26 m**, so the gate is only ~4 m below the admin building.

### Cited Findings
All elevations from **SRTM 30 m** via [OpenTopoData](https://api.opentopodata.org/v1/srtm30m) (`srtm30m` dataset), queried 2026-11-02:

| Point | lat, lon | local x,y (m) | Elevation (m) |
|---|---|---|---|
| **Main gate** (node 2403563080) | 12.2685519, 109.2009298 | 0, 0 | **26** |
| **Tòa nhà A1** admin/main building | 12.2674438, 109.2020642 | +123, −123 | **30** |
| Thư viện 2 (library) | 12.2693995, 109.2034942 | +279, +94 | **30** |
| Ký túc xá K1 | 12.2695857, 109.2025453 | +176, +114 | 24 |
| Football pitch centre | 12.2683105, 109.2031004 | +236, −27 | **18** |
| Giảng đường G2 (east) | 12.2681722, 109.2042194 | +358, −42 | 18 |
| Ký túc xá K6 (south-east) | 12.2676170, 109.2043135 | +368, −103 | 21 |
| Trường Thuỷ sản (west) | 12.2682493, 109.1996458 | −140, −33 | 26 |
| Nhà Đa Năng, Econ/Business (SW) | 12.2671830, 109.1999579 | −106, −151 | 16 |
| Campus NE corner | 12.2701865, 109.2046475 | +404, +181 | 15 |
| Campus SW corner | 12.2662440, 109.1988606 | −225, −255 | 9 |
| Campus SE corner (approx) | 12.2666, 109.2046 | +403, −216 | 8 |
| Interior, centre | 12.2682, 109.2018 | +95, −39 | 28 |
| Interior, south-centre | 12.2670, 109.2030 | +225, −171 | **29** |
| Just NW of campus (toward Ng. Đình Chiểu) | 12.2698, 109.1996 | −142, +138 | 18 |
| On Nguyễn Đình Chiểu, north | 12.2702, 109.2035 | +283, +182 | 23 |
| South of campus toward Tôn Thất Tùng | 12.2663, 109.2000 | −102, −249 | 9 |
| Sea, 200 m SE | 12.2655, 109.2050 | +447, −337 | **0** |
| Sea, 350 m SE | 12.2645, 109.2060 | +556, −448 | **0** |

- Campus is on **"khu đồi Lasan"** (La San hill), Vĩnh Thọ ward — [danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html) — *Vietnamese*; also [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) ("LaSan hill") — *English*
- NTU's 2025 annual report describes the hill as lying **north-east of the city** — [phongdbcl.ntu.edu.vn](https://phongdbcl.ntu.edu.vn/uploads/47/CONG%20KHAI%20NAM%202025-2026/285-BC%20765.BC%20ĐHNT%20ngay%2026.6.26%20Bao%20cao%20thuong%20nien%20nam%202025.pdf) — *Vietnamese*
- NTU admissions document: campus is **"on hilly land facing the sea on two sides"** — [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/uploads/2/files/DE%20AN%20CNTT_25_6.pdf) — *Vietnamese*
- The four `highway=steps` ways and five hedge terraces inside the campus (Q2) are themselves direct OSM evidence of internal level changes — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)

### Inferences
- **The terrain model for a 3D scene:** a broad, slightly tilted crown at **28–30 m** running as a band from (x +95, y −39) through A1 (x +123, y −123) to (x +225, y −171) and north-east to the libraries (x +279, y +94). From that crown the ground falls away in **every** direction to 8–18 m at the perimeter. Total relief across the site ≈ **22 m (8 → 30 m)**.
- **Slope directions and gradients (my calculation from the table):**
  - **South / south-east (toward the sea): steepest.** 29 m at (+225, −171) → 8 m at (+403, −216) = 21 m fall over ~184 m ≈ **11 %**. A1 at 30 m → SW corner 9 m over ~200 m ≈ **10 %**.
  - **North (toward Nguyễn Đình Chiểu): moderate.** Crown 30 m → NE corner 15 m over ~200 m ≈ **7 %**.
  - **West: gentle.** 26 m at the Fisheries building → 16 m at the Econ building and 9 m at the SW corner.
  - **Central sports band is a cut/terraced shelf:** the football pitch reads **18 m** while ground 60 m south of it reads 29 m and ground 60 m north reads 24 m. A flat 61 × 89 m pitch cannot sit on an 11 % slope — it must be a **benched platform cut ~6–11 m into the hill**, which is exactly why there is a long grandstand on only one (the uphill, west) side, and why the hedge-and-steps terrace line runs immediately south of it.
- **Gate → main building: gate 26 m, A1 ~30 m.** So walking in from the gate you climb **~4 m over ~175 m** on the way to the admin building — a gentle, barely-perceptible rise. The gate is *not* at the bottom of the hill; Nguyễn Đình Chiểu itself already runs at 18–23 m along a shoulder of the hill. The dramatic drop is behind you (south/south-east), not ahead.
- The "facing the sea on two sides" phrase in NTU's own document is consistent with the elevation grid: the hill drops to the sea on both the **south** and the **east/south-east**, with the campus occupying the headland crown between them.

### Gaps
- **SRTM 30 m is a 2000-vintage radar DSM**, not a DTM: it includes canopy and some building returns, and has ~5–10 m vertical RMSE in vegetated terrain. The campus is >50 % tree cover with "hundreds of trees over 50 years old" ([danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html)), so **individual values may be 5–10 m high** and the 18 m reading for the pitch (an open, bare surface) is probably more trustworthy than the 30 m readings in the tree-shaded zones. **Treat the shape of the surface as confirmed; treat each absolute number as ±8 m.**
- No source gave a surveyed spot height or a contour map for the campus. No official site-plan with levels found.
- No source states the floor level of A1 or the gate in metres above sea level; the numbers above are terrain samples, not building data.

---

## Q4. Distance from campus edge to shoreline; is the sea visible, and from where

### Takeaway
The campus is **right on the headland**: the mapped shoreline passes within **~20 m** of the campus's southern/south-eastern boundary and **~150–230 m** from the eastern buildings. The sea is confirmed visible — NTU's own description and a Vietnamese feature article both say you can see across Nha Trang bay from the campus grounds.

### Cited Findings
- Mainland shoreline = OSM way **1198403325**, `natural=coastline`, bounds 12.2610042,109.1989307 → 12.2731250,109.2070058. Its node coordinates in the campus latitude band run: (12.2655796,109.2021321), (12.2660245,109.2033853), (12.2658290,109.2042015), (12.2663646,109.2047828), (12.2666960,109.2059043), (12.2670446,109.2059578), (12.2674069,109.2062010), (12.2680910,109.2067349), (12.2688500,109.2067534), (12.2695103,109.2067863), (12.2701235,109.2069633) — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- A second coastline way, **265148348 `name=Hòn Đỏ`**, is an islet/rock offshore to the east, bounds 12.2657849,109.2075764 → 12.2673366,109.2093077, westernmost node 12.2666904,109.2075764 — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Phạm Văn Đồng (coastal road, `highway=primary`, one-way pair) way 231885653 bounds 12.2661526,109.2015786 → 12.2821869,109.2058042; way 651186209 bounds 12.2659673,109.2016245 → 12.2821783,109.2058959 — i.e. the two carriageways run **between the campus and the eastern shoreline** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- **"Từ sân trường có thể chiêm ngưỡng được vẻ đẹp của cả vịnh Nha Trang."** ("From the campus grounds you can admire the beauty of the whole Nha Trang bay.") — [danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html) — *Vietnamese*
- NTU's own English site: the campus is on LaSan hill **facing the sea**, with "views of the sea and city" — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*
- NTU admissions document: campus is on hilly land **"facing the sea on two sides"** — [tuyensinh.ntu.edu.vn](https://tuyensinh.ntu.edu.vn/uploads/2/files/DE%20AN%20CNTT_25_6.pdf) — *Vietnamese*
- The Vietnamese article headlines the campus as a school that **"vừa có rừng vừa có biển"** ("has both forest and sea") — [danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html) — *Vietnamese*

### Inferences
**Straight-line distance from campus features to the nearest mapped coastline node** (my calculation; distances are to the nearest *mapped node*, so they are upper bounds — the true shoreline between nodes may be slightly closer):

| From | Distance to shoreline |
|---|---|
| Campus **SE corner** (12.26624, 109.20465) | **~20 m** |
| Campus **S edge** at lon 109.2034 | **~24 m** |
| **HT-1** (southern tip building, x +103, y −204) | ~128 m |
| **K6** (easternmost dorm, x +368, y −103) | ~148 m |
| **A1 admin / main building** (x +123, y −123) | ~206 m |
| **G2** (east edge, x +358, y −42) | ~209 m |
| **Football pitch** (x +236, y −27) | ~255 m |
| **Main gate** (0, 0) | ~354 m |
| **Library 2** (x +279, y +94) | ~358 m |

- So: **the southern boundary of the campus is essentially on the water** (20–25 m, with only Phạm Văn Đồng's southern approach and a thin fringe between), while the **main built-up core sits 130–250 m inland** and the **gate / library / dormitory end is 350–360 m inland**.
- **Hòn Đỏ** islet lies ~**250–300 m east** of the campus's eastern boundary (campus maxlon 109.20465 → islet westernmost 109.20758 = 0.00293° lon ≈ 319 m, at similar latitude). It is the obvious offshore landmark in any east-facing view and should be in the 3D scene's background.
- **Sightline analysis (geometric inference, not an observed fact):** the sea surface is at 0 m. A viewer standing on the southern tier at 29–30 m, 130–200 m from the water, looks down a ~9–13° declination — an unobstructed sea view in principle. The buildings best placed for it are therefore, in order: **HT-1 / HT-2 / the labs (southern tier), A1 (admin), B3, G3, and K6** — all on the south and south-east rim at 21–30 m. The north-side cluster (libraries TV1–3, dorms K1–K5/K8, canteen) is 350 m inland and *behind* the hill crown, so from ground level there the crown blocks the water; those buildings would get a sea view only from upper floors.
- **The 12-storey "Nhà Đa Năng" (Econ/Business, way 231993747, x −106, y −151, terrain 16 m)** would, at ~40 m building height on the south-west rim, be the single best viewpoint on campus — over both the southern bay and westward over the Cái river / Nha Trang city. Treat the 12-storey figure as uncertain (see Q5).

### Gaps
- No source confirms *which specific buildings or named viewpoints* have a sea view. The ranking above is my geometric inference from terrain + distance, not a cited fact.
- I could not establish whether the fringe between the campus's southern boundary and the water at the 20 m point is beach, rock, a seawall, or occupied by the Phạm Văn Đồng carriageway — OSM's road bounds suggest the road is there, but I did not retrieve its node geometry at that longitude.
- No photographic or street-level source consulted (would need Google Street View / Mapillary, which I could not query).

---

## Q5. Storeys and approximate heights of each major building

### Takeaway
This is the **weakest-evidenced** area. OSM carries `building:levels` for only six buildings on the whole campus and **no `height` tag at all**. NTU's own site gives storeys for exactly one building (the canteen, 4 storeys) plus aggregate floor areas from which average storey counts can be inferred. Everything else is an estimate.

### Cited Findings — CONFIRMED
- `building:levels` tags present in OSM ([Overpass/OSM](https://overpass-api.de/api/interpreter), ODbL 1.0):
  - **Trường Kinh tế và Kinh Doanh – Nhà Đa Năng** (way 231993747): **12 levels**
  - **Trường Kỹ thuật và Công nghệ** (way 231993706): **3 levels**
  - **Khu thí nghiệm thực hành** (way 231993733): **3 levels**
  - **Nhà Truyền thống** (way 231993708): **1 level**
  - **Xưởng cơ khí** (mechanical workshop, way 231993721): **1 level**
  - Three unnamed small buildings (777346773, 777346775, 777346789): **1 level**
  - **No `height` tag on any building.**
- **Canteen: a 4-storey building** with four zones (canteen, beverage, mini-market, entertainment) — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*
- **Lecture halls: 8 halls, 120 classrooms**, stated as **120 rooms covering 15,000 m²**, seating 6,000 students at once — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*. NTU's Vietnamese public-disclosure/press material gives **9 lecture-hall blocks totalling nearly 28,000 m²** ("Nhà trường có 9 khu giảng đường với diện tích gần 28.000 m²") — [NTU admissions / public disclosure docs](https://tuyensinh.ntu.edu.vn/uploads/2/files/DE%20AN%20CNTT_25_6.pdf) — *Vietnamese*. **These two figures conflict** (8 vs 9 blocks; 15,000 vs 28,000 m²) — the 15,000 m² is probably net classroom area and the 28,000 m² gross floor area, but that reconciliation is my guess.
- **Dormitories: 10 buildings, ~1,000 rooms, >5,000 students**; facilities include canteens, laundry, indoor and outdoor stadiums, gymnasiums, table-tennis rooms — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*. OSM maps **K1–K8 plus "K9 (cũ)"** = 9 dorm ways (ODbL 1.0), consistent with "10 buildings".
- **Library: 3 buildings, 7 reading rooms, 1,000 seats**, 2 bookstores, 18,000 titles / 46,000 copies — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*. OSM maps exactly **Thư viện 1, 2, 3** (ODbL 1.0).
- **50 laboratories** (chemistry, biology, biotechnology, food technology, ship engines) — [en.ntu.edu.vn](https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure) — *English*

### Inferences — ESTIMATED, not confirmed
Working from footprint (Q2) ÷ stated gross floor area, and assuming true footprint ≈ 78 % of the axis-aligned bbox and a **3.6 m floor-to-floor** for Vietnamese institutional construction of this era:

| Building | Estimated storeys | Estimated height (m) | Basis / confidence |
|---|---|---|---|
| **A1 admin (main building)** | **3–4** | **11–15** | NOT sourced. 90 × 18 m bar; typical Vietnamese provincial-university administrative block. **Low confidence.** |
| **G1–G8 lecture halls** | **3** (range 2–4) | **10–14** | G1–G8 bbox footprints sum to 10,839 m² ⇒ true footprint ≈ 8,450 m². Against 28,000 m² gross ⇒ **3.3 storeys average**; against 15,000 m² ⇒ 1.8. Taking the gross figure gives ~3. **Medium confidence on the average, low per-building.** |
| **K1–K8 dormitories** | **4–5** | **14–18** | 9 dorm bbox footprints sum to 11,381 m² ⇒ true ≈ 8,900 m². 1,000 rooms × ~22 m² + ~35 % circulation ≈ 34,000 m² gross ⇒ **~3.8 storeys**; Vietnamese KTX of this scale are usually 4–5. **Medium confidence.** |
| **Thư viện 1 / 2 / 3** | **3–4** | **12–16** | Not sourced. TV1 is the largest (60 × 49 m bbox). The brief notes one wing with a round/drum end — consistent with a drum-shaped reading room, which usually runs full height. **Low confidence.** |
| **Nhà Thi Đấu Đa Năng (gymnasium)** | **1 tall volume** | **10–14 to ridge** | 46.8 × 63.0 m bbox — a clear-span indoor hall; such halls need 9–12 m clear internal height. **Medium confidence from typology, not sourced.** |
| **Canteen** | **4** | **~14** | **CONFIRMED storeys** (en.ntu.edu.vn); height inferred at 3.5 m/floor. |
| **Nhà Đa Năng (Econ/Business)** | **12 (tagged)** | **~40–44** | OSM `building:levels=12`. If correct this is by far the **tallest structure on campus** and a dominant landmark on the south-west rim. **Flagged: a single untagged-by-height OSM value, not independently confirmed — verify before modelling.** |
| **Grandstand** | **1 raked tier** | **~6–8** | 12.9 × 88.4 m strip, `building=grandstand`. Typology only. |
| **Trường Kỹ thuật và Công nghệ** | **3 (tagged)** | **~11** | OSM-confirmed. |
| **Khu thí nghiệm thực hành** | **3 (tagged)** | **~11** | OSM-confirmed. |
| **Nhà Truyền thống, Xưởng cơ khí** | **1 (tagged)** | **4–7** | OSM-confirmed. Workshop likely a tall single volume. |

### Gaps
- **No per-building storey count or height is published for A1, the libraries, the G halls, the K dorms or the gymnasium.** I found no official NTU facilities table, no building permit data, no 3D/LoD2 model, and OSM has no height tags. All figures in the estimates table above except the canteen, Nhà Đa Năng, Trường KT&CN, Khu TN thực hành, Nhà Truyền thống and Xưởng cơ khí are **my typology-plus-floor-area estimates and must be labelled as such in any downstream document.**
- The 8-vs-9 lecture halls and 15,000-vs-28,000 m² conflict is unresolved.
- The brief's claim that the main building is "A-2" with a "large red-roofed complex" could not be matched to an OSM name (OSM says A1); roof colour and material are unverified from any source I reached.

---

## Q6. The entrance sequence from the main gate inward

### Takeaway
The gate is a **pedestrian/bicycle gate set back from Nguyễn Đình Chiểu in the north-west third of the site**, on the 26 m contour, from which a service road runs **east along the hill crown** past A3 and G8 into the heart of the campus — arriving first at the **central sports band** (basketball court, badminton court, gymnasium, football pitch), with the A1 administrative bar and the southern tier sitting **below and to the right (south)** behind the hedge-and-steps terrace.

### Cited Findings
- Gate node **2403563080**, `barrier=gate`, `name="Main Gate for Nha Trang Campus"`, **`access=no; bicycle=yes; foot=yes`** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- The way connecting the gate northward/outward is **232002509**, `highway=service`, **`access=private`**, centre 12.2686453,109.2008130 (x ≈ −13, y ≈ +10) — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Way **232042142**, `highway=service`, `access=no; foot=yes; covered=no`, centre 12.2677609,109.2009031 (x ≈ −3, y ≈ −87) — a foot-only route running south from near the gate — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- The main inward road from the gate is way **126760195**, `highway=service`, centre 12.2686286,109.2017321 (x ≈ **+87**, y ≈ **+8**), continued by ways 231993925 (x +88, y +10), 232004719 (x +124, y +13), 231986644 (x +180, y +20) — i.e. a continuous **east-running spine at y ≈ +8…+20** — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Four **`barrier=traffic_island`, `landuse=grass`** ways sit along that spine: 231993966 (x +63, y −10), 232004715 (x +113, y +13), 231993967 (x +134, y +14), 232002528 (x +180, y +21). A fifth (232004714) sits at x −209, y −123 — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- `amenity=fountain` present on campus (in the amenity set returned for the campus area) — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- Nguyễn Đình Chiểu (way 126480403, `highway=tertiary`) is the street on the north/north-west — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)
- "Along the main roads are large shade trees such as **xà cừ, me tây, bàng**, interspersed with **phượng, bằng lăng, liễu**"; hundreds of trees **over 50 years old**; ~1,000 trees planted annually; the path by **G7** is lined with **hoa giấy** (bougainvillea) in summer; teaching halls, library and dormitories "sit among the trees" — [danchuphapluat.vn](https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html) — *Vietnamese*
- Campus is **open Mo–Su 06:00–22:00** (OSM `opening_hours` on the campus polygon) — [Overpass/OSM](https://overpass-api.de/api/interpreter) (ODbL 1.0)

### Inferences
**Reconstructed entrance sequence (geometry from OSM; the visual reading is my inference):**
1. **Approach** along Nguyễn Đình Chiểu, a tertiary street running WSW–ENE at 18–23 m elevation along the hill's northern shoulder. On the campus side, a row of **four small commercial buildings** (ways 232004663/74/81/88, x ≈ −176 to −186, y ≈ +94 to +103) fronts the street at the north-west corner — shops/kiosks screening the campus edge there.
2. **Turn in** onto the private service way 232002509 and reach the **gate itself at (0, 0), elevation ~26 m**, set back south of the street centreline (my linear interpolation of the Nguyễn Đình Chiểu way puts the street ~100–120 m north of the gate node at that longitude, so there is a genuine approach drive — **this set-back distance is approximate and should be verified from imagery**). A small **single-storey building (way 777346775, 11 × 11 m, `building:levels=1`) stands immediately beside the gate at (−8, +24)** — almost certainly the **guard house / bảo vệ post**. Model: a gate portal with a small lodge on the left.
3. **Immediately inside**, the road forks: a vehicle spine east, and a foot-only route (232042142, `foot=yes`) running **south** down the hill toward G7/G6 and the south-west tier.
4. **The entrance spine runs due east along y ≈ +8…+20**, on the crown, with **grassed traffic islands at x +63, +113, +134, +180** — i.e. a **divided, tree-lined avenue with planted medians**, four of them in the first 180 m. This is the strongest single piece of evidence for the character of the entrance: a formal boulevard, not a lane. The 50-year-old xà cừ / me tây / bàng shade trees cited above line it.
5. **First things seen on the right (south) of the spine:** building **A3** at (+12, +31), **G8** at (+62, −6), the **alumni house / Phòng họp số 4** at (+74, −50), then the **basketball court** (+115, −10) and **badminton court** (+157, −7).
6. **On the left (north):** the two **surface car parks** at (+41, +64) and (+86, +63), the **canteen** at (+94, +85), and the **dormitory row K5 / K4 / K3** at (+54…+130, +29…+56).
7. **At ~160–240 m in, the spine arrives at the sports core:** **Nhà Thi Đấu Đa Năng** (gymnasium, 47 × 63 m) at (+158, −44), the **grandstand** (13 × 88 m) at (+200, −28), and the **floodlit artificial-turf football pitch** (61 × 89 m) at (+236, −27) — on a bench cut ~10 m into the hill (Q3). Also here: the **Bảo Tàng Thuỷ Sinh Vật** (aquatic-life museum) at (+119, −30), the **CLB Sinh Viên** student club at (+120, −54), and a `leisure=park` (way 1545622609) at (+140, −32).
8. **The administrative heart is a level below and to the right:** **A1's 90 m bar at (+123, −123)** sits roughly 100 m south of the spine and ~12 m lower than the crown's south side, behind the continuous **hedge terrace with four flights of steps** at y ≈ −92…−110. So A1 is **not** on the entrance axis — you turn right and descend to reach it. Beyond it, the southern tier (HT-1, HT-2, labs, B3, Nhà Truyền thống, G3/G4/G5) steps further down toward the sea.
9. **The far (eastern) end** of the spine reaches the **library cluster TV1/TV2/TV3** at (+250…+314, +94…+120) and **G1 / G2 / A9 / K6** on the eastern rim at x +314…+368.

### Gaps
- **No source describes the gate structure itself** — arch, pylons, signage, number of lanes, barrier type. The `access=no; bicycle=yes; foot=yes` tagging suggests a pedestrian gate, which sits oddly with the name "Main Gate"; it is possible OSM has mapped only the pedestrian leaf of a larger gate, or that vehicles use a different entrance. **Unresolved.**
- The brief states the MAIN GATE is on Nguyễn Đình Chiểu; OSM's gate node is 100+ m inside the boundary from that street. These are reconcilable (set-back gate on an approach drive) but not confirmed.
- I found no image, Street View capture or official photo of the entrance, so the "what you see first" reading above is reconstructed from plan geometry and should be checked against imagery before being treated as fact.
- Whether a fountain sits on the entrance axis (a very common Vietnamese campus motif, and `amenity=fountain` is present on campus) — **I could not establish its coordinates**; it was in the amenity result set but without a position I could extract.

---

## Q7. Internal road network

### Takeaway
OSM maps roughly **55 `highway=service` ways, ~45 `highway=footway` ways, 4 `highway=steps` flights, one footbridge and one `layer=-1` underpass** inside the campus. The pattern is consistent with the brief's description: a **perimeter loop plus a central cross**, with the E–W arm being the formal entrance avenue along the crown and the N–S arm crossing it near the sports core, plus a separate **terraced stair-and-path system** linking the crown to the lower southern tier.

### Cited Findings
All from [Overpass API / OpenStreetMap](https://overpass-api.de/api/interpreter), © OpenStreetMap contributors, ODbL 1.0. Centres converted to local metres (x E, y N from the main gate):

**The one named internal road — Đường Thanh Niên** (`highway=service`, `oneway=yes`):
- way **231986642**, centre 12.2676188,109.2023813 ⇒ **(x +158, y −103)**
- way **232002525**, centre 12.2676069,109.2028176 ⇒ **(x +206, y −104)**, with **`layer=-1`**

**Entrance / crown E–W spine** (ways 126760195, 231993925, 232004719, 231986644): centres at (x +87, y +8), (+88, +10), (+124, +13), (+180, +20)

**North / dormitory-and-library arm** (ways 126760234, 231986645, 231993861, 232002526, 232004704, 231993948, 970639440, 232002493, 1554232305, 126760198): centres at (+136, +84), (+139, +82), (+154, +73), (+140, +74), (+151, +69), (+174, +60), (+193, +37), (+237, +93), (+243, +106), (+223, +141). Way 126760198 is **`access=private`**.

**Western arm** (ways 126760242, 231993876, 770559043, 777346791): centres at (−129, +38), (−114, −7), (−170, −15), (−131, −3)

**Eastern arm** (ways 232005458, 126760202, 232002511, 232002495, 232002496, 232002497): centres at (+306, +14), (+300, −51), (+291, −37), (+275, −82), (+304, −104), (+248, −72). Ways 126760202 and 232002511 are **`oneway=yes`**.

**Southern arm** (ways 231993900, 1040146773, 1040146774, 1040146775, 771829121, 231993947, 232002499, 232002502, 231993953, 232002513, 1534818585–88, 232041743, 232002501, 232002510, 232002520, 1545622618): centres spanning (x −41…+232, y −38…−204). Way **1545622618** is `oneway=yes` at (+128, −109).

**Driveway stubs on the west/south-west** (`service=driveway`, ways 231993864, 231993865, 231993871, 231993872, 231993903, 231993914, 231993924, 231993950, 232006264, 232039818, 777346791): centres clustered at x −115 to −172, y −78 to −150 — i.e. a dense **private-driveway fringe** serving G7, the Fisheries school and K7 on the west side.

**Covered walkway:** way **1545622617**, `highway=footway`, `surface=concrete`, **`covered=yes`, `lit=yes`, `width=2`**, centre 12.2675768,109.2017314 ⇒ **(x +87, y −108)** — a covered colonnade on the A1 terrace line.

**Paved footpath with width:** way 1545622621, `highway=footway`, `surface=paved`, `width=2`, centre (+181, −129).

**Steps (all `surface=paved`, `width=2`, `handrail=no`, `lit=no`):** ways 1545622620 (+124, −95), 1545622619 (+195, −92), 1545622604 (+309, −92), 1545622608 (+345, −95).

**Footbridge:** way 231993902, `bridge=yes`, `layer=1`, (+356, −105).

**Three `leisure=park` areas:** ways 1545622609 (+140, −32), 1545622622 (+183, −151), 1545622623 (+215, −161). **One `leisure=garden`:** way 232004725 (+63, +42).

### Inferences
- **The "perimeter loop" is real** and traceable: the north arm (y +37 to +141) → east arm (x +248 to +306) → south arm (y −38 to −204) → west arm (x −114 to −170) → back to the gate. Its approximate extent is **x −170 → +306, y −204 → +141**, i.e. a ring roughly **475 m × 345 m** set in from the boundary. Service road carriageway width is not tagged; the four grassed traffic islands indicate the entrance section is divided, the rest probably single-carriageway.
- **The "central cross"**: the E–W arm is the entrance avenue at y ≈ +8…+20; the crossing N–S arm runs up from the A1/Thanh Niên terrace (y ≈ −104) through the sports core (y ≈ −30) to the dormitory/library arm (y ≈ +70…+90) at around **x ≈ +130–200**. The crossing point is therefore near **(x +160, y +10)**, right at the gymnasium/badminton court — which makes the sports core the campus's geometric and circulatory centre, not the admin building.
- **Đường Thanh Niên is the south tier's own spine**, running east at y ≈ −103/−104, one-way, directly in front of the A1 bar and the covered walkway. Its `layer=-1` segment at x +206 means it **passes under** a structure near the Nhà Truyền thống / grandstand — a level change worth modelling.
- **The four stair flights (x +124, +195, +309, +345, all at y ≈ −92…−95) plus the covered walkway at (+87, −108) and the hedge strips (x +90…+300, y ≈ −110) form one continuous retaining line.** For a 3D artist this is the single most characterful feature: a ~470 m planted terrace wall separating the upper (entrance/sports) level from the lower (administrative/southern) level, pierced by four unlit, unhandrailed 2 m stair flights and one covered colonnade.
- **One-way segments** (126760202, 232002511 east; 231986642, 232002525 Thanh Niên; 1545622618 south) suggest the internal traffic circulation is a **clockwise or anticlockwise one-way gyratory** on the southern and eastern sides — plausible given the gradients.
- **Asymmetry worth modelling:** the west side is driveway-fed and informal (11 `service=driveway` stubs); the north and east sides are formal roads with parking; the south is terraced and partly stepped/pedestrian. The campus is **not** uniformly gridded.

### Gaps
- **No road widths, surfaces or lane counts** are tagged on any internal campus road except the footways/steps (`width=2`). Carriageway widths are unknown.
- I did not retrieve full node geometry for any road, only each way's centre point — so the above is a reconstruction of topology from centroids, and the exact alignment of the loop and the cross is **inferred, not traced**. A 3D artist wanting accurate road centrelines should re-run the Overpass query with `out geom;`.
- Whether the loop is actually continuous (vs. interrupted by the terrace) is not confirmed.

---

## Overall caveats for the report-writer

- **Confirmed (official source, or two independent agreeing sources):** campus identity and address; OSM polygon bounds and every way ID / coordinate / footprint bbox cited; main gate and A1 coordinates; 23.4 ha official area (admissions doc) with "20 ha / >20 ha" from the official English site and press corroborating the order of magnitude; location on La San hill with sea views; the building inventory (G1–G8, K1–K9, TV1–3, HT1–3, A1/A3/A8/A9, B3, gymnasium, football pitch, grandstand, canteen, aquatic museum); 4-storey canteen; 3-building library; 10 dormitory buildings; 50 labs; the existence of the perimeter loop, central cross, terrace stairs, footbridge and underpass.
- **Estimated / my own calculation (clearly derived, not sourced):** every local-metre x/y value; all distance-to-shoreline figures; the terrain model and slope percentages; storey counts for A1, G-halls, dorms, libraries and gymnasium; the entrance-sequence narrative; the loop-and-cross reconstruction from centroids.
- **Uncertain / conflicting — do not present as fact:** "A-2" vs OSM's "A1" for the main building; 8 vs 9 lecture-hall blocks; 15,000 vs 28,000 m² lecture floor area; the 12-storey Nhà Đa Năng (single untriangulated OSM tag); the gate's set-back distance from Nguyễn Đình Chiểu; whether the named "Main Gate" node is the vehicle entrance; all SRTM absolute elevations (±~8 m under canopy); which named buildings actually have sea views; the current ward name.
- **Historical note:** NTU descends from the Fisheries line (Đại học Thủy sản / Trường Đại học Thủy sản), which OSM still records as `alt_name=Đại học Thủy Sản` with `start_date=1966`; the English site and 65-year anniversary document date the institution to 1959. All geometry above is the **present-day** campus.
- **Licence requirement:** any use of the geometry tables must carry **"© OpenStreetMap contributors, ODbL 1.0"**. Elevation values are from SRTM via OpenTopoData (SRTM is public domain; OpenTopoData asks for attribution).
