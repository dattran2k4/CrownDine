package com.crowndine.service.impl.item;

import com.crowndine.common.enums.EItemStatus;
import com.crowndine.dto.request.ItemRequest;
import com.crowndine.dto.response.ItemResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Category;
import com.crowndine.model.Item;
import com.crowndine.repository.CategoryRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.repository.FeedbackRepository;
import com.crowndine.service.item.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "ITEM-SERVICE")
public class ItemServiceImpl implements ItemService {
    private static final String ITEMS_CACHE = "items";
    private static final String ITEM_BY_ID_CACHE = "item-by-id";
    private static final String ITEM_BY_NAME_CACHE = "item-by-name";

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    @Cacheable(ITEMS_CACHE)
    public List<ItemResponse> getAlItems() {
        return itemRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    private ItemResponse mapToResponse(Item item) {
        Long categoryId = item.getCategory() != null ? item.getCategory().getId() : null;

        return ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .price(item.getPrice())
                .priceAfterDiscount(item.getPriceAfterDiscount())
                .status(item.getStatus())
                .categoryId(categoryId)
                .averageRating(feedbackRepository.getAverageRatingByItemId(item.getId()))
                .feedbackCount((int) feedbackRepository.countByItem_Id(item.getId()))
                .build();
    }

    @Override
    @Cacheable(value = ITEM_BY_ID_CACHE, key = "#id")
    public ItemResponse getItemById(Long id) {
        Item item = getItemByIdOrThrow(id);
        return mapToResponse(item);
    }

    private Item getItemByIdOrThrow(Long id) {
        return itemRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy item với id: " + id));
    }

    @Override
    @Cacheable(value = ITEM_BY_NAME_CACHE, key = "#name")
    public ItemResponse getItemByName(String name) {
        Item item = getItemByNameOrThrow(name);
        return mapToResponse(item);
    }

    private Item getItemByNameOrThrow(String name) {
        return itemRepository.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy item với tên: " + name));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = ITEMS_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_ID_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_NAME_CACHE, allEntries = true)
    })
    public ItemResponse createItem(ItemRequest itemRequest) {
        Category category = categoryRepository.findById(itemRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category với id: " + itemRequest.getCategoryId()));

        Item item = new Item();

        item.setName(itemRequest.getName());
        item.setDescription(itemRequest.getDescription());
        item.setImageUrl(itemRequest.getImageUrl());
        item.setPrice(itemRequest.getPrice());
        item.setPriceAfterDiscount(itemRequest.getPriceAfterDiscount());
        item.setStatus(itemRequest.getStatus());
        item.setCategory(category);

        Item savedItem = itemRepository.save(item);


        return mapToResponse(savedItem);
    }


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = ITEMS_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_ID_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_NAME_CACHE, allEntries = true)
    })
    public ItemResponse updateItem(Long id, ItemRequest itemRequest) {
        Item item = getItemByIdOrThrow(id);

        Category category = categoryRepository.findById(itemRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category với id: " + itemRequest.getCategoryId()));

        item.setName(itemRequest.getName());
        item.setDescription(itemRequest.getDescription());
        item.setImageUrl(itemRequest.getImageUrl());
        item.setPrice(itemRequest.getPrice());
        item.setPriceAfterDiscount(itemRequest.getPriceAfterDiscount());
        item.setStatus(itemRequest.getStatus());
        item.setCategory(category); // ✅

        return mapToResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = ITEMS_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_ID_CACHE, allEntries = true),
            @CacheEvict(value = ITEM_BY_NAME_CACHE, allEntries = true)
    })
    public void deleteItem(Long id) {
        Item item = getItemByIdOrThrow(id);
        item.setStatus(EItemStatus.UNAVAILABLE);
        itemRepository.save(item);
    }

    @Override
    public PageResponse<ItemResponse> getListItems(Long categoryId, String search, String dir, String sortBy, int page, int size) {
        log.info("Get list items");

        int pageNumber = (page > 0) ? page - 1 : 0;

        Specification<Item> spec = ItemSpecification.filterItem(categoryId, search);

        String sortField = StringUtils.hasLength(sortBy) ? sortBy : "id";

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(pageNumber, size, Sort.by(sortDirection, sortField));

        Page<Item> itemPage = itemRepository.findAll(spec, pageable);

        List<ItemResponse> response = itemPage.stream().map(this::mapToResponse).toList();

        return PageResponse.<ItemResponse>builder()
                .page(pageNumber + 1)
                .pageSize(itemPage.getSize())
                .totalPages(itemPage.getTotalPages())
                .totalItems(itemPage.getTotalElements())
                .data(response)
                .build();
    }


}
