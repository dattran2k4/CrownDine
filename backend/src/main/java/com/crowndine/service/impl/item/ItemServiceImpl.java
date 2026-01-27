package com.crowndine.service.impl.item;

import com.crowndine.common.enums.EItemStatus;
import com.crowndine.dto.request.ItemRequest;
import com.crowndine.dto.response.ItemResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Category;
import com.crowndine.model.Item;
import com.crowndine.repository.CategoryRepository;
import com.crowndine.repository.ComboItemRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.service.item.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ComboItemRepository comboItemRepository;

    @Override
    public List<ItemResponse> getAlItems() {
        return itemRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
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
                .build();
    }

    @Override
    public ItemResponse getItemById(Long id) {
        Item item = getItemByIdOrThrow(id);
        return mapToResponse(item);
    }

    private Item getItemByIdOrThrow(Long id) {
        return itemRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy item với id: " + id));
    }

    @Override
    public ItemResponse getItemByName(String name) {
        Item item = getItemByNameOrThrow(name);
        return mapToResponse(item);
    }

    private Item getItemByNameOrThrow(String name) {
        return itemRepository.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy item với tên: " + name));

    }

    @Override
    @Transactional
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
    public void deleteItem(Long id) {
        Item item = getItemByIdOrThrow(id);
        item.setStatus(EItemStatus.UNAVAILABLE);
        itemRepository.save(item);
    }


}

