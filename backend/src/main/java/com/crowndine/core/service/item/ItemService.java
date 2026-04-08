package com.crowndine.core.service.item;

import com.crowndine.presentation.dto.request.ItemRequest;
import com.crowndine.presentation.dto.response.ItemResponse;
import com.crowndine.presentation.dto.response.PageResponse;

import java.util.List;

public interface ItemService {
    List<ItemResponse> getAlItems();

    ItemResponse getItemById(Long id);

    ItemResponse getItemByName(String name);

    ItemResponse createItem(ItemRequest itemRequest);

    ItemResponse updateItem(Long id, ItemRequest itemRequest);

    void deleteItem(Long id);

    PageResponse<ItemResponse> getListItems(Long categoryId, String search, String dir, String sortBy, int page, int size);
}
