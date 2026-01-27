package com.crowndine.service.item;

import com.crowndine.dto.response.ItemRespone;
import com.crowndine.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ItemService {
    PageResponse<ItemRespone> findAllItems(Pageable pageable);
    PageResponse<ItemRespone> searchItems(String name, Pageable pageable);
    PageResponse<ItemRespone> filterByCategory(Long categoryId, Pageable pageable);
}
