package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.TopSellingProductsRequest;
import com.crowndine.ai.schema.response.TopSellingProductsResponse;
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

    @Tool(name = AIToolNames.TOP_SELLING_PRODUCTS_TOOL,
            description = "Lấy danh sách combo bán chạy nhất của CrownDine dựa trên soldCount. Có thể truyền limit để giới hạn số lượng kết quả")
    public TopSellingProductsResponse getTopSellingProducts(TopSellingProductsRequest request) {
        List<TopSellingProductsResponse.TopSellingProduct> combos = comboService.getTopSellingCombos(request.limit())
                .stream()
                .map(combo -> new TopSellingProductsResponse.TopSellingProduct(
                        combo.getId(),
                        combo.getName(),
                        combo.getSoldCount(),
                        combo.getSellingPrice()
                ))
                .toList();

        return new TopSellingProductsResponse("combo", combos);
    }
}
