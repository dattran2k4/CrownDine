package com.crowndine.service.item;

import com.crowndine.dto.response.ItemRespone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ItemService {
    Page<ItemRespone> findAllItems(Pageable pageable);
}
