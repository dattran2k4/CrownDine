package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.TopSellingCombosRequest;
import com.crowndine.ai.schema.response.TopSellingCombosResponse;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.service.combo.ComboService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdminProductMethodTools {

    private final ComboService comboService;

    public AdminProductMethodTools(ComboService comboService) {
        this.comboService = comboService;
    }

    @Tool(name = AIToolNames.TOP_SELLING_COMBOS_TOOL,
            description = "Lấy danh sach combo ban chay nhat cua CrownDine dua tren soldCount. Tool nay chi tra ve combo, khong tra ve item le. Co the truyen limit de gioi han so luong ket qua.")
    public TopSellingCombosResponse getTopSellingCombos(TopSellingCombosRequest request) {
        List<TopSellingCombosResponse.TopSellingCombo> combos = comboService.getTopSellingCombos(request.limit())
                .stream()
                .map(combo -> new TopSellingCombosResponse.TopSellingCombo(
                        combo.getId(),
                        combo.getName(),
                        combo.getSoldCount(),
                        combo.getSellingPrice()
                ))
                .toList();

        return new TopSellingCombosResponse(combos);
    }
}
