package com.crowndine.service.combo;

import com.crowndine.dto.request.ComboRequest;
import com.crowndine.dto.response.ComboResponse;

import java.util.List;

public interface ComboService {
    List<ComboResponse> getAllCombos();

    ComboResponse getComboById(Long id);

    ComboResponse getComboByName(String name);

    ComboResponse createCombo(ComboRequest comboRequest);

    ComboResponse updateCombo(Long id, ComboRequest comboRequest);

    void deleteCombo(Long id);
}
