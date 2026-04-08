package com.crowndine.core.service.combo;

import com.crowndine.presentation.dto.request.ComboRequest;
import com.crowndine.presentation.dto.response.ComboResponse;
import com.crowndine.presentation.dto.response.TopSellingComboResponse;

import java.util.List;

public interface ComboService {
    List<ComboResponse> getAllCombos();

    List<TopSellingComboResponse> getTopSellingCombos(int limit);

    ComboResponse getComboById(Long id);

    ComboResponse getComboByName(String name);

    ComboResponse createCombo(ComboRequest comboRequest);

    ComboResponse updateCombo(Long id, ComboRequest comboRequest);

    void deleteCombo(Long id);
}
