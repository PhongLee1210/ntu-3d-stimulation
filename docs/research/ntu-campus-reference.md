> Trạng thái: tài liệu nghiên cứu để dựng cảnh campus cho một theme `ntu` mới, thay cho hình dáng
> hiện tại vay từ VinUniversity. Bản đầu **2026-11-02**. Đối tượng: Trường Đại học Nha Trang (NTU),
> 02 Nguyễn Đình Chiểu, phường Bắc Nha Trang, Khánh Hoà — **không** phải NTU Singapore, NTU Taiwan
> hay Viện Hải dương học ở Cầu Đá. Gộp năm đợt nghiên cứu, ký hiệu dùng suốt tài liệu:
>
> - **[O]** — OSM/Overpass API (lấy 2026-11-02) và SRTM 30 m qua OpenTopoData: polygon campus,
>   54 way nhà, đường nội bộ, bậc thang, hàng rào cây, cao độ.
> - **[N]** — nguồn chính thức của trường: `ntu.edu.vn`, `en.ntu.edu.vn`, `tuyensinh.ntu.edu.vn`,
>   `thuvien.ntu.edu.vn`, Báo cáo thường niên 2025 (**AR2025**), Sổ tay tuyển sinh 2019
>   (**SOTAY2019**), bản tin nội bộ 09/2025 (**BT09/2025**).
> - **[A]** — đọc *ảnh*: bộ ảnh chính thức `ntu.edu.vn/gioi-thieu/co-so-vat-chat`, một ảnh
>   Wikimedia Commons 2009, hai ảnh không ảnh chính thức, một khung drone 2019. Gần như toàn bộ
>   hiểu biết về kiến trúc đến từ đây, vì nguồn chữ hầu như không nói gì về kiến trúc campus.
> - **[P]** — báo chí và tham khảo tiếng Việt/Anh: Dân chủ & Pháp luật, Wikipedia (vi/en), nguồn
>   du lịch về Hòn Chồng, nguồn thực vật.
> - **[M]** — **ảnh bản đồ campus chính thức do chủ dự án cung cấp.** Đây là **nguồn sơ cấp đã xác
>   nhận** cho phần chú giải và phân khu: G1–G8 giảng đường, K1–K8 ký túc xá, TV2–TV4 thư viện,
>   HT1/HT3 hội trường, Main building, Canteen, Gymnasium, Football field, Main Gate trên Nguyễn
>   Đình Chiểu; ranh giới Nguyễn Đình Chiểu / Tôn Thất Tùng / Phạm Văn Đồng; biển ở phía đông nam;
>   mã màu vàng = ký túc xá, tím = giảng đường, nâu đỏ = hành chính, hồng sen = hội trường, lục
>   đậm = thể thao, thêm một dải cyan. Chú giải này được SOTAY2019 xác nhận độc lập (cùng danh mục
>   nhãn, cộng "Cổng chính", "Khu hiệu bộ", "Tòa nhà đa năng", "Bãi biển"). **Cần đối chiếu với tên
>   OSM:** bản đồ ghi toà hành chính là **A-2**, OSM ghi **"Tòa nhà A1 (Khu hành chính)"** — xem
>   §3. Ảnh bản đồ nên được commit cạnh theme pack để người đọc sau kiểm lại được, và **mọi hex của
>   sáu màu mã hoá phải lấy mẫu từ chính ảnh đó**, không được đoán.
>
> Ảnh tham chiếu [A] chỉ nằm trong scratchpad của phiên làm việc, **không** đưa vào repo.

# Tham chiếu khuôn viên Trường Đại học Nha Trang (đồi La San, Nha Trang)

**Quy ước.** "Chắc chắn" nghĩa là có trong nguồn chính thức của trường, hoặc hai nguồn độc lập
khớp nhau. Mọi thứ khác nằm ở **§3**, kể cả những thứ nghe rất hợp lý. Tài liệu này được viết
trong điều kiện **không có một hex nào được lấy mẫu từ ảnh biển/trời/cát/tán lá Nha Trang** — đợt
nghiên cứu không tải được ảnh để sample. Mọi màu thiên nhiên trong §2.6 và §4 vì thế là **ước
lượng**, và được ghi rõ như vậy ngay trong bảng. Hex lấy mẫu thật chỉ có ba nhóm: logo (file PNG
chính thức, có đếm pixel), CSS của trang trường, và vài điểm single-pixel trên ảnh JPEG nén dưới
nắng gắt — nhóm thứ ba chỉ để đọc "sắc gì", không phải để đổ màu. Dữ liệu bản đồ:
**© OpenStreetMap contributors, ODbL 1.0**. Cao độ: SRTM 30 m qua OpenTopoData.

**Hai hệ toạ độ** (mét, cùng gốc):

- **(x, y)**: gốc tại **node cổng chính OSM 2403563080** (`barrier=gate`,
  `name="Main Gate for Nha Trang Campus"`), **12,2685519 N / 109,2009298 E**. `x` hướng đông,
  `y` hướng bắc. Tỷ lệ 1° lat = 110 574 m, 1° lon = 108 778 m; phép chiếu phẳng, sai số dưới 1 m
  trên toàn site 630 m.
- **(s, t), hệ trục site**: campus **xoay 73°** so với hướng bắc (Nguyễn Đình Chiểu chạy theo
  phương vị 74°; hướng từ cổng tới Thư viện 1 là 71°). `s` chạy dọc **trục vào** (phương vị 73°,
  đông-đông bắc), `t` vuông góc, **dương về phía biển** (phương vị 163°, nam-đông nam).
  Đổi hệ: `s = 0,9563x + 0,2924y`, `t = 0,2924x − 0,9563y`; ngược lại
  `x = 0,9563s + 0,2924t`, `y = 0,2924s − 0,9563t`.
- **Trong game:** `x_game ≈ s`, `z_game ≈ t`. Nghĩa là **cổng ở gốc, trục vào chạy theo +x, biển ở
  +z, sườn đồi đổ về +z**. Khác hẳn theme `vinuni`, nơi landmark ở `−z` và đài phun ở `+z`:
  ở NTU **không có trục đối xứng**, nên không có "landmark ở cuối trục" — xem §4.
- Kích thước "cỡ m" trong §2.1 là **bbox theo x/y của OSM**, tức **chặn trên**. Vì hầu hết các toà
  xoay ~17° so với bắc để bám đường phố, cạnh thật thường chỉ bằng **70–85 %** bbox. Toàn bộ node
  geometry từng toà chưa được lấy; ai cần đường bao thật phải chạy lại Overpass với `out geom;`.

## 1. Tóm tắt

Campus **không** có trục đối xứng. Nó là một **vương miện đồi** (hill crown) cao 28–30 m, đổ xuống
8–18 m ở **mọi** mép, dốc nhất về phía nam và đông nam ra biển (~11 %). Đi từ cổng vào:

1. **Đến** theo Nguyễn Đình Chiểu, đường tertiary chạy ở cao độ 18–23 m trên vai bắc của đồi. Ở
   góc tây bắc, **bốn quán nhỏ** (x ≈ −176…−186, y ≈ +94…+103) chắn mặt phố [O].
2. **Rẽ vào** đường nội bộ `access=private` rồi tới **cổng ở (0, 0), cao độ ~26 m**. Ngay cạnh
   cổng, ở (−8, +24), có một **nhà 1 tầng 11 × 11 m** — gần như chắc chắn là **nhà bảo vệ** [O].
   **Hình dáng cổng: không có bằng chứng nào** (§3) — và đây là thứ người chơi thấy đầu tiên.
3. **Ngay trong cổng** đường chẻ hai: một nhánh xe chạy về đông, một nhánh **chỉ đi bộ** đổ về nam
   xuống G7/G6 [O].
4. **Trục vào chạy thẳng về đông ở y ≈ +8…+20**, trên đỉnh đồi, với **bốn đảo giao thông có cỏ**
   ở x = +63, +113, +134, +180 — tức một **đại lộ có dải phân cách trồng cây**, bốn đảo trong
   180 m đầu [O]. Hai bên là **xà cừ, me tây, bàng** hơn nửa thế kỷ [P].
5. **Bên phải (nam):** A3 (+12, +31), **G8** (+62, −6) với **đài phun cá heo** trước mặt, nhà
   khách cựu sinh viên (+74, −50), rồi sân bóng rổ (+115, −10) và sân cầu lông (+157, −7).
   **Bên trái (bắc):** hai bãi xe (+41, +64) và (+86, +63), **Canteen** (+94, +85), và dãy ký túc
   xá K5/K4/K3 (x +54…+130, y +29…+56) [O].
6. **Ở 160–240 m, trục tới lõi thể thao:** **Nhà Thi Đấu Đa Năng** 47 × 63 m (+158, −44), **khán
   đài** dải dài 13 × 88 m (+200, −28), và **sân bóng cỏ nhân tạo có đèn** 61 × 89 m (+236, −27)
   — nằm trên một **mặt bằng đào vào đồi sâu ~6–11 m** (sân đọc 18 m trong khi đất 60 m về nam
   đọc 29 m). Cũng ở đây: **Bảo tàng Thuỷ sinh vật** (+119, −30) và **CLB Sinh viên** (+120, −54)
   [O].
7. **Trung tâm hành chính nằm thấp hơn và lệch về bên phải.** **Dải thanh dài 90 × 18 m của A1**
   ở (+123, −123) nằm ~100 m nam trục và ~12 m thấp hơn, **sau một bờ taluy trồng cây dài ~470 m**
   có **bốn bậc thang 2 m không đèn, không tay nắm** xuyên qua (x +124, +195, +309, +345) và một
   **hành lang có mái** ở (+87, −108). **A1 không nằm trên trục vào: muốn tới phải rẽ phải và đi
   xuống** [O].
8. **Tầng nam, thấp nhất và sát biển nhất:** HT-1 (+103, −204), HT-2, khu thí nghiệm, B3
   (+256, −136), Nhà Truyền thống, G3, G4 và **G5** — toà dài hơi cong, mái phẳng, mang **chữ
   rời trên lan can mái "ĐẠI HỌC NHA TRANG / NHA TRANG UNIVERSITY"**, quay ra biển. Đây là **bộ
   mặt của trường** trong mọi ảnh không ảnh chính thức [A].
9. **Đầu đông của trục** tới cụm **thư viện TV1/TV2/TV3** (x +250…+314, y +94…+120) và G1/G2/A9/K6
   trên vành đông (x +314…+368). **K6 là ngoại lệ**, đứng xa về đông nam, cạnh một **cầu bộ hành**
   (+356, −105) [O].

Vành ngoài là một **đường vòng ~475 × 345 m** (bắc → đông → nam → tây), cắt bởi một **nhánh ngang
nam–bắc ở x ≈ +130…+200**, nên **điểm giao hình học và giao thông của campus là lõi thể thao, không
phải toà hành chính**. Mép nam campus **cách nước ~20–25 m**; lõi xây dựng cách 130–250 m; đầu
cổng/thư viện/ký túc xá cách 350–360 m [O].

## 2. Chắc chắn

### 2.1 Mặt bằng (OSM; chú giải từ [M] và SOTAY2019)

Polygon campus = **OSM way 126760189**, `amenity=university`, `name=Trường Đại học Nha Trang`,
`operator=Bộ Giáo dục và Đào tạo`, `opening_hours=Mo-Su 06:00-22:00`, `internet_access=wlan`,
`start_date=1966`, `alt_name=Đại học Thủy Sản`. Bbox 12,2662440–12,2701865 N,
109,1988606–109,2046475 E ⇒ **629,5 m (Đ–T) × 435,9 m (B–N)**, bbox 27,44 ha. Cổng nằm ở **một
phần ba phía tây bắc**: 181 m từ mép bắc, 225 m từ mép tây, và 404 m campus còn lại nằm **về phía
đông** [O].

Dưới đây là **20 hàng đáng dựng nhất** trong 59 đối tượng đã truy (không phải toàn bộ). Mọi hàng:
© OpenStreetMap contributors, ODbL 1.0.

| Hạng mục | way/node | Tâm (x, y) | Tâm (s, t) | Cỡ bbox m | Ghi chú |
|---|---|---|---|---|---|
| **Cổng chính** | node 2403563080 | (0, 0) | (0, 0) | — | `barrier=gate`, `access=no; bicycle=yes; foot=yes`. Cao độ 26 m. Hình dáng: §3 |
| Nhà bảo vệ (suy ra) | 777346775 | (−8, +24) | (−1, −25) | 11 × 11 | `building:levels=1`, sát cổng |
| **G8** | — | (+62, −6) | (58, +24) | — | 2 tầng, mái ngói đỏ, hiên cột hai tầng; **đài phun cá heo** phía trước [A] |
| Vườn (`leisure=garden`) | 232004725 | (+63, +42) | (73, −22) | — | Bên trái trục vào |
| Bãi xe 1 / 2 | `amenity=parking` ×2 | (+41, +64) / (+86, +63) | (58, −49) / (101, −35) | — | Mặt bắc trục vào |
| **Canteen** | `amenity=canteen` | (+94, +85) | (115, −54) | — | **4 tầng (xác nhận)**, 4 khu: căng tin, nước, mini-mart, giải trí [N] |
| Sân bóng rổ / cầu lông | — | (+115, −10) / (+157, −7) | (107, +43) / (148, +53) | — | Trên đỉnh đồi, cạnh trục |
| **Bảo tàng Thuỷ sinh vật** | — | (+119, −30) | (105, +63) | — | 1.100+ mẫu vật, >60 năm [N] |
| CLB Sinh viên | — | (+120, −54) | (99, +87) | — | |
| **A1 (Khu hành chính)** | 231993835 | (+123, −123) | (82, +154) | **90,2 × 18,3** | Thanh dài mảnh; phòng hiệu trưởng ở đây [N]. Cao độ ~30 m |
| Hành lang có mái | 1545622617 | (+87, −108) | (52, +129) | `width=2` | `covered=yes`, `lit=yes`, `surface=concrete` — trên tuyến taluy A1 |
| **Nhà Thi Đấu Đa Năng** | 231986641 | (+158, −44) | (138, +88) | 46,8 × 63,0 | Vì kèo thép khẩu độ lớn, 800 chỗ, sàn futsal [N][A] |
| Khán đài | 232039821 | (+200, −28) | (183, +85) | **12,9 × 88,4** | `building=grandstand`, một dải duy nhất ở mép **tây** (phía trên dốc) |
| **Sân bóng đá** | 231993996 | (+236, −27) | (218, +95) | **61,2 × 89,1** | `sport=soccer`, `surface=artificial_turf`, `lit=yes`; 5.000 chỗ [N]. Trục dài B–N |
| Đường Thanh Niên (đoạn ngầm) | 232002525 | (+206, −104) | (167, +160) | `layer=-1` | Đường nội bộ **chui dưới** một kết cấu, đúng trên tuyến taluy |
| **Trường Kỹ thuật và Công nghệ** | 231993706 | (+206, +81) | (221, −17) | 66,9 × 45,1 | **`building:levels=3`** |
| **B3** | 231993716 | (+256, −136) | (205, +205) | 54,4 × 56,7 | Tầng nam, gần biển |
| **Thư viện 2** | — | (+279, +94) | (294, −8) | — | Cao độ 30 m |
| **Thư viện 1** | 231993710 | (+314, +106) | (331, −10) | 60,3 × 49,1 | Toà lớn nhất trong cụm |
| G2 | — | (+358, −42) | (330, +145) | — | Vành đông, 6 tầng, đứng ngay trên vịnh [A] |
| Cầu bộ hành | 231993902 | (+356, −105) | (310, +205) | `bridge=yes`, `layer=1` | Cạnh K6 |
| K6 (ngoại lệ) | — | (+368, −103) | (322, +206) | — | Ký túc xá lẻ ở đông nam |
| K1 | — | (+176, +114) | (202, −58) | — | Đầu đông dãy ký túc xá bắc |
| **Trường Thuỷ sản và KH sự sống** | 231980914 | (−140, −34) | (−144, −8) | **96,7 × 57,2** | Toà có bbox lớn nhất campus, mép tây |
| **HT-3** (Viện KHCN Khai thác Thuỷ sản) | 232039796 | (−183, +52) | (−160, −103) | 65,6 × 54,1 | Nơi có **phòng mô phỏng điều động tàu** và **phòng bảo tàng ngư cụ** [N] |
| K7 | 232041038 | (−188, −91) | (−206, +32) | 58,6 × 51,1 | Mép tây |
| **Nhà Đa Năng** (Trường KT&KD) | 231993747 | (−106, −151) | (−146, +113) | — | **`building:levels=12`** — cao nhất campus nếu đúng (§3). Cao độ nền 16 m |
| HT-1 | — | (+103, −204) | (39, +225) | — | Mũi nam, cách bờ ~128 m |
| Dãy 4 quán mặt phố | 232004663/74/81/88 | (−181, +98) | (−144, −147) | — | Chắn mép Nguyễn Đình Chiểu ở góc tây bắc |

Thêm từ [O], không có trong bảng: **năm dải `barrier=hedge, area=yes`** (way 1545622612–16) xếp
thành một hàng ở y ≈ −110, trải x ≈ +90 → +300; **bốn `highway=steps`** (`surface=paved`,
`width=2`, `handrail=no`, **`lit=no`**) ở (+124, −95), (+195, −92), (+309, −92), (+345, −95);
**ba `leisure=park`** ở (+140, −32), (+183, −151), (+215, −161); một `amenity=fountain`,
một `amenity=library` (node), một `amenity=internet_cafe`; **11 `service=driveway`** chụm ở
x −115…−172, y −78…−150 (vành tây là vành *đường ngõ tư nhân*, không phải đường chính thức).

**Diện tích.** Con số để dựng là **~20–23 ha**, không phải bbox 27,44 ha: hồ sơ tuyển sinh ghi
**23,4 ha**, trang tiếng Anh chính thức ghi **20 ha**, báo ghi "rộng hơn 20 ha" [N][P]. AR2025 lại
ghi đất cơ sở chính **172 707 m² = 17,3 ha** — mâu thuẫn thứ tư, xem §3. Tổng đất mọi cơ sở
(Cam Ranh, Ninh Phụng, Hòn Rớ, Cam Lâm) **515 430–515 835 m² ≈ 51,6 ha**; **đừng dùng số này cho
polygon campus** [N].

### 2.2 Địa hình: vương miện đồi, thềm 470 m, sân bóng đào bậc

Đây **thật sự** là campus đồi, và đặc biệt là **đỉnh đồi, không phải một sườn một chiều** [O].

| Điểm | (x, y) | Cao độ SRTM |
|---|---|---|
| Cổng chính | (0, 0) | **26 m** |
| A1 hành chính | (+123, −123) | **30 m** |
| Thư viện 2 | (+279, +94) | **30 m** |
| K1 | (+176, +114) | 24 m |
| **Sân bóng đá** | (+236, −27) | **18 m** |
| G2 (đông) | (+358, −42) | 18 m |
| K6 (đông nam) | (+368, −103) | 21 m |
| Trường Thuỷ sản (tây) | (−140, −34) | 26 m |
| Nhà Đa Năng (tây nam) | (−106, −151) | 16 m |
| Góc đông nam campus | (+403, −216) | **8 m** |

- **Mô hình địa hình:** một vương miện hơi nghiêng ở **28–30 m** chạy thành dải từ (+95, −39) qua
  A1 (+123, −123) tới (+225, −171) rồi lên đông bắc tới cụm thư viện (+279, +94). Từ đó đất đổ
  xuống **8–18 m ở mọi mép**. Tổng độ chênh toàn site **≈ 22 m**.
- **Độ dốc:** nam/đông nam ra biển **dốc nhất, ~10–11 %** (29 m ở (+225, −171) → 8 m ở
  (+403, −216)); bắc ra Nguyễn Đình Chiểu **~7 %**; tây **nhẹ nhất**.
- **Cổng → A1 chỉ lên 4 m trên 175 m.** Người chơi đi vào từ cổng **không** leo đồi; cú rơi lớn
  nằm **sau lưng** (nam/đông nam), không ở phía trước. Đây là chi tiết dễ dựng sai nhất.
- **Thềm ~470 m, hạng mục có tính cách nhất của site.** Năm dải hàng rào cây (x +90…+300,
  y ≈ −110), **bốn bậc thang** (x +124, +195, +309, +345, y ≈ −92…−95), hành lang có mái
  (+87, −108) và đoạn Đường Thanh Niên `layer=-1` (+206, −104) **xếp thành một tuyến liên tục duy
  nhất**: một **bờ taluy trồng cây** chia tầng trên (cổng + thể thao) khỏi tầng dưới (hành chính +
  nam), **xuyên qua ở bốn điểm bằng bậc 2 m không đèn không tay nắm**.
- **Sân bóng là bậc đào, không phải sân bằng tự nhiên.** Sân phẳng 61 × 89 m đọc 18 m, đất 60 m về
  nam đọc 29 m, 60 m về bắc đọc 24 m. Một sân phẳng không thể nằm trên dốc 11 % ⇒ **đào vào đồi
  ~6–11 m**, đúng lý do **khán đài chỉ có một dải, ở mép tây (phía trên dốc)** và lý do tuyến
  taluy chạy ngay phía nam sân.

Cảnh báo dùng số: SRTM 30 m là **DSM radar năm 2000**, không phải DTM; nó tính cả tán cây. Campus
có **hơn 50 % tán cây và hàng trăm cây trên 50 tuổi** [P], nên từng giá trị có thể **cao 5–10 m**.
**Tin hình dạng mặt đất; coi mỗi số tuyệt đối là ±8 m.** Số 18 m ở sân bóng (mặt trống, trơ) đáng
tin hơn các số 30 m trong vùng rợp cây.

### 2.3 Toà G5 và mặt tiền hướng biển — landmark thật của NTU

Trên bằng chứng ảnh, **bộ mặt của trường là G5**, không phải cổng, không phải mái vòm, không phải
tháp. Không có **tháp nào** và **không có đồng hồ nào** trong bất kỳ ảnh nào đã xem [A].

- **Hình khối:** toà **dài, hơi cong / gập khúc trong mặt bằng**, **mái phẳng** hoàn thiện bằng
  màng/tôn **xanh-xám nhạt**, đọc được **~5–6 tầng**, tường **kem nhạt**, mặt dài là **hành lang
  kính/lam chạy liên tục** — không phải mặt tiền đục lỗ. Chạy **song song với đường biển ở mép
  hướng biển của campus** [A].
- **Lan can mái mang chữ rời khổ lớn**: `ĐẠI HỌC NHA TRANG` trên một dòng, `NHA TRANG UNIVERSITY`
  nhỏ hơn bên dưới. Chữ **xanh navy/đậm, dựng rời trên mép lan can**, không sơn lên tường. Nhìn từ
  không ảnh, hàng chữ đó quay **ra biển và ra phía cầu Trần Phú** [A].
- **Tiếp cận** bằng một lối đi dưới **giàn thép trồng hoa giấy** [A].
- **Ngay phía trong (về đất liền) là vài khối thấp hơn có mái dốc ngói đỏ/đất nung, tường kem** —
  đây gần như chắc chắn là "khu mái đỏ ở phía nam campus" mà chú giải bản đồ [M] gọi là khu hiệu
  bộ / hành chính [A].
- 2025: trường cải tạo **4 phòng ở tầng trệt G5** cho các chương trình đặc biệt — tức G5 vẫn là
  toà được đầu tư, không phải toà cũ bị bỏ [N].

**Hệ quả quan trọng cho art direction:** landmark của NTU là một **thanh nằm ngang, bất đối xứng,
quay ra biển, cao vừa phải** — ngược hoàn toàn với một **tháp đứng ở cuối trục đối xứng**. Xem §4.

### 2.4 Các toà đáng dựng khác

Tất cả mô tả dưới đây **đọc từ ảnh chính thức** [A]; số tầng đọc trên ảnh, có thể lệch 1 ở nơi
tầng trệt để thông hoặc nền dốc.

| Toà | Tầng | Mái | Tường | Nét không thể lẫn |
|---|---|---|---|---|
| **G3** | 4 + tầng áp mái | Phẳng, **cõng 4 vỏ vòm bán nguyệt trắng (barrel vault)** | Ngà/kem, giật cấp lùi dần khi lên cao | **Silhouette đặc trưng nhất campus.** Thêm: **tấm gạch bông gió trắng đục lỗ tròn**, **lan can vây tam giác zig-zag**, **ô văng công-xôn sâu**, cửa băng khung xanh đậm có hoa sắt, **ống khói/stack ốp gạch đỏ** ở đầu phải. Trước mặt: bể tròn nông, đáy sơn xanh nhạt, tượng **người nữ đứng giơ đuốc trên bệ cánh sen hồng** |
| **G7** | 4–5 | Phẳng | Trắng/kem | **Góc là một trụ tròn (drum) cao suốt toà**: ban công mỗi tầng vòng quanh drum thành **tấm sàn trắng cong có tay nắm thép mảnh**, nên mặt đứng đọc như **một chồng vành trắng**. Cửa khung xanh, biển "G7" xanh trên drum. Che bởi sứ và một cây lá kim. Lối đi bên cạnh **phủ hoa giấy vào hè** [P] |
| **G8** | **2** | **Ngói đất nung đỏ, dốc, mái đua** | Trắng | **Hiên cột trắng hai tầng**, cột vuông trơn, lan can đơn giản, **cửa xanh lục-lam (teal)**. **Đài phun cá heo** ngay forecourt. Một **vòng cung thép sơn đỏ** thấp qua lối đi ở mid-ground |
| **G1** | 5 trên tầng trệt để thông | Phẳng + giàn lam trên tầng mái | **Nửa mặt là trường panel đỏ gạch đậm** có lưới cửa sổ vuông nhỏ khung xanh (~8 nhịp × 4 tầng), **nửa kia trắng/kem có kính băng khung tối** | **Trụ thang/thang máy trắng trơn nhô cao hơn mái** đúng chỗ hai nửa gặp nhau; **dải chữ xanh ngang tầng 2**; dải ngang trắng thể hiện cốt sàn. Dưới hiên có một **bia đá nguyên khối sẫm, cao ~2–2,5 m** |
| **G2** | 6 (5 trên tầng trệt để thông) | Phẳng, có kết cấu lan can sơn đỏ nhỏ | **Vàng đất ochre + dải ngang trắng** | Mặt dài là **hành lang hở sau lan can trắng liên tục** nên đọc thành nhịp bóng đen/trắng; **đầu hồi hẹp sơn đỏ/đất nung có lưới cửa sổ vuông nhỏ**. Đứng trên sườn ngay trên vịnh |
| **Thư viện** (TV1–TV3) | ≥2 (chỉ biết nội thất) | **Chưa biết (§3)** | Trắng | **Phòng đọc tròn hai tầng thông tầng**, lan can cung trắng + tay nắm thép, **mezzanine hình vành**, **cột tròn trắng**, dải cửa sổ chữ nhật cao **kính/mành xanh ngọc**, sàn **gạch xanh bạc hà**, quạt trần treo, carrel có vỏ che xám cong. 3 toà, **5 015 m²**, **7 phòng đọc, 1 000 chỗ**, 2 kho [N] |
| **Ký túc xá (K)** | 4 | Phẳng + lan can trơn | Trắng tới xám-xanh nhạt | Nhịp **trụ đứng trắng suốt tầng – ban công có tay nắm ngang – cứ cách một nhịp lại là tấm gạch bông gió trắng đục**, nên mặt đứng sọc sáng/tối rất mạnh. **Tầng trệt là hiên hở** với **cửa xanh và cửa sổ hoa sắt xanh**. 8 toà, **hơn 400 phòng khép kín, ~4 000 chỗ**; phòng 1–2, 8–10 và 12 người; bảo vệ + y tế 24/24 [N] |
| **Nhà Thi Đấu** | 1 khối cao | **Vì kèo không gian thép trắng/xám khẩu độ lớn** | Trắng trên, **dado xanh nhạt** dưới | Dải cửa sổ clerestory cao, đèn LED công nghiệp treo, **khán đài nâng dọc một cạnh dài sau lan can kín**, sàn futsal **xanh + đỏ**. 800 chỗ, 1 sân bóng mini + 2 sân bóng chuyền/rổ, mở cho sinh viên mọi lúc [N][A] |
| **Sân ceremonial** | — | — | **Gạch block đất nung đỏ, xen bàn cờ với tấm sáng hơn** | Một bên là **khối trắng 3 tầng có cửa sổ hẹp cao xanh chói** và bảng khẩu hiệu "HIỀN TÀI LÀ NGUYÊN KHÍ QUỐC GIA" trên ô văng lối vào; bên kia là **dãy hiên/cloister thấp mái ngói đất nung sâu trên cột vuông trơn** — mảng vải xưa nhất trong mọi ảnh đã xem. Đây là **tâm cảm xúc** mà cựu sinh viên nhận ra (nơi quay lễ 60 năm, 26/03/2019) [A] |

**Bộ kit "G-block" dùng lại được:** một hộp 4–6 tầng, mái phẳng, **mặt dài = hành lang hở** (mặt
phẳng lùi + dải sàn trắng ngang + tay nắm mảnh), **mặt ngắn = mảng đặc màu đỏ gạch hoặc ochre** có
lưới cửa sổ vuông nhỏ, khung cửa xanh suốt, một trụ thang trắng trơn nhô lên. Biến thể: G3 thêm
4 vòm nóc, G7 thêm drum tròn, G8 là hộp 2 tầng mái ngói đỏ có hiên cột.

**Niên đại và phong cách.** Campus **không** phải Pháp thuộc và **không** phải kiểu Xô-viết. Lõi cũ
là **nhiệt đới hiện đại muộn Nam Việt Nam thập niên 1960–70** (gạch bông gió, lan can vây zig-zag,
ô văng brise-soleil sâu, vòm nóc, khối 2 tầng mái ngói có hiên cột), phủ lên bởi lớp **bê tông và
kính thập niên 2000–2010** (G1, G5, G7) và **nhà thi đấu kết cấu thép thập niên 2010**. **Màu mái
trên campus là bimodal:** toà cũ/thấp **ngói đất nung đỏ**, toà trung kỳ **tôn dốc xanh/teal**,
toà mới cao **mái phẳng bê tông** — cả ba cùng xuất hiện trong một khung không ảnh [A].

### 2.5 Đài phun cá heo và tượng đài NTU

- **Đài phun cá heo — xác nhận.** Trong forecourt trước **G8**: **bể tròn lớn viền lan can ống/hàng
  rào trắng thấp**, sân lát quanh, tia nước bắn cao, và ở tâm là **nhóm điêu khắc kim loại sẫm
  (đồng hoặc sơn đen) gồm nhiều cá heo cách điệu vươn lên khỏi mặt nước, đuôi chúc xuống, xếp
  thành một vòng/bó** [A]. Đây là **tượng di sản thuỷ sản tường minh duy nhất** tìm được, và là
  landmark low-poly tuyệt vời: vòng nước + vành lan can trắng + 4–6 hình cung.
- **Tượng người giơ đuốc trước G3:** bể tròn nông, đáy sơn **xanh nhạt**, vành bê tông thấp; tâm
  bể là **bệ cánh sen hồng/hoa hồng** đỡ một **hình người nữ trắng, đứng, một tay giơ đuốc**, dưới
  chân có hình đọc như cá hoặc cá heo [A]. Danh tính: §3.
- **Bia đá dưới hiên G1:** một **khối đá nguyên khối sẫm, thô, cao ~2–2,5 m** trên bệ nhỏ, cạnh một
  cây dừa cảnh, trên thềm cảnh quan dưới G1 [A]. Có thể là bia đá khánh thành 2012 (hồ sơ nội bộ
  NTU, liên quan tài trợ Na Uy) nhưng ảnh không có caption — §3.
- **Tượng đài NTU — chính là logo dựng bằng bê tông.** Một ảnh bài viết chính thức của trường cho
  thấy **một nhóm khối chữ nhật trắng/kem xếp chồng, giật cao thấp, đánh vần N T U, trên đỉnh là
  một ngôi sao năm cánh đỏ**, đặt trên bãi cỏ trên vịnh, cạnh lan can trắng mép thềm [A]. Đây là
  **asset nhận diện mạnh nhất của NTU**: huy hiệu 2D và tượng 3D là cùng một hình.
- **Không tìm được** neo, cột buồm, mô hình tàu hay hải đăng trong bất kỳ ảnh hay nguồn chữ nào.

### 2.6 Bảng màu

Ba độ tin cậy, **ghi rõ ngay trong bảng**. Chỉ nhóm A dùng được như giá trị; nhóm B chỉ dùng để
biết "sắc gì"; nhóm C là đề xuất của tài liệu này.

**A. Lấy mẫu pixel từ file chính thức — đáng tin.**

| Vật liệu / vai trò | Hex | Nguồn, số pixel |
|---|---|---|
| Logo — xanh trời (5 thanh bậc) | **`#48B4E7`** | PNG logo chính thức 200×200, 4 890 px đặc |
| Logo — indigo (vành, "NTU", wordmark, "1959") | **`#4A489D`** | cùng file, 3 349 px |
| Logo — đỏ (ngôi sao) | **`#EC2028`** | cùng file, 84 px. **Chỉ là điểm nhấn spot**; dùng thành mảng lớn là lệch thương hiệu |
| Logo — nền | `#FFFFFF` | cùng file, 19 010 px. Tỷ lệ huy hiệu ≈ 60 % trắng : 25 % xanh : 17 % indigo : <0,5 % đỏ |
| Ấn phẩm — royal blue | `#0048A8` | bìa "Cẩm nang ngành nghề 2024/2025", bucket 3 962 px |
| Ấn phẩm — navy sâu | `#003172` | cùng bìa |
| Ấn phẩm — cam thương hiệu | `#F8A818` | cùng bìa, bucket 3 390 px |
| Ấn phẩm — cam đậm | `#F89800` | cùng bìa, bucket 1 938 px |
| Ấn phẩm — cyan | `#00A8D8` | cùng bìa, dùng cho biển/điểm nhấn nhỏ |
| CSS trường — cam hổ phách | `#FDA72D` | `ntu.edu.vn/Portals/6/portal.css`, `.our-partners` |
| CSS trường — xanh khối | `#1E88C3` + `darkorange` (`#FF8C00`) | `custom.css`, `.help-decor-back` — do NTU tự viết |
| CSS trường — navy, CTA blue | `#081B3A`, `#005BB1` | markup `ntu.edu.vn` / `tuyensinh.ntu.edu.vn` |

**Tuyệt đối không dùng** (không phải màu NTU): `#00A5E0`, `#ED3D46`, `#0E2936`, `#472A2B` là mặc
định nền tảng DotNetNuke; `#FF5A5F`, `#FF1053`, `#006C70`, `#BCC52A`, `#484848` là mặc định
template Xcillion.

**B. Mẫu single-pixel từ JPEG nén dưới nắng gắt — chỉ đọc được "sắc gì", không dùng làm giá trị.**

| Bề mặt | Mẫu thô | Đọc an toàn |
|---|---|---|
| Panel đỏ gạch G1 (trong bóng) | `#684849` | "đỏ gạch sẫm" |
| Dải kem G1 (có nắng) | `#c7c9c6` | "trắng ngà ấm" — mẫu bị nắng rửa, **phải hiệu chỉnh ấm lên** |
| Mái ngói G8 (có nắng) | `#d49b8a` | "đất nung ấm" |
| Tường G8 | `#d0d0d0` | "trắng" |

Bốn giá trị duy nhất an toàn rút ra từ toàn bộ ảnh: **mái ngói ≈ đỏ-cam ấm**, **tường ≈ trắng
ngà/kem ấm**, **mảng nhấn ≈ vàng ochre hoặc đỏ gạch**, **khung cửa ≈ xanh trung bão hoà**.

**C. Chưa có nguồn — đây là ĐỀ XUẤT của tài liệu này, không phải dữ liệu.** Không một nguồn nào
công bố hex cho nước vịnh Nha Trang, trời, cát, đất hay tán lá; cũng không có ảnh nào được sample
trong đợt này. Mọi hàng dưới đây là **ước lượng**, ràng buộc bởi hai dữ kiện đã có nguồn:
(1) **mặt trời đứng 77–89° suốt sáu tháng** nên màu nước bị chi phối bởi ánh sáng đi xuống — nước
phải là **gradient độ sâu/độ đục**, không phải albedo phẳng; (2) **độ ẩm trung bình ~79 %** nên
**aerial perspective mạnh quanh năm**: Hòn Tre và dãy Cô Tiên phải **bạc màu rõ về phía chân trời**
cả trong ngày khô trong.

| Vật liệu | Đề xuất | Căn cứ |
|---|---|---|
| Cỏ mùa khô (Jan–Aug) | `#a9b878` | **ước lượng.** Mùa khô 8 tháng, tháng 2 chỉ ~16 mm mưa ⇒ cỏ không tưới chuyển rơm/ochre |
| Cỏ mùa mưa (Sep–Dec) | `#7da55c` | **ước lượng.** Sep–Dec ~300–380 mm/tháng ⇒ xanh đậm no nước |
| Tán lá (phần sáng / phần tối) | `#5c8c4a` / `#3c5f36` | **ước lượng** |
| Thân cây | `#6f5a3e`; **gốc xà cừ thường quét vôi trắng** | **ước lượng**; chi tiết quét vôi là tập quán cây xanh đô thị VN, không phải nguồn NTU |
| Đất đồi | pha **granit/cát nhạt**, **không** đỏ laterit | **suy luận có nguồn một phần:** nền đá granit ở Hòn Chồng ⇒ **đừng mặc định bảng đất đỏ** kiểu Tây Nguyên. Màu cụ thể: chưa biết |
| Nước vịnh (cạn → sâu) | `#4fb6c4` → `#1d6c9c` | **ước lượng.** Bắt buộc là gradient, xem trên |
| Trời ban ngày (mùa khô) | `#bcd9ef` | **ước lượng** |
| Bê tông / lối đi | `#d8d2c6` | **ước lượng** |
| Sân ceremonial, gạch đất nung | `#b9775f`, xen tấm sáng `#d6cbbb` | **ước lượng, suy từ mô tả ảnh** (gạch đỏ xen bàn cờ tấm sáng) |
| Đá granit bờ biển | `#8e8b85` | **ước lượng** |
| Rêu xanh trên đá (theo mùa) | `#4f7a45` | **ước lượng**; hiện tượng "bãi rêu tóc xanh" dọc Trần Phú có nguồn, màu thì không |

### 2.7 Cây và thảm thực vật

Đây là hạng mục **được tài liệu hoá tốt nhất** của campus, nhờ một phóng sự 2024 nêu tên loài [P].

- **Dọc các đường chính:** **xà cừ** (*Khaya senegalensis*), **me tây**, **bàng**
  (*Terminalia catappa*) — xác nhận tên loài.
- **Tầng hoa:** **phượng** (đỏ, *Delonix regia*), **bằng lăng** (tím,
  *Lagerstroemia speciosa*), **liễu**, **muồng hoàng yến** (vàng), **hoa giấy** (phủ lối đi cạnh
  **giảng đường G7** vào hè), **"tuyết sơn phi hồng"** (tím — không phải tên thực vật chuẩn, §3),
  **hoa sen** trong một sân/ao trên campus.
- **Quy mô:** campus **hơn 20 ha, hơn một nửa là không gian xanh**, **~10 m² xanh / người**,
  **~1 000 cây trồng mới mỗi năm**, truyền thống **Tết trồng cây**, và **hàng trăm cây trên nửa thế
  kỷ**. Giảng đường, thư viện, ký túc xá "ngồi giữa các cây lớn"; sinh viên dùng cây làm điểm hẹn
  và chỗ học ngoài trời [P][N].
- **Bộ kit tán 4 archetype là đủ phủ cảnh:** (1) **tán dù rộng dẹt** — me tây; (2) **vòm cao sẫm,
  hơi bất quy tắc, gốc to** — xà cừ; (3) **tầng ngang kiểu tháp** — bàng; (4) một loại **cọ/dừa
  cảnh** (thấy trong ảnh G1, G3).
- **Bàng là loài duy nhất cho màu lá theo mùa** trong khí hậu này: đỏ rồi rụng vào tháng khô, bật
  **xanh-vàng tươi ("bàng nõn")** khi ra lá lại — một tín hiệu mùa rất rẻ và rất dễ đọc.
- **Lá chét me tây gập lại lúc chiều muộn và khi mưa** — một nhịp animation miễn phí và xác thực
  cho preset dusk và mùa mưa.
- **Phi lao và dừa thuộc dải bờ biển/thành phố, KHÔNG thuộc campus.** Nguồn đặt phi lao
  (casuarina) là **cây đường phố/bãi biển đặc trưng Nha Trang**, được công ty cây xanh tỉa thành
  tán nghệ thuật; **nho biển** (*Coccoloba uvifera*) là hàng rào ven biển. Không nguồn nào nêu
  phi lao hay dừa **trong** campus [P]. Đặt chúng ở dải bờ, không trên đồi.
- Bối cảnh thành phố: **cây xanh công viên Nha Trang chỉ 0,56 m²/người (2018)** và **bão số 12
  (Damrey, 4/11/2017) quật đổ phần lớn cây đường phố** [P]. Campus NTU vì thế là **một hòn đảo
  xanh thật sự** trên một thành phố gần như toàn mặt cứng — một tương phản nên dựng được thấy.

### 2.8 Biển, đảo và chân trời

- Campus nằm **trên chính mũi đất**: đường bờ OSM (way 1198403325) chạy cách **mép nam/đông nam
  campus ~20–25 m**, cách các toà phía đông 150–230 m [O].
- Khoảng cách tới bờ (tới **node đã vẽ** gần nhất, nên là chặn trên): HT-1 ~128 m, K6 ~148 m,
  A1 ~206 m, G2 ~209 m, sân bóng ~255 m, **cổng chính ~354 m** [O].
- **Hai làn Phạm Văn Đồng chạy giữa campus và bờ phía đông** [O] — có một dải đường chen vào, không
  phải đồi đổ trực tiếp xuống nước.
- **Hòn Đỏ** (coastline way 265148348) là đảo nhỏ/đá ngoài khơi, **cách mép đông campus ~250–320 m**
  — vật mốc hiển nhiên cho mọi tầm nhìn hướng đông, phải có trong background [O].
- **Hòn Chồng và Hòn Vợ nằm ngay chân đồi La San** — campus và chúng là **cùng một mũi đất**, Hòn Vợ
  ở chân đông. Đó là **các cụm đá granit xếp lớp bất quy tắc**, bờ ở đây **đá và thô, không phải
  bãi tắm**; bãi cát nằm ngay **phía bắc** mũi [P].
- **Chân trời, từ bắc sang nam:** dãy **Cô Tiên** (B/TB) → các cụm đá granit Hòn Chồng/Hòn Vợ ngay
  dưới và về đông → **vịnh Nha Trang mở** với **Hòn Tre chiếm chân trời đông nam** → thành phố và
  dải Trần Phú về nam [P]. Vịnh **bị núi vây ba mặt**, có **một đảo lớn và bốn đảo nhỏ** [P].
- **Tầm nhìn biển có nguồn xác nhận**, dù không nguồn nào nêu *toà nào*: "Từ sân trường có thể
  chiêm ngưỡng được vẻ đẹp của cả vịnh Nha Trang" [P]; hồ sơ tuyển sinh nói campus "trên đất đồi,
  **hai mặt giáp biển**"; AR2025 nói campus "trên ngọn đồi Lasan phía Đông Bắc thành phố biển Nha
  Trang, với 2 mặt giáp biển" [N].
- **Suy luận hình học (không phải dữ kiện):** người đứng ở tầng nam cao 29–30 m, cách nước
  130–200 m, nhìn xuống góc chúc ~9–13° ⇒ tầm nhìn biển không bị chắn **về nguyên tắc**. Thứ tự
  toà có lợi thế: **HT-1/HT-2/khu thí nghiệm → A1 → B3 → G3 → K6**, tất cả trên vành nam và đông
  nam ở 21–30 m. **Cụm bắc (TV1–3, K1–K5/K8, canteen) nằm 350 m trong đất liền và SAU đỉnh đồi**,
  nên từ mặt đất ở đó vương miện che nước; chỉ tầng cao mới thấy biển.

### 2.9 Nhận diện và chữ nghĩa

- **Huy hiệu — xác nhận từng phần tử.** Một **badge tròn**: vành mảnh indigo khép quanh nền trắng;
  bên trong là **khối năm thanh "skyline bậc" xanh trời** đối xứng (ngắn – vừa – **cao (giữa)** –
  vừa – ngắn; thanh giữa hẹp và cao hơn rõ); một **ngôi sao năm cánh đỏ nhỏ bay tự do ngay trên
  thanh giữa, không chạm thanh**; chữ **"NTU"** lớn nét viền indigo nằm đè nửa dưới các thanh (các
  thanh lọt qua counter của chữ); dưới đó là **"ĐẠI HỌC NHA TRANG"**, rồi **"1959"** riêng một
  dòng. **Không có cá, tàu, neo, sách hay sóng** — di sản thuỷ sản được mang bởi *lịch sử tên gọi*
  và *khẩu hiệu*, không bởi hình. Năm thanh cố tình đa nghĩa: skyline / cánh buồm / đỉnh sóng.
- **Tượng đài trên campus chính là logo dựng bằng bê tông** (§2.5) — asset nhận diện 3D mạnh nhất
  có thể đặt vào cảnh.
- **Màu:** xem §2.6 nhóm A. Hệ huy hiệu là **hai xanh + một đỏ nhấn**; hệ ấn phẩm mở rộng thành
  **royal blue + navy + cam**.
- **Không có bộ nhận diện thương hiệu công bố.** Không Pantone, không CMYK, không file vector,
  không quy tắc clearspace hay cỡ tối thiểu. Hai mẫu banner chính thức **không nhất quán với nhau**
  (bìa tuyển sinh: cam + royal blue trên trắng; banner sứ mệnh: đỏ + cam trên trắng). **Theme game
  nên chọn một và kỷ luật hơn chính nguồn.** Hai lockup đang dùng song song: badge tròn (ngữ cảnh
  vuông) và **thanh ngang badge + wordmark 394×68** (header web) — theme nên ship cả hai.
- **Chữ:** web chính thức dùng **Tahoma** (khai báo 250 lần), `Tahoma SemiBold` (20), Open Sans
  (59), **không nạp webfont nào**. Ấn phẩm in dùng một **sans hình học/grotesque nặng, chữ hoa,
  tracking chặt**, có đủ dấu Việt — **không nhận diện được họ chữ từ raster 500 px** (§3). Đề xuất
  cho theme: **grotesque kiểu Tahoma/Verdana cho UI chrome**, **sans hình học nặng chữ hoa cho
  display**, cả hai phải đủ dấu tiếng Việt.
- **Khẩu hiệu và triết lý — xác nhận:**
  - **Triết lý giáo dục: "Khai phóng – Dụng hành – Phụng sự."** (Wikipedia + banner chính thức của
    trường, hai nguồn độc lập.)
  - **Giá trị cốt lõi: "Tiên phong – Đoàn kết – Hội nhập – Năng động – Trách nhiệm."** [N]
  - **Slogan 2019: "Căng buồm tri thức vươn khơi – Sail to wisdom."** Đây là **dòng dùng được nhất
    cho game**: nó cho phép cánh buồm, thuyền, chân trời, biển mở, dù huy hiệu không có. Chưa chắc
    còn hiệu lực (§3).
  - **Khẩu hiệu Hội Sinh viên:** "Sinh viên Trường Đại học Nha Trang năng động, sáng tạo, kỷ luật
    và thanh lịch." [N]
  - Bảng khẩu hiệu thật trên tường sân ceremonial: **"HIỀN TÀI LÀ NGUYÊN KHÍ QUỐC GIA"** [A].
- **Tên:** Vietnamese **"Trường Đại học Nha Trang"**; English **"Nha Trang University"**, viết
  **"NHA TRANG UNIVERSITY"** chữ hoa ở masthead; viết tắt **NTU** và **ĐHNT** đều chính thức.
  **Thành lập 01/8/1959** là năm trong logo.
- **Ngày truyền thống 1/8**, tính từ 1959: 1/8/2019 = 60 năm, 1/8/2024 = 65 năm, 2025 = "NTU 66
  năm". Lễ kỷ niệm và Ngày Nhà giáo 20/11 tổ chức ở **nhà thi đấu** [N].
- **Từ vựng sinh viên dùng (xác nhận từ nguồn trường):** `trường` (cả trường), `giảng đường`
  (G1–G8; nói thẳng "G5", "G7"), `hội trường` (HT1, HT2, Hội trường số 3), `thư viện` (TV2–TV4),
  `phòng đọc`, `phòng tự học`, `ký túc xá`/`KTX` (K1–K8), `căng tin`, `bếp ăn`, `nhà thi đấu`,
  `sân bóng`, `sân vận động`, `khu hiệu bộ`, `tòa nhà đa năng`, `cổng chính`, `bãi biển`,
  `phòng thí nghiệm`, `phòng thực hành`, `phòng mô phỏng`, `Bảo tàng Thủy sinh vật`,
  `phòng bảo tàng ngư cụ`. Khoá tính từ 1959: **khoá 2025 là K67**, 2026 là **K68** [N].
- **Ai làm gì, cho hội thoại NPC:** đăng ký/chương trình → **Phòng Đào tạo**; lịch thi, phúc khảo →
  **Phòng Quản lý chất lượng** (sinh viên trước 2026 sẽ gọi là *Phòng Khảo thí* / *ĐBCL&KT*); học
  bổng, điểm rèn luyện, thẻ sinh viên, đơn KTX → **Phòng Công tác sinh viên**; học phí → **Phòng
  Tài chính**; dịch vụ căng tin/KTX → **Trung tâm Dịch vụ**. **Bảo vệ** có nguồn xác nhận tại chỗ
  ("bảo vệ và y tế được bố trí 24/24 tại các tòa nhà" của KTX) [N].

## 3. Chưa chắc

Mục này **dài có chủ đích**. Tài liệu được viết sau một đợt nghiên cứu mà các researcher đã nói rất
rõ cái gì họ *không* lấy được nguồn. **Đừng lấp các lỗ này bằng tưởng tượng rồi để tài liệu sau đọc
như dữ kiện.**

**Lỗ lớn nhất: màu.**

- **Không một hex nào được lấy mẫu từ ảnh biển, trời, cát hay tán lá Nha Trang.** Không ảnh nào
  được tải để sample trong đợt này, và không nguồn nào công bố bảng màu hay swatch set cho Nha
  Trang. Mọi màu thiên nhiên trong §2.6-C và §4 là **ước lượng**. **Cách giải quyết là máy móc,
  không phải văn học:** chọn 6–10 ảnh Creative Commons của (a) vịnh Nha Trang nhìn từ Hòn Chồng,
  (b) cát bãi Trần Phú, (c) tán cây campus NTU trên Wikimedia Commons, sample bằng script, và ghi
  **từng hex kèm URL ảnh và vùng pixel**. Việc 15 phút, chưa làm.
- **Màu đất và màu cỏ trên đồi La San: chưa biết.** Cần bản đồ địa chất Khánh Hoà hoặc ảnh tại chỗ.
  Dữ kiện có nguồn duy nhất giúp loại trừ: **nền granit ở Hòn Chồng** ⇒ nghiêng về đất granit/cát
  nhạt, **không** phải đỏ laterit. Nhưng đây là loại trừ, không phải giá trị.
- **Màu bê tông, nhựa đường, vật liệu lối đi campus, và cỏ khô-vs-ướt: không nguồn nào.**
- **Màu vỏ thuyền đánh cá và thúng chai: không nguồn nào.** Đội thuyền gỗ và thúng chai là phần tử
  Nha Trang rất đặc trưng và nên có trong cảnh như set dressing tầm trung, nhưng **đừng ghi bảng
  màu vỏ xanh/viền đỏ-vàng như là có nguồn** — nó không có.
- **Màu đồng phục sinh viên, áo lễ và dây tốt nghiệp, áo thi đấu, và biển hiệu campus: hoàn toàn
  không nguồn.** Thông tư 26/2009/TT-BGDĐT **không quy định** màu, chất liệu hay kiểu — mỗi trường
  tự chọn, và NTU không công bố gì. **Mọi màu áo lễ trong theme phải coi là phịa**, hoặc lấy từ
  album ảnh tốt nghiệp Facebook chính thức của trường (chưa fetch).
- **Màu theo khoa/trường thành viên: không có bằng chứng nào là chúng tồn tại.** Không trang NTU
  nào, không file CSS nào có hệ màu theo khoa. Nghiêng mạnh về **không tồn tại**.
- **Sáu màu mã hoá trên bản đồ [M]** (vàng = KTX, tím = giảng đường, nâu đỏ = hành chính, hồng sen
  = hội trường, lục đậm = thể thao, cyan) là một **quy ước wayfinding trên một artefact bản đồ cụ
  thể**, không phải phần của hệ thương hiệu. Dùng được như legend loại công trình, và **không** mâu
  thuẫn với `#48B4E7`/`#4A489D`. Nhưng **phải sample hex từ chính ảnh bản đồ**, không đoán, và ghi
  trong theme file là *map-derived* kèm ảnh nguồn commit bên cạnh.

**Cổng chính — lỗ nghiêm trọng nhất về gameplay.**

- **Không có bằng chứng nào về hình dáng cổng chính.** Không ảnh, không Street View, không nguồn
  chữ. Trang "Chỉ đường đến NTU" không expose ảnh; album ảnh chính thức render bằng script nên
  scrape HTML không ra URL ảnh nào; tìm tiếng Việt không ra bài nào mô tả cổng. **Trụ hay dầm ngang
  hay vòm, vật liệu, màu, biển chữ: không có gì.** Đây là **thứ đầu tiên người chơi thấy**, nên
  đây là lỗ đắt nhất trong tài liệu. Hai đường ra: (a) lấy ảnh Google Street View/Maps trực tiếp,
  (b) dựng cổng và **ghi rõ trong manifest và trong art bible rằng nó là suy đoán**.
- **Node "Main Gate" có `access=no; bicycle=yes; foot=yes`** — tag của một cổng **đi bộ**, nghịch
  với cái tên "Main Gate". Có thể OSM chỉ vẽ cánh đi bộ của một cổng lớn hơn, hoặc xe vào bằng cổng
  khác. **Chưa giải quyết.** Nghiêng về cách đọc thứ nhất (OSM vẽ thiếu), vì [M] và SOTAY2019 đều
  ghi "Cổng chính" trên Nguyễn Đình Chiểu.
- **Khoảng lùi của cổng so với Nguyễn Đình Chiểu:** nội suy tuyến đường đặt mặt phố ~100–120 m
  **phía bắc** node cổng, tức có một đường dẫn vào thật sự. Hợp lý nhưng **chưa xác nhận bằng ảnh**.
- **Có đài phun trên trục vào hay không.** `amenity=fountain` có trên campus nhưng **không lấy được
  toạ độ**. Nghiêng về: nó **chính là đài phun cá heo** ở forecourt G8, (+62, −6) — ngay cạnh trục
  vào, 62 m trong cổng. Nếu đúng thì câu "đài phun trên trục" vừa đúng vừa không: nó ở cạnh trục,
  không ở cuối trục, và nó không mở ra một quảng trường đối xứng.

**Mã công trình và tên toà.**

- **"A-2" (bản đồ [M]) vs "Tòa nhà A1 (Khu hành chính)" (OSM).** OSM không có A2 ở đâu cả; nó chỉ
  có **A1, A3, A8, A9, B3**, và **không có A4–A7, X-1, X-3**. **Nghiêng về A1** là dải thanh hành
  chính 90 × 18 m: tên OSM tường minh và hiện hành, phòng hiệu trưởng được AR2025 đặt ở **"Tòa nhà
  A1"**, còn "A-2" đến từ **bản đồ tiếng Anh trước 2019** — gần như chắc là một thế hệ mã khác.
  Hai khả năng còn lại chưa loại được: hai mã chỉ **hai cánh của cùng một tổ hợp mái đỏ**, hoặc
  bản đồ đánh số theo *khu* còn OSM theo *toà*.
- **"Nhà Đa Năng" — giải quyết được một nửa.** Một đợt nghiên cứu không tìm được trang nào trên
  `ntu.edu.vn` nói về "nhà đa năng" (site search trả "Chưa có nội dung nào"), nhưng (a) chú giải
  bản đồ [M] và SOTAY2019 **có** nhãn **"Tòa nhà đa năng"**, và (b) **tên OSM của way 231993747 là
  "Trường Kinh tế và Kinh Doanh – Nhà Đa Năng"**, ở (−106, −151) trên vành tây nam.
  **Nghiêng mạnh: Nhà Đa Năng = khối Kinh tế & Kinh doanh ở tây nam.** Đây là một đối chiếu mà
  không đợt nghiên cứu lẻ nào làm được.
- **Nhà Đa Năng có thật 12 tầng?** `building:levels=12` là **một tag OSM duy nhất, không có
  `height`, không nguồn nào xác nhận độc lập**. Nếu đúng, nó là **~40–44 m và là kết cấu cao nhất
  campus** cùng **điểm nhìn tốt nhất** (nhìn cả vịnh nam và sông Cái/thành phố về tây). Nếu sai,
  campus **không có toà cao nào cả**. **Đừng cho nó vai trò silhouette trước khi kiểm.** Đây là
  biến quan trọng nhất còn mở trong hình khối tổng thể.
- **Không toà nào trên campus có tag `height` trong OSM**, và `building:levels` chỉ có ở 6 trong 54
  toà. **Số tầng của A1, các giảng đường G, các ký túc xá K, thư viện và nhà thi đấu đều là ước
  lượng typology + diện tích sàn**, không phải dữ kiện: A1 **3–4 tầng (tin thấp)**, G1–G8 **~3 tầng
  trung bình (tin trung bình cho số trung bình, thấp cho từng toà)**, K1–K8 **4–5 (tin trung
  bình)**, TV1–3 **3–4 (tin thấp)**, nhà thi đấu **một khối cao 10–14 m tới đỉnh (từ typology)**.
  Chỉ **canteen 4 tầng** là xác nhận.
- **Toạ độ và footprint của G5 chưa lấy được** — way OSM của nó không có trong tập đã truy. Chỉ
  biết nó ở tầng nam (y = −120…−204) và chạy song song đường biển. Đây là **landmark**, nên là lỗ
  đáng vá đầu tiên bằng một lượt Overpass nữa.
- **Số giảng đường và diện tích: 8 vs 9 khối; 15 000 vs 28 000 m²; 120 vs 95 phòng học.** Trang
  tiếng Anh chính thức: 8 khối / 120 phòng / 15 000 m² / 6 000 chỗ. Hồ sơ tuyển sinh tiếng Việt:
  **9 khu giảng đường, gần 28 000 m²**. Wikipedia (vi) và AR2025: **95 phòng học** (2025). Nghiêng
  về: 15 000 m² là **diện tích phòng học thuần**, 28 000 m² là **sàn gộp** — nhưng đó là **phỏng
  đoán**. Với số phòng, **ưu tiên số của trường (120)** và ghi chú vênh.
- **Số ký túc xá: 8 (SOTAY2019, [M]) vs 9 way OSM (K1–K8 + "K9 (cũ)") vs 10 (trang tiếng Anh).**
  Nghiêng về **8 toà đang dùng + 1 toà cũ**, tức OSM đúng và "10" gộp thêm gì đó.
- **Thư viện: [M] ghi TV2–TV4, OSM ghi Thư viện 1/2/3.** Ba toà thì khớp; **đánh số thì không**.
  Chưa giải quyết. Cũng chưa biết cả ba toà TV còn dùng làm thư viện hay không.
- **Mặt ngoài thư viện: chưa biết gì.** Chỉ có ảnh nội thất. Số tầng, hình mái, màu ngoài: không
  nguồn. **Phòng đọc tròn trong ảnh làm cho "cánh đầu drum" rất có khả năng đúng**, nhưng đó là
  suy luận từ nội thất ra ngoại thất.

**Lịch sử, tổ chức, nhãn.**

- **Ngày tái cơ cấu: 12/12/2025 (AR2025, NQ 35/36/37-NQ-ĐHNT) vs "tháng 2/2026" (Wikipedia vi).**
  **Nghiêng mạnh về 12/12/2025**: AR2025 là nguồn của chính trường và dẫn số nghị quyết.
- **Ngày trong lịch sử vênh ba chỗ:** di chuyển về Nha Trang "1976" (AR2025) vs **04/10/1976**
  (SOTAY2019); đổi tên Thuỷ sản "1980" vs **12/08/1981**; đổi tên Nha Trang **25/7/2006** (số
  QĐ 172/2006/QĐ-TTg) vs **02/10/2006**. **Copy an toàn cho game:** dẫn **Quyết định số
  172/2006/QĐ-TTg** và **năm 2006**, cùng **1959 / 1966 / 1976** cho phần còn lại.
- **Diện tích campus có bốn con số:** 23,4 ha (hồ sơ tuyển sinh), 20 ha (trang tiếng Anh),
  "hơn 20 ha" (báo), **17,27 ha** (AR2025, 172 707 m² đất cơ sở chính). Nghiêng về **~20 ha cho tỷ
  lệ cảnh**, và ghi rằng con số 23,4 ha nằm trong bbox 27,44 ha (tỷ lệ lấp 85 %, hợp với polygon
  bị ba con phố vạt góc).
- **Phường hiện tại:** nguồn vênh giữa Vĩnh Thọ, Vĩnh Phước và **"Bắc Nha Trang"** sau sáp nhập
  2025. **Nghiêng về Bắc Nha Trang** cho nhãn "bây giờ" (AR2025 và trang thư viện đều ghi vậy), và
  lưu ý **Nha Trang không còn là thành phố từ 01/7/2025** — nó là một trong 65 phường/xã của tỉnh
  Khánh Hoà. Nhãn trên màn hình nên cẩn thận chỗ này.
- **"Trường La San Bá Ninh từng ở đây" — SAI, premise cần sửa.** Bá Ninh là một **trường khác ở
  trung tâm** (số 26 Duy Tân, cổng chính ra Nguyễn Tri Phương, lập 30/7/1954, kiến trúc sư
  J. Masson). Thứ ở trên đồi là **tu viện/đệ tử viện La San** (xây 1932–33). Năm **1978** các
  Sư huynh còn lại bị buộc di dời xuống chân đồi. **Copy đúng cho game:** campus đứng trên **đồi
  La San**, đặt tên theo các Sư huynh La San (De La Salle) đã xây trên đó từ 1932–33 và bị chuyển
  khỏi đỉnh đồi năm 1978. **Đừng viết "trường Bá Ninh thành trường đại học".**
- **Không nguồn nào ghi "trường tiếp nhận các toà nhà trên đỉnh đồi La San".** Việc trường đến năm
  1976 và các Sư huynh bị chuyển đi năm 1978 là **nhất quán nhưng không được tài liệu hoá** như một
  cuộc giao nhận. **Toà nào, nếu có, còn sót từ thời La San: chưa xác nhận.** Ứng viên hợp lý nhất
  là **dãy hiên mái ngói** cạnh sân ceremonial — mảng vải trông xưa nhất trong mọi ảnh.
- **Trung tâm Nghiên cứu Giống và Dịch bệnh Thuỷ sản (A-7 trên bản đồ)** có trong sơ đồ 2019 nhưng
  **không có trong AR2025** — trạng thái chưa rõ.
- **Không có bản đồ campus chính thức sau 2019 với mã khối**, nên **không xác minh được trường
  thành viên mới nào chiếm khối nào**.

**Văn hoá, con người, chi tiết sống.**

- **Linh vật (mascot): không nguồn nào. Giả định là KHÔNG có.** Hai lượt tìm có chủ đích không ra gì.
- **Bài hát truyền thống: không nguồn nào nêu. Giả định là chưa xác nhận.** Sách kỷ niệm 65 năm
  (`65N-NTU-1959 - 2024.pdf`, >8 MB) rất có thể trả lời cả hai câu này nhưng vượt giới hạn fetch.
- **Cựu sinh viên nổi tiếng có tên: không tìm được một ai.** Tìm tiếng Việt "cựu sinh viên nổi
  tiếng" không ra danh sách. Người có tên tầm quốc gia rõ nhất là **Nguyễn Tấn Trịnh**, hiệu trưởng
  1975–1978, sau là bộ trưởng thuỷ sản — nhưng liên hệ được ghi là **hiệu trưởng, không phải cựu
  sinh viên**. **Đừng đoán.**
- **Tiếng lóng sinh viên gọi các toà nhà: không tìm được gì.** Đây là **lỗ lớn nhất cho flavour
  text xác thực** và cần một người thật hoặc nhóm sinh viên NTU.
- **Căng tin ăn gì: không nguồn nào.** Không tài liệu chính thức, không tin, không review nào mô tả
  menu hay giá. **Đừng phịa món.** Nếu game cần, dùng mâm cơm sinh viên VN chung (cơm phần/cơm
  sườn, mì, bún, nước mía) và **ghi rõ là không nguồn**, hoặc hỏi sinh viên.
- **Chim, côn trùng, âm thanh môi trường: không nguồn nào, zero.** Không đưa loài nào vào brief âm
  thanh. Nguồn tiếp theo nên là eBird hotspot Hòn Chồng/Nha Trang và iNaturalist cho Vĩnh Thọ.
- **"Căng buồm tri thức vươn khơi – Sail to wisdom" còn hiệu lực không: chưa chắc.** Nguồn duy nhất
  là bản tin Q1/2019 tường thuật kết quả một cuộc thi; câu này **không xuất hiện** trên banner sứ
  mệnh 2025/26.
- **Giải thích biểu tượng của chính người thiết kế logo: không đọc được** — URL bài viết dựng tay
  trả HTTP 404. Bài có trên danh sách tin trang chủ; lượt sau nên click từ đó.
- **Họ chữ của ấn phẩm in: không nhận diện được** từ raster 500 px. Đọc gần nhất là một họ kiểu
  Montserrat/Open Sans ExtraBold — **ước lượng**.
- **Không có mạng xã hội nào được kiểm** (Facebook, YouTube, Zalo, TikTok), nên cách xử lý màu của
  cover và post template vẫn là câu hỏi mở.
- **Danh tính tượng người giơ đuốc trước G3 và nội dung khắc trên bia đá: chưa biết.** PDF nội bộ
  2012 "Lễ cắt băng khánh thành bia đá" có text stream nén, không đọc được thân bài.
- **"Tuyết sơn phi hồng" không phải tên thực vật chuẩn** và không giải được ra loài. Có thể là một
  cây cảnh kiểu *Tibouchina*/*Melastoma* tím — **chưa xác minh, đừng dựng như một loài có tên**.
- **"Me tây" nghĩa gì: hai nguồn vênh.** Dùng trong cây xanh đô thị thì thường là
  **Albizia saman (Samanea saman)** — tán dù 15–25 m cao, đường kính tán ~30 m; một nguồn dược
  liệu Việt lại xếp "Me Tây" vào **Pithecellobium dulce**. **Nghiêng về Albizia saman** vì chỉ nó
  khớp "tán dù tròn lớn" trên bản đồ. Không nguồn nào cho tháng hoa của me tây hay bằng lăng ở
  Khánh Hoà.
- **"Bãi biển" trên bản đồ [M] vs "bờ đá, không phải bãi tắm" của nguồn du lịch.** Nghiêng về:
  bờ ngay dưới campus là **đá granit**, bãi cát nằm **ngay phía bắc** mũi đất, và nhãn "Bãi biển"
  trên bản đồ đánh dấu **lối xuống bờ** chứ không phải một bãi tắm. **Chưa giải quyết**; cũng chưa
  rõ dải 20 m giữa ranh campus và nước ở điểm gần nhất là cát, đá, kè, hay chính làn Phạm Văn Đồng.
- **Hòn Đỏ (OSM, đông campus ~250–320 m) có phải Hòn Chồng/Hòn Vợ không.** Nghiêng về **không**:
  Hòn Đỏ là đảo nhỏ/đá **ngoài khơi đã vẽ trong OSM**, còn Hòn Chồng/Hòn Vợ là các **cụm đá ở bờ**
  dưới chân đồi. Cả hai đều nên có trong cảnh, ở hai lớp khác nhau.
- **Thấy được Po Nagar / cầu Trần Phú / cửa sông Cái từ campus hay không: không nguồn nào xác
  nhận.** Hình học đặt chúng **về tây/tây nam và hơi vào trong đất**, nên chúng sẽ ở **cạnh hoặc
  sau lưng**, không trên chân trời biển. Cần kiểm bằng ảnh hoặc line-of-sight trên bản đồ địa hình.
- **Toà nào có tầm nhìn biển: không nguồn nào.** Thứ tự ở §2.8 là **suy luận hình học của tài liệu
  này**, không phải dữ kiện.
- **Số giờ nắng/năm vênh:** 2 539 h (bảng khí hậu) vs **2 380 h** (Sở Du lịch Khánh Hoà) — hai trạm
  và hai kỳ khác nhau. **Không lấy được % mây theo tháng** (weatherspark trả HTTP 503). Các
  aggregator khí hậu vênh nặng về lượng mưa tháng; **ưu tiên bảng Wikipedia/NCHMF**, coi số của
  aggregator là không đáng tin.
- **Công trình mới 2020–2026: không xác nhận được cái nào.** Chỉ có **một khung bê tông trần đang
  thi công** trên skyline phía sau sân bóng, trong một ảnh **không ghi ngày**. Bản tin nội bộ
  hai tuần một kỳ và sách 65 năm là chỗ nên tìm tiếp.
- **Chiều rộng, mặt đường và số làn của mọi đường nội bộ: không tag nào** ngoài footway/steps
  (`width=2`). **Topology đường vòng và nhánh ngang được dựng lại từ centroid từng way, không phải
  trace** — ai cần centreline chính xác phải chạy lại Overpass với `out geom;`. Cũng chưa xác nhận
  đường vòng có liên tục hay bị thềm cắt.

## 4. Đề xuất cho game (chưa phải quyết định)

### 4.1 Skeleton manifest `ntu`

Dán vào `frontend/public/themes/ntu/manifest.json`. Schema theo đúng
`frontend/public/themes/vinuni/manifest.json`. **JSON phải hợp lệ nên không có comment trong
block**; mọi caveat nằm ở bảng ngay sau.

```json
{
  "id": "ntu",
  "name": "Khuôn viên đồi La San",
  "brand": {
    "programName": "AI 20K",
    "orgName": "Trường Đại học Nha Trang",
    "disclaimer": "Dự án học tập độc lập, lấy cảm hứng từ khuôn viên Trường Đại học Nha Trang. Không phải sản phẩm chính thức của Trường Đại học Nha Trang."
  },
  "place": { "name": "Nha Trang", "lat": 12.2529, "lon": 109.1908, "timeZone": "Asia/Ho_Chi_Minh" },
  "fonts": {
    "preload": [
      "fonts/montserrat-latin-wght-normal.woff2",
      "fonts/montserrat-vietnamese-wght-normal.woff2"
    ]
  },
  "campus": {
    "ground": "#a9b878",
    "path": "#d8d2c6",
    "plaza": "#b9775f",
    "water": "#2f9ec4",
    "foliage": "#5c8c4a",
    "trunk": "#6f5a3e",
    "player": "#4a489d",
    "npc": "#f8a818",
    "landmark": {
      "archetype": "seafront-slab",
      "name": "Giảng đường hướng biển",
      "wall": "#efe9dc",
      "trim": "#f6f4ee",
      "roof": "#b7c0b4",
      "accent": "#4a489d",
      "colonnades": false,
      "parapetSign": true
    },
    "buildings": {
      "library": { "wall": "#f2efe7", "trim": "#dcd8cc", "roof": "#2f7f86" },
      "watchtower": { "wall": "#f2efe7", "trim": "#f6f4ee", "roof": "#b7c0b4" },
      "market": { "wall": "#f2efe7", "trim": "#dcd8cc", "roof": "#c4705a" }
    },
    "lights": {
      "dawn": {
        "sky": "#f2d9c4",
        "ground": "#9fa08f",
        "hemisphere": 1.6,
        "sun": "#ffb27a",
        "sunIntensity": 1.5,
        "sunDirection": [0.94, 0.18, 0.29],
        "rim": 0.65
      },
      "day": {
        "sky": "#bcd9ef",
        "ground": "#b8b49c",
        "hemisphere": 3.3,
        "sun": "#fff3d0",
        "sunIntensity": 2.1,
        "sunDirection": [0.53, 0.82, 0.22],
        "rim": 0.18
      },
      "dusk": {
        "sky": "#8fc2e8",
        "ground": "#8d8577",
        "hemisphere": 1.35,
        "sun": "#ff9d4a",
        "sunIntensity": 1.1,
        "sunDirection": [-0.95, 0.14, -0.29],
        "rim": 0.7
      },
      "night": {
        "sky": "#2f4a72",
        "ground": "#2a3348",
        "hemisphere": 0.85,
        "sun": "#cfe0ff",
        "sunIntensity": 0.3,
        "sunDirection": [0.6, 0.5, 0.25],
        "rim": 0.12
      }
    },
    "npcs": {
      "guard": { "name": "chú bảo vệ", "top": "#f3f2ee", "bottom": "#23262b", "accent": "#0048a8" },
      "registrar": { "name": "chị Thuỷ", "top": "#0048a8", "bottom": "#2a2a2e", "accent": "#f8a818" },
      "operator": { "name": "cô Mơ", "top": "#48b4e7", "bottom": "#2f3640", "accent": "#4a489d" },
      "examiner": { "name": "thầy Nam", "top": "#a8bbd0", "bottom": "#3b3f46", "accent": "#ec2028" }
    }
  }
}
```

**Caveat cho từng màu trong block trên.**

| Khoá | Giá trị | Trạng thái |
|---|---|---|
| `player` `#4a489d` | indigo logo | **Có nguồn** — pixel-sampled từ PNG logo chính thức (3 349 px) |
| `npc` `#f8a818` | cam ấn phẩm | **Có nguồn** — bìa Cẩm nang ngành nghề 2024/2025 (bucket 3 390 px) |
| `landmark.accent` `#4a489d` | chữ lan can mái G5 đọc là "xanh navy/đậm" trong ảnh | **Có nguồn một phần**: sắc có nguồn [A], giá trị lấy từ indigo logo |
| `npcs.*.accent`, `operator.top` | `#0048a8`, `#48b4e7`, `#ec2028`, `#f8a818` | **Có nguồn** — đều trong §2.6-A |
| `landmark.wall` `#efe9dc` | — | **ước lượng.** Hiệu chỉnh ấm lên từ mẫu `#c7c9c6` (dải kem G1 dưới nắng gắt) |
| `landmark.roof`, `watchtower.roof` `#b7c0b4` | — | **ước lượng.** Từ mô tả "màng mái phẳng xanh-xám nhạt" của G5 [A] |
| `market.roof` `#c4705a` | — | **ước lượng.** Từ mẫu mái ngói G8 `#d49b8a` (có nắng), kéo về sắc đất nung |
| `library.roof` `#2f7f86` | — | **ước lượng, và là một LỰA CHỌN.** Mặt ngoài thư viện **chưa biết gì** (§3); giá trị này lấy từ **kính/mành xanh ngọc và sàn gạch bạc hà nội thất** [A], không phải từ mái |
| `plaza` `#b9775f` | — | **ước lượng** từ mô tả gạch block đất nung sân ceremonial [A] |
| `ground`, `foliage`, `trunk`, `water`, `path` | — | **ước lượng toàn bộ.** Không hex nào của biển/trời/cát/tán lá được sample (§3) |
| `lights.*.sky/ground/sun` | — | **ước lượng.** Chỉ `sunDirection` có căn cứ (§4.4) |
| `npcs.*.name` | chị Thuỷ, cô Mơ, thầy Nam | **đề xuất.** "cô Mơ" nhắc **Lê Thị Hồng Mơ**, giảng viên được trang NTU ghi công sắp xếp lại Bảo tàng Thuỷ sinh vật — người duy nhất có tên gắn với bảo tàng trong mọi nguồn. Hai tên còn lại là phịa; **không có tên nhân sự nào khác được dùng.** Tránh tên hiệu trưởng/phó hiệu trưởng thật |

### 4.2 Archetype landmark mới

`spire-hall` (tháp giật cấp của VinUni) và `clock-tower` (theme town) **đều không dùng được**:
**NTU không có tháp nào, không có đồng hồ nào**, và landmark của nó nằm **ngang**.

**Đề xuất tên: `seafront-slab`.** Trung tính, kebab-case như hai tên hiện có, không chứa tên
thương hiệu nào — nên pass được cổng CI "không có brand name trong `frontend/app`".
`schema.ts:99` hiện là `v.picklist(["spire-hall", "clock-tower"])`, cần thêm phần tử thứ ba; test
`scene.test.ts:339` assert đúng tập hai archetype nên cũng phải nới.

**Hình khối low-poly:**

- Một **thanh dài, hơi cong, 5–6 tầng, mái phẳng**, tỷ lệ dài : cao khoảng **6 : 1** (so với tháp
  VinUni 1 : 1,65 — một đảo ngược hoàn toàn của bố cục khung hình).
- **Khúc cong** làm bằng **3 đoạn thẳng gập nhẹ** (mỗi mối ~6–8°), không cần mesh cong: ở khoảng
  isometric nó đọc là cong, và nó giữ draw call thấp.
- **Mặt dài hướng biển = hành lang kính/lam liên tục**: một mặt phẳng lùi vào + **5–6 dải ngang
  trắng** (`trim`) thể hiện cốt sàn. **Mặt dài còn lại trơn.**
- **Mái phẳng + lan can** là một hộp mỏng chạy suốt, màu `roof`.
- **Quay ra biển**, tức mặt có chữ hướng **+z** trong hệ game (§ hệ toạ độ). Landmark **không nằm
  trên trục vào và không nằm ở cuối trục**: nó lệch về **+z** và hơi lệch **+x** so với cổng
  (tầng nam, `t ≈ +150…+220`).
- `colonnades: false` — **NTU không có hàng cột cong nào**. Hình "hiên cột" của NTU là **cloister
  mái ngói thấp** của G8 và sân ceremonial, thuộc `buildings`, không thuộc landmark.

**Chữ trên lan can mái: xử lý thế nào.**

1. **Đó là dấu hiệu thương hiệu.** Chuỗi "ĐẠI HỌC NHA TRANG" / "NHA TRANG UNIVERSITY" **chỉ được
   nằm trong `public/themes/ntu/`**, không bao giờ trong `frontend/app` hay `backend/src` — CI của
   repo fail nếu brand name xuất hiện trong core. Core chỉ biết `parapetSign: boolean`.
2. **Art bible cấm chữ 3D.** Quy tắc 5 của `docs/design/art-direction.md`: *"Chữ ở DOM, hình ở 3D.
   Không có chữ nào dựng trong WebGL"*, và danh sách cấm có *"Chữ 3D, biển hiệu 3D"*. Nên **không
   được** dựng text geometry, không được dùng texture atlas chữ.
3. **Cách đọc được là "có chữ" mà không có chữ:** `parapetSign: true` dựng **một hàng vây đứng
   mảnh instanced trên mép lan can** — khoảng 14–18 khối hộp cao bằng ~0,45 chiều cao một tầng,
   dày ~0,08, **khoảng cách không đều** (cụm 4 – khoảng trống – cụm 3 – khoảng trống – cụm 6, bắt
   nhịp từ "ĐẠI HỌC NHA TRANG"), **màu `accent`**, trên một **dải nền mỏng màu `trim`**. Ở khoảng
   isometric, một hàng vây có nhịp không đều trên lan can **đọc đúng là chữ** mà không phải là chữ.
   Rẻ: một `InstancedMesh`, một draw call.
4. **Chữ thật, nếu muốn, là một DOM label neo thế giới** ở mép lan can, đúng như nhãn khu hiện có.
   Lưu ý điều này là một **ngoại lệ có chủ ý** so với art bible hiện tại, nơi *"Landmark không có
   nhãn (không tương tác)"*. Phải quyết định rõ, không để lẫn.

### 4.3 Đặt zone

Ba zone của game: **Thư viện**, **Tháp canh**, **Chợ**.

| Zone | Chỗ thật đề xuất | Lý do |
|---|---|---|
| **Thư viện** | **Trung tâm Thông tin và Tư liệu** — cụm **TV1/TV2/TV3** ở góc đông bắc, `(s, t) ≈ (294…331, −10)` | Lựa chọn duy nhất đúng. 3 toà, **5 015 m², 7 phòng đọc, 1 000 chỗ**, 18 000+ nhan đề / 46 000 bản [N]. **Phòng đọc tròn hai tầng có mezzanine vành** là hình nội thất đặc trưng nhất campus [A] — tốt cho cả 3D (một drum) và cho trang zone. Phòng máy chủ của trường cũng ở đây [N], một chi tiết hợp với nội dung zone. Ghi là **Thư viện** trong UI (đó là nhãn toà và là từ sinh viên dùng); để **Trung tâm Thông tin và Tư liệu** cho biển hiệu/nhãn hình thức |
| **Tháp canh** | **Nội dung: HT-3 — Viện KHCN Khai thác Thuỷ sản** `(s, t) ≈ (−160, −103)`, với **phòng mô phỏng điều động tàu** và **phòng mô phỏng đánh cá**. **Hình khối: drum tròn của G7** | **Phòng mô phỏng điều động tàu hiện đại bậc nhất Việt Nam** và **phòng mô phỏng đánh cá duy nhất tại Việt Nam** [N] là hai nội thất "chỉ có ở NTU" duy nhất mà bất kỳ nguồn nào nêu. Một buồng lái tàu **chính là một tháp canh**: bạn quan sát, bạn điều khiển, bạn chịu trách nhiệm về hậu quả — mapping gameplay sạch hơn hẳn một cái tháp trang trí. Về hình: NTU không có tháp, nhưng **drum tròn cao suốt toà của G7 với chồng ban công trắng** [A] đọc là tháp, có ảnh xác nhận, và rẻ (một trụ + 5 đĩa). **Không** dùng Nhà Đa Năng 12 tầng làm tháp cho tới khi tag 12 tầng được kiểm (§3) |
| **Chợ** | **Canteen** `(s, t) ≈ (115, −54)`, cộng **dãy 4 quán mặt phố Nguyễn Đình Chiểu** `(s, t) ≈ (−144, −147)` làm set dressing | Canteen là **4 tầng (xác nhận)** và trang chính thức ghi nó có **bốn khu: căng tin, nước, mini-mart, giải trí** [N] — đây **đúng nghĩa** là một cái chợ, không phải một phép ẩn dụ. Thêm bằng chứng tại chỗ: banner shopfront "CĂN TIN – CÀ PHÊ – SINH VIÊN" trên một khối ký túc xá [A]. Bốn quán nhỏ chắn mép phố cho cảnh một mặt tiền thương mại thật ở cổng vào |

**Không dùng cho zone, nhưng nên dựng làm prop/nội dung sau:**

- **Bảo tàng Thuỷ sinh vật** `(s, t) ≈ (105, +63)` — **1 100+ mẫu vật**, hơn 60 năm, trong khuôn
  viên, mở cho người ngoài [N]. Một phòng lọ-và-kệ. Là **ứng viên zone số 4 mạnh nhất**, và là
  biểu hiện di sản thuỷ sản rõ nhất sau đài phun cá heo. Chú ý: **không phải** Viện Hải dương học ở
  Cầu Đá (cách ~5 km, 20 000+ mẫu, bộ xương cá voi) — hai nơi bị lẫn liên tục trong kết quả tìm.
- **Phòng bảo tàng ngư cụ** (hàng trăm mẫu lưới, lưỡi) ở HT-3 [N].
- **Nhà thi đấu** `(s, t) ≈ (138, +88)` và **sân vận động 5 000 chỗ** `(s, t) ≈ (218, +95)` — nơi
  diễn ra lễ kỷ niệm ngày truyền thống và Ngày Nhà giáo [N]. Dùng cho event, không cho zone: nó là
  mặt phẳng + một khối, ít nội dung tương tác.
- **Đài phun cá heo** ở forecourt G8 `(s, t) ≈ (58, +24)` — prop landmark, **không** phải zone.

### 4.4 Preset ánh sáng

Biện luận từ hình học mặt trời đã tính cho **12,2529° N / 109,1908° E** (xấp xỉ Cooper, sai ±vài
phút ngày dài và ±0,5° cao độ):

| Ngày | Ngày dài | Cao độ trưa |
|---|---|---|
| 21/12 | 11h17m | **54,3°** (thấp nhất) |
| 21/3 | 11h59m | 77,3° |
| 21/4 | 12h20m | 89,3° |
| 21/6 | **12h43m** (dài nhất) | 78,8° |
| 21/8 | 12h21m | **89,5°** (cao nhất) |
| 21/9 | 12h00m | 77,5° |

- **Hai lần mặt trời qua thiên đỉnh: ~23/4 và ~19–20/8.** Biên độ ngày dài cả năm chỉ **1h26m** —
  ở đây **mùa là chuyện mây và mù, không phải chuyện ngày dài**.
- Nha Trang ở **~0,6° đông** của kinh tuyến giữa ICT, nên **trưa thật ~12:43 giờ đồng hồ**
  (±~15 phút theo phương trình thời gian). Mặt trời mọc cụm quanh 05:30–06:30, lặn 17:15–18:20
  quanh năm. **Chạng vạng dân dụng ở 12° N chỉ ~22 phút** — nếu animate thời gian trong ngày,
  chuyển tiếp dawn/dusk phải **ngắn**.

Bốn preset, `sunDirection` theo hệ game (`x = s`, `y = lên`, `z = t`; vector trỏ **về phía** mặt
trời, như manifest `vinuni`). Màu là **đề xuất**, hướng là **tính được**.

| Preset | Giờ | Hình học | `sunDirection` | Lý lẽ, và màu đề xuất |
|---|---|---|---|---|
| **dawn** | 05:45–06:30 | Mặt trời mọc **gần như chính đông** (phương vị ~90°), cao ~10° | `[0.94, 0.18, 0.29]` | **Mọc lên từ biển, qua phía Hòn Tre** — khoảnh khắc "Nha Trang" nhất có sẵn. Key thấp, bóng dài **chạy về tây lên đồi**, mù/aerial perspective mạnh trên nước, biển lặng (gió đất). Sun `#ffb27a`, sky `#f2d9c4`, rim cao (0,65). **Giữ transition chặt** vì chạng vạng chỉ 22 phút |
| **day** | **~10:00, không phải trưa** | Cao ~55°, phương vị ~95° | `[0.53, 0.82, 0.22]` | Trưa thật ở đây là **77–89°** suốt tháng 3–9, cho `sunDirection ≈ [−0.04, 0.99, 0.13]`: **đúng vật lý nhưng giết khả năng đọc hình của camera isometric** (bóng co lại thành vệt dưới mái, khối mất cạnh). Đề xuất: preset `day` **mặc định là ~10:00**, và nếu muốn một preset "trưa gắt" thật thì làm riêng. Sun gần trắng-ấm `#fff3d0`, cường độ cao nhất (2,1), rim thấp (0,18), **hemisphere cao (3,3)** để mô phỏng bounce rất mạnh từ bê tông nhạt. Tán lá bạc trên, tối sâu bên trong |
| **dusk** | 17:15–18:20 | Mặt trời lặn **sau núi nội địa về tây** (phương vị ~270°), cao ~8° | `[-0.95, 0.14, -0.29]` | Vì núi vây ba mặt, **đồi mất nắng trực tiếp sớm hơn mặt nước**: vịnh còn giữ phản chiếu trời sáng trong khi campus rơi vào ambient trời-only. Nên **hạ `sunIntensity` (1,1) mà giữ `sky` xanh bão hoà** `#8fc2e8` — đây là cái lật ngược so với preset dusk của `vinuni` (ở đó sun mạnh nhất, 2,661). **Gió biển mạnh nhất buổi chiều** ⇒ animate tán lá mạnh hơn ở preset này, và lá chét me tây gập lại |
| **night** | — | Mặt trăng thấp trên biển về đông | `[0.6, 0.5, 0.25]` | Đèn lối đi campus sodium/LED CRI thấp, **ánh thành phố sáng về nam-tây nam** (trung tâm và dải Trần Phú), **đèn thuyền đánh cá rải trên vịnh** (điểm emissive nhỏ, tĩnh), trường sao gần thẳng đứng **không có gợi ý xoay quanh cực**. `sunIntensity` 0,3, `sky` `#2f4a72`. Chú ý campus `opening_hours=Mo-Su 06:00-22:00` [O] — preset night là 20:00–22:00, không phải đêm khuya |

Một ràng buộc nữa có nguồn: **độ ẩm trung bình ~79 %** ⇒ aerial perspective đáng kể ở **mọi**
preset. Hòn Tre và dãy Cô Tiên phải bạc màu rõ về chân trời, kể cả giữa ngày khô trong.

### 4.5 Art bible đổi gì so với bản hiện tại

Bản art bible hiện tại được rút ra từ VinUni và **giả định bốn thứ mà NTU không có cái nào**.

| Giả định hiện tại | Thực tế NTU | Thay bằng |
|---|---|---|
| **Một trục đối xứng**, mặt tiền nhìn dọc trục, landmark ở cuối trục | **Không có trục.** Trục vào chạy **thẳng qua** campus về đông và kết ở cụm thư viện; A1 nằm **lệch 100 m về nam và thấp hơn 12 m**; G5 nằm ở **mép nam hướng biển**. Lõi hình học là **sân thể thao**, không phải toà chính | **Bố cục bất đối xứng, lệch tâm.** Landmark đứng **ngang khung hình ở mép xa (+z)**, không ở điểm triệt tiêu. Đại lộ vào có **4 đảo phân cách trồng cây** là hình thức duy nhất còn lại — dùng nó, nhưng nó dẫn tới **thể thao**, không tới landmark |
| **Bệ phẳng**, campus trên một mặt bằng | **Vương miện đồi 28–30 m**, đổ xuống 8–18 m ở mọi mép, **chênh 22 m**, dốc nhất ~11 % về đông nam | **Terrain thật, dạng mái vòm.** Cổng chỉ **thấp hơn A1 4 m** — người chơi vào không leo đồi; cú rơi ở **sau lưng**. Sân bóng là **bậc đào 6–11 m**, nên có **taluy và khán đài một bên** |
| **Trục promenade đi thẳng tới thềm bậc và sảnh cột** | **Một bờ taluy trồng cây dài ~470 m** chia hai tầng, xuyên qua bởi **bốn bậc 2 m không đèn không tay nắm** và **một hành lang có mái**, cộng một **đoạn đường chui `layer=-1`** | **Thềm và bậc thay cho promenade.** Đây là **hạng mục có tính cách nhất của site** và rẻ để dựng: một bờ dốc trồng cây + 4 khe bậc + 1 hành lang mái. Cũng là công cụ gameplay tự nhiên (chia map thành hai tầng) |
| **Quảng trường đài phun hình móng ngựa, hai hàng cột cong đối xứng** | **Không có hàng cột cong nào.** Đài phun là **bể tròn trong forecourt G8**, cạnh trục vào, trước một **khối 2 tầng mái ngói đỏ có hiên cột vuông trơn**. "Sân lễ" thật là **sân gạch đất nung xen bàn cờ** cạnh một **cloister mái ngói thấp** | **`colonnades: false`.** Vòng nước + vành lan can trắng + 4–6 hình cá heo cung. Sân lễ là **mặt phẳng gạch đất nung có pattern bàn cờ** — rất rẻ, rất dễ nhận |
| **Hồ** chạy chữ L ở mép trước và mép đông | **Biển**, cách mép nam/đông nam **20–25 m**, **bờ đá granit** (Hòn Chồng/Hòn Vợ), **hai làn Phạm Văn Đồng chen giữa**, và **chân trời bị đóng bởi Hòn Tre + dãy Cô Tiên + Hòn Đỏ** | **Mép biển thay hồ.** Nước phải là **gradient độ sâu**, không phải albedo phẳng (mặt trời đứng 6 tháng/năm). **Bờ là đá, không phải cát** — bãi cát ở ngay phía bắc mũi. **Chân trời phải đóng**: một đường chân trời biển mở là lỗi "không phải Nha Trang" lớn nhất |
| **Tháp giật cấp có kim và đỉnh vàng** | **Không có tháp, không có đồng hồ, không có mái vòm, không có kim.** Silhouette là: thanh cong có chữ lan can mái (G5), **4 vòm nóc bán nguyệt trắng** (G3), **drum tròn chồng vành trắng** (G7) | `archetype: "seafront-slab"`, `parapetSign: true` (§4.2). Thêm hai prop silhouette: **4 vòm nóc** và **drum** |
| **Cổ điển mới**: cột Ionic, trán tường, vòm khải hoàn | **Nhiệt đới hiện đại muộn 1960–70**: **gạch bông gió đục lỗ**, **lan can vây zig-zag**, **ô văng brise-soleil sâu**, **hành lang hở một bên**, **vòm nóc**, **khối 2 tầng mái ngói có hiên cột vuông trơn**; phủ lên bởi bê tông-kính 2000–2010 và một **vì kèo thép** | **Bộ kit "G-block"** (§2.4). Gạch bông gió làm bằng một **mặt phẳng có alpha pattern hoặc một dải ô vuông instanced** — tín hiệu rẻ nhất và đặc trưng nhất của phong cách này. **Không** cột cổ điển, **không** trán tường |
| Mái: một màu | **Bimodal + flat**: toà cũ/thấp **ngói đất nung đỏ**, toà trung kỳ **tôn dốc xanh/teal**, toà mới cao **mái phẳng bê tông**, cả ba cùng khung | Cho phép **ba họ mái** trong cùng cảnh. Đây là một trong những thứ đọc ra ngay là "campus Việt Nam đã mọc nhiều lớp", không phải một khu xây một lượt |

**Những điều cấm của art bible hiện tại vẫn giữ nguyên và vẫn đúng ở đây:** không gradient
tím-xanh, không glassmorphism, không emoji làm icon, không shadow nặng, **không chữ 3D, không biển
hiệu 3D**. Budget hiệu năng không đổi: 60 FPS, **< 80 draw call**, three.js chỉ trong chunk
`/play`, `frameloop="demand"`, không state React mỗi frame. Hai hạng mục NTU mới đều instanced
(hàng vây lan can, bộ tán 4 archetype) nên không đụng trần draw call.

### 4.6 Bốn hình làm nên "đây là NTU" trong một cái nhìn

Giống như sibling doc làm cho VinUni, đây là **ba đến bốn hình chịu trách nhiệm nhận diện**:

1. **Vương miện đồi xanh với vịnh và Hòn Tre đóng chân trời.** Không phải bệ phẳng, không phải hồ.
   Hình mạnh nhất có được: **khung vịnh qua khe giữa hai tán dù 50 tuổi, nhìn xuống dốc**. Cặp đó
   — tán cây nội địa già cộng một vịnh bị đảo đóng ở dưới — **không tồn tại ở Hà Nội (không biển)
   hay Sài Gòn (không biển, không đồi)**.
2. **Thanh dài kem hơi cong, mái phẳng, có hàng chữ rời trên lan can mái, quay ra biển.** Ngang,
   bất đối xứng, lệch tâm. Đây là thứ xuất hiện trong **mọi** không ảnh chính thức.
3. **Bốn vỏ vòm bán nguyệt trắng trên mái phẳng G3**, cộng **drum tròn chồng vành ban công trắng
   của G7**. Hai silhouette duy nhất trên campus mà không thể lẫn với toà nào khác ở Việt Nam.
4. **Vòng đài phun cá heo trước một khối trắng 2 tầng mái ngói đỏ có hiên cột.** Tượng di sản thuỷ
   sản tường minh duy nhất, và là hình gần nhất với "quảng trường" mà NTU có.

Và một hình thứ năm ở tầm silhouette, đáng dựng vì nó định hình cả gameplay: **bờ taluy trồng cây
dài 470 m với bốn khe bậc thang không đèn**, chia campus thành tầng trên (cổng, thể thao, ký túc
xá, thư viện) và tầng dưới (hành chính, hội trường, phòng thí nghiệm, G5, biển).

**Thêm, nếu cần một asset nhận diện 3D tường minh:** **tượng đài NTU** — nhóm khối chữ nhật
trắng/kem xếp chồng giật cao thấp đánh vần N T U, trên đỉnh một **ngôi sao năm cánh đỏ**, trên bãi
cỏ trên vịnh cạnh lan can trắng. Huy hiệu 2D và tượng 3D là **cùng một hình**, nên nó vừa là logo
vừa là prop. Nhưng nó là **dấu hiệu thương hiệu**: chỉ đặt trong `public/themes/ntu/`, không bao
giờ trong `frontend/app`.

### 4.7 Tái cơ cấu 12/12/2025 và quyết định thiết kế mà nó bắt phải chọn

Ngày **12/12/2025**, NTU gộp và nâng các khoa/viện kỹ thuật, thuỷ sản và kinh tế thành **ba trường
thành viên** [N]:

| Trường thành viên (12/12/2025) | Nghị quyết | Gộp từ |
|---|---|---|
| **Trường Thuỷ sản và Khoa học sự sống** | NQ 35/NQ-ĐHNT | Viện KH&CN Khai thác Thuỷ sản, Viện Nuôi trồng thuỷ sản, Viện CNSH&MT, Khoa Công nghệ thực phẩm |
| **Trường Kỹ thuật và Công nghệ** | NQ 36 | Khoa Cơ khí, Khoa Kỹ thuật Giao thông, Khoa Xây dựng, Khoa Điện – Điện tử |
| **Trường Kinh tế và Kinh doanh** | NQ 37 | Khoa Kinh tế, Khoa Kế toán – Tài chính |

Bốn khoa **sống sót không đổi**: Khoa Khoa học Xã hội và Nhân văn, Khoa Du lịch, Khoa Ngoại ngữ,
Khoa Công nghệ thông tin. **Thư viện** đổi tên thành **Trung tâm Thông tin và Tư liệu** (NQ 42).
Hai trung tâm mới: **Trung tâm Thể dục và Thể thao**, **Trung tâm Đào tạo xuất sắc**.

**Quyết định bị buộc phải chọn.** Nhãn khoa trên bản đồ chính thức [M] (Faculty of Civil
Engineering ở A-2, Institute of Aquaculture ở B-3, Faculty of Mechanical Engineering ở G-1,
Faculty of IT ở G-6, …) là **bản đồ tiếng Anh trước 2019**. **Phần lớn các đơn vị đó không còn tồn
tại như đơn vị riêng.** Nhưng chúng **chính là cái sinh viên hiện tại vẫn nhận ra**.

Đề xuất, rõ ràng:

- **Cảnh "bây giờ" phải dùng ba tên trường thành viên mới** cho nhãn đơn vị trong hội thoại và
  trang zone. OSM đã bắt kịp (way 231980914 = "Trường Thuỷ sản và Khoa học sự sống",
  231993706 = "Trường Kỹ thuật và Công nghệ", 231993747 = "Trường Kinh tế và Kinh Doanh – Nhà Đa
  Năng"), nên tên mới và mã khối **có thể dùng chung**.
- **Nhãn hình thì giữ mã khối** (`G5`, `K3`, `TV2`, `A1`, `HT3`). Mã khối là cái sơn trên tường
  (biển "G3", "G7" xanh trên tường có trong ảnh [A]) và là cái sinh viên nói miệng.
- **Cạm bẫy ngôn từ cho copy tiếng Việt:** sau 2025, **"Trường" bên trong NTU nghĩa là một trường
  thành viên**, nên "Trường Kỹ thuật và Công nghệ" **≠** cả trường. Trên thực tế sinh viên vẫn gọi
  NTU là **"trường"** và vẫn nói **"khoa Cơ khí"**. Copy nên để NPC nói theo cách sinh viên nói
  (`trường`, `khoa`, `G5`) và để **biển hiệu/nhãn hình thức** mang tên mới. Đó cũng là cách xử lý
  đã chọn cho Thư viện (§4.3).
- Nếu game muốn đặt ở **2019–2025**, danh sách khoa trên bản đồ [M] dùng được nguyên và sẽ đúng với
  mọi cựu sinh viên tốt nghiệp trước 2026. **Chọn một mốc thời gian và ghi vào manifest**, đừng
  trộn hai hệ tên trong cùng một cảnh.

## 5. Nguồn

**Nguồn chính thức của trường [N]**

- https://www.ntu.edu.vn/ : trang chủ. Banner sứ mệnh/tầm nhìn/triết lý giáo dục (văn bản verbatim),
  bìa *Cẩm nang ngành nghề 2024/2025* nhúng base64 (nguồn của bảng màu ấn phẩm), danh sách tin
  (Bảo tàng Thuỷ sản, đội Lasan, bài về thiết kế logo).
- https://www.ntu.edu.vn/gioi-thieu/co-so-vat-chat : trang Cơ sở vật chất. Sáu mục (vị trí, giảng
  đường, thư viện số, KTX, thể thao, phòng thí nghiệm); **không nêu toà hành chính nào, không nêu
  "nhà đa năng"**; 8 giảng đường / 120 phòng / 15 000 m² / 6 000 chỗ; các cơ sở vệ tinh.
- https://en.ntu.edu.vn/Living-Learning/Campus-overview-and-infrastructure : 20 ha, "LaSan hill",
  **canteen 4 tầng với 4 khu**, thư viện 3 toà / 7 phòng đọc / 1 000 chỗ, 10 toà KTX / ~1 000 phòng
  / >5 000 sinh viên, 50 phòng thí nghiệm.
- https://en.ntu.edu.vn/Living-Learning/Sports-Center : trang Sports Center.
- https://phongdbcl.ntu.edu.vn/uploads/47/CONG%20KHAI%20NAM%202025-2026/285-BC%20765.BC%20ĐHNT%20ngay%2026.6.26%20Bao%20cao%20thuong%20nien%20nam%202025.pdf
  : **AR2025**, số 765/BC-ĐHNT, số liệu tới 31/12/2025. Nguồn duy nhất cho **tái cơ cấu 12/12/2025
  và ba nghị quyết**, bảng phòng/ban/trung tâm sau đổi tên, ~15 000 sinh viên / 20 đơn vị / 450
  giảng viên, đất và sàn từng cơ sở, hiệu trưởng hiện tại và **"phòng ở Tòa nhà A1"**, mô tả
  "đồi Lasan ... 2 mặt giáp biển", 5 sao UPM.
- https://tuyensinh.ntu.edu.vn/uploads/2/files/So%20tay%20TS2019%2003042019_edit%201.pdf :
  **SOTAY2019**. **Xác nhận độc lập chú giải bản đồ [M]** (G1–G8, K1–K8, TV2–TV4, HT1–HT2, Cổng
  chính, Canteen, Sân bóng, Nhà thi đấu, Khu hiệu bộ, Tòa nhà đa năng, Bãi biển, ba con phố); 8 toà
  KTX / >400 phòng / ~4 000 chỗ; nhà thi đấu 800 chỗ; sân vận động 5 000 chỗ; thư viện 5 015 m²;
  **phòng mô phỏng điều động tàu và phòng mô phỏng đánh cá**; phòng bảo tàng ngư cụ; danh sách CLB;
  bảng hiệu trưởng; lịch sử NTU.
- https://tuyensinh.ntu.edu.vn/uploads/2/files/DE%20AN%20CNTT_25_6.pdf : đề án tuyển sinh —
  **23,4 ha**, "trên đất đồi, hai mặt giáp biển", 9 khu giảng đường / gần 28 000 m².
- https://vpt.ntu.edu.vn/uploads/56/316-BẢN%20TIN%20TỪ%2001-9%20đến%2030-9_F.pdf : **BT09/2025** —
  khai giảng 05/9/2025 ở Hội trường 1, **Hội trường số 3** (nên HT ít nhất tới HT3), triển lãm
  "NTU 66 năm", tour campus cho tân sinh viên, CLB Tiếng Trung, Ngày Chủ nhật xanh, **khoá K67**.
- https://ntu.edu.vn/tin-tuc/nhieu-suc-hut-tu-bao-tang-thuy-sinh-vat-tai-truong-dh-nha-trang :
  **Bảo tàng Thuỷ sinh vật** — trong khuôn viên, >60 năm, **1 100+ mẫu vật**, danh mục tra cứu,
  mở cho người ngoài, ghi công **Lê Thị Hồng Mơ**; các loài NTU nhân giống đầu tiên ở VN.
- https://thuvien.ntu.edu.vn/ : trang thư viện — tiêu đề "Trung tâm Thông tin và Tư liệu" nhưng
  thân bài vẫn dùng "Thư viện"; địa chỉ "phường Bắc Nha Trang"; mục "Thời gian làm việc" render
  rỗng (nên **không có giờ mở cửa công bố**).
- https://www.ntu.edu.vn/Uploads/56/TB%20to%20chuc%20cuoc%20thi%20sang%20tac%20logo.pdf : thông báo
  thi logo 65 năm — tài liệu *governance* duy nhất về logo; **không phải** quy chuẩn sử dụng.
- https://www.ntu.edu.vn/Uploads/6/files/Tap-tin-pdf/65N-NTU-1959%20-%202024.pdf : sách 65 năm
  (>8 MB, **chưa đọc được** — vượt giới hạn fetch). Rất có thể trả lời: linh vật, bài hát truyền
  thống, cựu sinh viên, toà nào còn từ thời La San.
- https://www.ntu.edu.vn/gioi-thieu/ban-do-truong-dai-hoc-nha-trang : trang bản đồ campus chính
  thức — **render bằng script, không expose URL ảnh nào**, nên không khôi phục được khoá mã khối.
- https://www.ntu.edu.vn/gioi-thieu/tham-quan-truong-qua-anh và `/tham-quan-truong-qua-video` :
  album ảnh/video — gallery render bằng script, scrape HTML **không ra URL ảnh nào**.
- https://ntu.edu.vn/Portals/6/portal.css, `/Portals/_default/skins/xcillion/css/custom.css`,
  `style.css`, `bootstrap-custom.css` : CSS — **Tahoma × 250**, Open Sans × 59, **không nạp
  webfont**; màu NTU tự viết `#FDA72D`, `#1E88C3` + `darkorange`; hero background
  `/uploads/50/images/Banner-Slider/dhnt-getway_optimized.jpg` (**chưa sample** — đây là file nên
  lấy mẫu để có hex nước và trời).
- https://tuyensinh.ntu.edu.vn/uploads/2/images/contact/3/logo-large-260521150708.png : **PNG logo
  chính thức 200×200** — nguồn của bốn hex trong §2.6-A kèm đếm pixel.
- https://ntu.edu.vn/Uploads/6/Sliders/1725/su-menh-tam-nhin-triet-ly-giao-duc-ntu-251222143420.png
  : banner sứ mệnh/tầm nhìn/triết lý; đỏ `#FF3131`.
- https://phonghtdn.ntu.edu.vn/uploads/45/files/old/newsletter/Bản%20tin%20NTU%20-%20Qúy%201.2019.pdf
  : slogan **"Căng buồm tri thức vươn khơi – Sail to wisdom"** thắng giải nhất thi sáng tác 2019.
- https://ntu.edu.vn/uploads/56/files/3_biểu%20mẫu%2019_NH%2022-23.pdf : công khai biểu mẫu 19 —
  tổng đất mọi cơ sở **515 835 m²**. **Không dùng cho polygon campus.**

**Ảnh đã đọc [A]** (chỉ trong scratchpad, không commit)

- https://www.ntu.edu.vn/uploads/6/images/giang-duong/giang-duong-g5-dhnt.jpg : **G5** — thanh dài
  hơi cong, mái phẳng, **chữ rời trên lan can mái "ĐẠI HỌC NHA TRANG / NHA TRANG UNIVERSITY"**,
  giàn hoa giấy.
- https://commons.wikimedia.org/wiki/File:MotgoctruongDHNT.jpg : **ảnh giá trị nhất** (3872×2592,
  Nikon D80, 2009). **G3** đầy đủ: 4 vòm nóc, gạch bông gió, lan can vây zig-zag, ô văng, biển
  "G3" xanh, stack gạch đỏ; **tượng người giơ đuốc trên bệ cánh sen hồng trong bể tròn**.
- https://www.ntu.edu.vn/uploads/6/images/giang-duong/giang-duong-g8-dhnt.jpg : **G8** và **đài
  phun cá heo** — bể tròn, lan can trắng, nhóm cá heo kim loại sẫm; hiên cột trắng hai tầng dưới
  mái ngói đỏ. Mẫu mái `#d49b8a`, tường `#d0d0d0`.
- https://www.ntu.edu.vn/uploads/6/images/giang-duong/giang-duong-g7.jpg : **G7** — drum tròn cao
  suốt toà, chồng ban công trắng cong, khung cửa xanh, sứ và cây lá kim.
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/giang-duong-g1.JPG : **G1** — nửa panel đỏ
  gạch / nửa trắng, trụ thang trắng nhô mái, giàn lam, **bia đá sẫm 2–2,5 m** trên thềm. Mẫu
  `#684849` và `#c7c9c6`.
- https://www.ntu.edu.vn/uploads/6/images/giang-duong/giang-duong-g2-dhnt.jpg : **G2** — 6 tầng,
  ochre + dải trắng, hành lang hở sau lan can trắng, **đầu hồi đỏ có lưới cửa sổ vuông**, đứng trên
  sườn trên vịnh lúc bình minh, thuyền đánh cá phía sau.
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/thu-vien-dh-nha-trang.jpeg : **nội thất thư
  viện** — phòng đọc tròn hai tầng, mezzanine vành, cột tròn trắng, kính xanh ngọc, sàn bạc hà.
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/ky-tuc-xa-dh-nha-trang.JPG : **ký túc xá** —
  4 tầng, nhịp trụ/lan can/gạch bông gió, hiên trệt hở, cửa xanh, banner "CĂN TIN – CÀ PHÊ – SINH
  VIÊN".
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/nha-thi-dau.jpg : **nhà thi đấu** (Canon EOS
  6D, 2019-04-15, giải HDBank Futsal) — vì kèo không gian thép, clerestory, dado xanh, khán đài
  nâng, sàn xanh-đỏ.
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/san-bong-da-dh-nha-trang.JPG : **sân bóng** —
  cỏ nhân tạo kẻ sọc, dải chạy xanh-xám, lưới chắn bóng xanh đậm, **một khung bê tông đang thi công**
  trên skyline (ảnh không ghi ngày), cột viễn thông lattice.
- https://www.ntu.edu.vn/uploads/6/images/gioi-thieu/khuan-vien-dh-nha-trang.JPG : **không ảnh hero
  chính thức** — mũi đất xanh, đường chạy + sân cỏ, nhà thi đấu mái tôn nhạt, **mái ngói đỏ ở giữa
  site**, khối trắng mái teal, tán cây dày, thành phố và vịnh phía sau. Nguồn của kết luận "màu mái
  bimodal".
- https://www.ntu.edu.vn/uploads/56/images/news/12325/img/doi-lasan-noi-nhung-uoc-mo-vuon-ra-bien-lon_thumb400.jpg
  : không ảnh sát mép biển — **G5 cong/gập trong mặt bằng, mái phẳng màng xanh-xám**, chữ lan can
  nhìn ra biển và cầu Trần Phú, các khối mái ngói đỏ phía trong.
- https://i.ytimg.com/vi/6QuWR_ntnJQ/maxresdefault.jpg : khung drone 26/03/2019, lễ 60 năm —
  **sân ceremonial gạch đất nung xen bàn cờ**, khối trắng 3 tầng cửa sổ xanh chói + bảng "HIỀN TÀI
  LÀ NGUYÊN KHÍ QUỐC GIA", **dãy cloister mái ngói sâu trên cột vuông trơn** (mảng vải trông xưa
  nhất trong mọi ảnh).
- https://ntu.edu.vn/uploads/56/images/news/12293/img/nhung-tran-tro-khi-thiet-ke-logo-truong-dai-hoc-nha-trang_thumb400.jpg
  : **tượng đài NTU** — khối chữ nhật trắng xếp chồng đánh vần N T U + **ngôi sao đỏ**, trên bãi cỏ
  trên vịnh. Nguồn của "công thức postcard": đồi → cỏ/gạch → tượng trắng → lan can → vịnh → dãy đảo
  → trời, bố cục một phần ba đất / một phần ba biển / một phần ba trời.

**OSM, địa hình [O]**

- https://overpass-api.de/api/interpreter (lấy 2026-11-02) : polygon campus **way 126760189**;
  **node cổng 2403563080**; 54 way nhà (gồm `231993835` A1, `231980914`, `231993706`, `231993747`,
  `231993710`, `231993716`, `232039796`, `232041038`, `231986641`); `231993996` sân bóng + `232039821`
  khán đài; năm `barrier=hedge` `1545622612–16`; bốn `highway=steps`; `1545622617` hành lang có mái;
  `231993902` cầu bộ hành; `232002525` Đường Thanh Niên `layer=-1`; bốn `barrier=traffic_island`;
  `1198403325` đường bờ; `265148348` Hòn Đỏ; `126480403` Nguyễn Đình Chiểu; Tôn Thất Tùng; Phạm Văn
  Đồng (`231885653`, `651186209`). **© OpenStreetMap contributors, ODbL 1.0.**
- https://api.opentopodata.org/v1/srtm30m : cao độ SRTM 30 m cho 10+ điểm trên campus (bảng §2.2).
  SRTM public domain; OpenTopoData xin ghi nguồn. **DSM 2000, không phải DTM — xem cảnh báo §2.2.**

**Báo chí và tham khảo [P]**

- https://danchuphapluat.vn/choang-ngop-voi-hang-cay-co-thu-co-tuoi-doi-hon-nua-the-ky-tai-ngoi-truong-vua-co-rung-vua-co-bien-5792.html
  (Dân chủ & Pháp luật, 23/02/2024) : **nguồn giàu nhất về cây** — xà cừ/me tây/bàng dọc đường
  chính; phượng, bằng lăng, liễu, muồng hoàng yến, hoa giấy ở G7, "tuyết sơn phi hồng", hoa sen;
  hàng trăm cây >50 tuổi; >20 ha, >½ xanh, ~10 m²/người, ~1 000 cây/năm, Tết trồng cây; "đồi Lasan,
  phường Vĩnh Thọ"; "Từ sân trường có thể chiêm ngưỡng được vẻ đẹp của cả vịnh Nha Trang"; khung
  "vừa có rừng vừa có biển".
- https://vi.wikipedia.org/wiki/Trường_Đại_học_Nha_Trang : lịch sử và các lần đổi tên; **95 phòng
  học** (vênh với 120); 14 553 SV đại học / 815 ThS / 58 NCS / 472 GV; Viện NC Chế tạo Tàu thuỷ;
  địa chỉ "phường Bắc Nha Trang"; **"tháng 2/2026" cho tái cơ cấu (vênh với 12/12/2025)**.
- https://en.wikipedia.org/wiki/Nha_Trang_(city) : khí hậu savan nhiệt đới, **khô ~1–8, mưa ~9–12**;
  mưa năm ~1 300–1 399 mm, tháng 10 ~312 mm, tháng 11 ~382 mm, tháng 2 ~16 mm; nhiệt 27–33 °C /
  21–26 °C; ẩm ~79 %; **~2 539 giờ nắng/năm**; vịnh vây núi ba mặt, một đảo lớn + bốn đảo nhỏ;
  Po Nagar ở cửa sông Cái; **Nha Trang không còn là thành phố từ 01/7/2025**.
- https://dulich.khanhhoa.gov.vn/en/introduce/overview/climate.html : **~2 380 giờ nắng** (vênh).
- https://localvietnam.com/uncategorized/hon-chong/ : Hòn Chồng là **đá granit hai cụm**, Hòn Vợ
  nhìn ra biển mở, **bờ đá thô không phải bãi tắm**, bãi cát ngay phía bắc mũi, panorama vịnh với
  **Hòn Tre** và **dãy Cô Tiên**, đài thiên văn trên đồi.
- https://mia.vn/cam-nang-du-lich/hon-chong-nha-trang-hon-dao-tho-mong-lau-doi-cua-thanh-pho-bien-xinh-dep-621
  : **Hòn Chồng và Hòn Vợ ở chân đồi Lasan**, ~3 km đông bắc trung tâm.
- https://en.wikipedia.org/wiki/Albizia_saman : **me tây = Albizia saman** — 15–25 m, tán dù ~30 m,
  **lá chét gập khi mưa và lúc chiều**, rụng lá mùa khô.
- https://trungtamthuoc.com/duoc-lieu/me-tay và `/cay-xa-cu` : nguồn vênh về "me tây"
  (*Pithecellobium dulce*); xà cừ tán rộng dày, hoa ~5–7, quả chín 8–10.
- https://mia.vn/cam-nang-du-lich/lim-tim-voi-loat-anh-check-in-mua-hoa-phuong-khi-di-du-lich-hue-2737
  : **phượng ở Trung Bộ nở từ ~tháng 5, đỉnh cuối 5 tới hết 6**.
- https://tuoitre.vn/mua-hoa-bang-lang.html : bằng lăng nở hè (Hà Nội: tháng 5).
- https://tapchicongthuong.vn/tag-lop-xe-11312.htm : **phi lao là cây đường phố/bãi biển đặc trưng
  Nha Trang**, được tỉa thành tán nghệ thuật.
- https://baomoi.com/hang-nho-bien-c35024870.epi và `/mua-bang-non-c38162561.epi` : **nho biển** làm
  hàng rào ven biển; "mùa bàng nõn" (lá non vàng-xanh khi ra lá lại).
- https://nhandan.vn/giu-khong-gian-cho-tp-bien-nha-trang-post611955.html : cây xanh công viên Nha
  Trang chỉ **0,56 m²/người (2018)**; QĐ 5231/QĐ-UBND (2012) điều chỉnh loài cây.
- https://www.sggp.org.vn/bao-so-12-pha-tan-mang-xanh-nha-trang-480350.html : **bão số 12 (Damrey,
  2017)** quật đổ phần lớn cây đường phố (con số "100 %" là tu từ).
- https://tuoitre.vn/bai-reu-toc-xanh-tren-con-duong-dep-nhat-nha-trang-20190221152922874.htm :
  **bãi rêu tóc xanh** trên đá dọc Trần Phú khi triều thấp.
- https://vi.wikipedia.org/wiki/Tỉnh_dòng_La_San_Việt_Nam và https://lasanvn.org/chi-tiet/la-san-thanh-tam.html
  : tu viện La San trên đồi **xây 1932–33**, đệ tử viện 1964; **1978 các Sư huynh bị buộc di dời
  xuống chân đồi**.
- https://phamtinanninh.com/?p=8050 : hồi ký cựu học sinh đặt **Trường La San Bá Ninh ở số 26 Duy
  Tân**, cổng chính ra Nguyễn Tri Phương, lập 30/7/1954, KTS J. Masson — và coi "Đồi La Salle" là
  **một chỗ khác**. Nguồn để sửa premise "Bá Ninh từng ở campus".
- https://nongnghiepmoitruong.vn/truong-dai-hoc-nha-trang-trao-bang-tot-nghiep-cho-1772-tan-cu-nhan-ky-su-d821166.html
  và `/hon-500-sinh-vien-ra-quan-chien-dich-mua-he-xanh-d816726.html` : tốt nghiệp 1 772 người;
  >500 SV Mùa hè xanh 2025. **Không bài nào mô tả màu áo lễ.**
- https://vietnamnet.vn/truong-nuoi-com-chong-dich-sinh-vien-yen-tam-lam-do-an-tot-nghiep-632288.html
  : 2020, >200 SV ở lại KTX và được trường nuôi cơm để làm đồ án.
- https://lsvn.vn/hieu-truong-mac-ao-nhung-cam-quyen-truong-o-le-tot-nghiep-trang-phuc-la-nhung-khong-vi-pham-phap-luat1659524900.html
  và https://tuoitre.vn/hieu-truong-mac-ao-nhung-cam-quyen-truong-o-le-trao-bang-tot-nghiep-dai-hoc-gay-tranh-cai-202207311948343.htm
  : **Thông tư 26/2009/TT-BGDĐT không quy định màu/chất liệu/kiểu** lễ phục — mỗi trường tự chọn.
  Lý do màu áo lễ NTU **không thể lấy nguồn**.
- https://news.laodong.vn/bat-dong-san/xay-moi-dai-hoc-khanh-hoa-ra-phia-tay-nha-trang-sau-nam-2030-1421476.ldo
  : kế hoạch xây **Đại học Khánh Hoà** mới ở tây Nha Trang sau 2030 — **một trường khác, đừng lẫn**.
- https://vjs.ac.vn/index.php/jmst/article/view/14586 : mùa bão chính **tháng 9 tới tháng 1** ở vùng
  biển Khánh Hoà, tần suất ~4 lần mùa phụ.
- https://www.propertycasualty360.com/2017/11/07/typhoon-damrey-rocks-vietnam-with-historic-force-air-worldwide-finds/
  : Damrey đổ bộ Khánh Hoà rạng sáng **04/11/2017**.
- https://vinpearl.com/vi/chia-se-kinh-nghiem-tham-quan-vien-hai-duong-hoc-nha-trang-chi-tiet :
  **Viện Hải dương học** (1 Cầu Đá) để **đối chiếu phân biệt** với Bảo tàng Thuỷ sinh vật của NTU.

**Nguồn chủ dự án cung cấp [M]**

- **Ảnh bản đồ campus chính thức** (chủ dự án gửi). Nguồn sơ cấp đã xác nhận cho chú giải và phân
  khu: G1–G8, K1–K8, TV2–TV4, HT1/HT3, Main building, Canteen, Gymnasium, Football field, Main Gate
  trên Nguyễn Đình Chiểu; ranh giới Nguyễn Đình Chiểu / Tôn Thất Tùng / Phạm Văn Đồng; biển phía
  đông nam; mã màu vàng/tím/nâu đỏ/hồng sen/cyan/lục đậm. **Cần commit ảnh này cạnh theme pack**,
  và **lấy mẫu sáu hex mã màu từ chính ảnh**. Đối chiếu tên: bản đồ ghi toà hành chính **A-2**,
  OSM ghi **A1** (§3).

**Chưa đọc, nên đọc lượt sau** (đã nêu trong §3, nhắc lại để không mất)

- `65N-NTU-1959 - 2024.pdf` (>8 MB) — linh vật, bài hát, cựu sinh viên, di sản La San.
- `/uploads/50/images/Banner-Slider/dhnt-getway_optimized.jpg` — **file để sample hex nước và trời**.
- Google Street View / Maps ở 02 Nguyễn Đình Chiểu — **cổng chính**, thứ duy nhất không có bằng
  chứng nào.
- Overpass lượt hai với `out geom;` — **đường bao thật từng toà, centreline đường, và way của G5**.
- Album ảnh Facebook chính thức của NTU — áo lễ, đồng phục, biển hiệu.
- eBird hotspot Hòn Chồng / iNaturalist Vĩnh Thọ — chim và côn trùng cho âm thanh môi trường.
- weatherspark.com/y/113262 (trả HTTP 503 trong đợt này) — % mây theo tháng, hướng gió, bảng mọc/lặn.
- Bản tin nội bộ NTU hai tuần một kỳ 2025–2026 — công trình mới 2020–2026.
