package com.crowndine.ai.intent;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum AIIntent {

    RESERVATION_MANAGEMENT("Cau hoi ve dat ban, kiem tra ban trong, chi tiet reservation, xac nhan, huy hoac thao tac reservation."),
    CUSTOMER_MANAGEMENT("Cau hoi ve khach hang, voucher cua khach, lich su, hanh vi, thong tin phuc vu khach hang."),
    ANALYTICS_REPORTING("Cau hoi ve doanh thu, thong ke, hieu suat kinh doanh, top mon, top combo, xu huong van hanh."),
    MENU_MANAGEMENT("Cau hoi ve mon an, combo, menu, gia, tinh trang ban, goi y dieu chinh menu."),
    ALERT_MONITORING("Cau hoi ve canh bao, thong bao, voucher sap het han, reservation sap den gio, van de can xu ly."),
    SYSTEM_GUIDANCE("Cau hoi huong dan su dung he thong CrownDine cho Admin, cach thao tac module, quy trinh van hanh tren giao dien."),
    MIXED("Cau hoi ket hop tu hai nhom nghiep vu tro len va can xu ly da mien."),
    OUT_OF_SCOPE("Cau hoi khong lien quan den van hanh, kinh doanh va quan tri nha hang CrownDine.");

    private final String description;

    AIIntent(String description) {
        this.description = description;
    }

    public String description() {
        return description;
    }

    public static String toPromptText() {
        return Arrays.stream(values())
                .map(intent -> "- " + intent.name() + ": " + intent.description())
                .collect(Collectors.joining("\n"));
    }
}
