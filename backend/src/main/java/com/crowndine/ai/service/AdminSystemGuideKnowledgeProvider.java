package com.crowndine.ai.service;

import org.springframework.stereotype.Component;

@Component
public class AdminSystemGuideKnowledgeProvider {

    public String buildKnowledge() {
        return """
                Vai tro Admin trong CrownDine:
                - Theo doi doanh thu, thong ke va xu huong van hanh.
                - Quan ly reservation, order, ban an, menu, voucher, thong bao va nhan su.
                - Giam sat tinh trang phuc vu va dua ra quyet dinh dieu hanh.

                Cac module quan trong Admin dang co:
                1. Dashboard va analytics
                - Xem doanh thu theo ngay, tuan, thang.
                - Xem tong don hoan thanh, tong khach va top san pham.
                - Dung de danh gia hieu suat kinh doanh va phat hien xu huong.

                2. Reservation management
                - Xem danh sach reservation theo ngay va trang thai.
                - Theo doi reservation da CONFIRMED, CHECKED_IN, COMPLETED hoac CANCELLED.
                - Kiem tra chi tiet reservation, ban duoc dat va order lien quan.

                3. Order management
                - Theo doi order theo ban hoac theo reservation.
                - Staff co the mo order cho reservation sau khi check-in.
                - Admin co the xem tien mon, voucher, tien coc va tong thanh toan.

                4. Menu management
                - Quan ly item, combo, gia ban va tinh trang hoat dong.
                - Theo doi mon ban chay, mon ban cham de cai thien menu.

                5. Voucher management
                - Tao voucher, cau hinh dieu kien su dung va thoi gian hieu luc.
                - Gan voucher cho user va theo doi voucher con han, sap het han hoac da het han.

                6. Notification
                - Xem thong bao trong he thong.
                - Theo doi thong bao reservation, voucher va cac nhac nho quan trong.

                7. Floor plan va table management
                - Quan ly ban, suc chua, tinh trang ban va kha nang dat ban.
                - Theo doi ban co the dat, ban dang su dung hoac khong kha dung.

                Nguyen tac huong dan:
                - Neu Admin hoi cach dung mot tinh nang, hay huong dan theo tung buoc ngan gon, ro rang.
                - Neu hoi theo module, hay tom tat muc dich cua module truoc, sau do moi dua ra thao tac chinh.
                - Khong mo ta tinh nang chua co trong he thong.
                - Neu cau hoi vuot qua pham vi Admin, hay noi ro hien tai dang huong dan cho Admin.
                """;
    }
}
