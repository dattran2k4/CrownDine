package com.crowndine.service.impl.item;

import com.crowndine.dto.response.FeedbackResponse;
import com.crowndine.dto.response.ItemRespone;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.model.Feedback;
import com.crowndine.model.Item;
import com.crowndine.repository.FeedbackRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.service.item.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ITEM-SERVICE")
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    public PageResponse<ItemRespone> findAllItems(Pageable pageable) {
        Page<Item> page = itemRepository.findAll(pageable);

        List<ItemRespone> data = page.getContent()
                .stream()
                .map(this::convertToDTO)
                .toList();

        return PageResponse.<ItemRespone>builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }


    private ItemRespone convertToDTO(Item item) {
        ItemRespone response = new ItemRespone();
        response.setName(item.getName());
        response.setDescription(item.getDescription());
        response.setPrice(item.getPrice());
        response.setImageUrl(item.getImageUrl());

        List<Feedback> feedbacks = feedbackRepository.findByItem(item);

        double avgRating = feedbacks.stream()
                .filter(f -> f.getRating() != null)
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        response.setAverageRating(avgRating);

        List<FeedbackResponse> feedbackResponses = feedbacks.stream()
                .map(f -> {
                    FeedbackResponse fr = new FeedbackResponse();
                    fr.setRating(f.getRating());
                    fr.setComment(f.getComment());
                    fr.setUsername(
                            f.getUser() != null ? f.getUser().getUsername() : null
                    );
                    return fr;
                })
                .toList();

        response.setFeedbacks(feedbackResponses);

        return response;
    }
    @Override
    public PageResponse<ItemRespone> searchItems(String name, Pageable pageable){
        Page<Item> page;
        if (name==null || name.trim().isEmpty()){
            page = itemRepository.findAll(pageable);
        } else {
            String k = name.trim();
            page = itemRepository.findByNameContainingIgnoreCase(k, pageable);
        }
        List<ItemRespone> data = page.getContent()
                .stream()
                .map(this::convertToDTO)
                .toList();

        return PageResponse.<ItemRespone>builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }

    @Override
    public PageResponse<ItemRespone> filterByCategory(Long categoryId, Pageable pageable) {
        Page<Item> page = itemRepository.findByCategory_Id(categoryId, pageable);

        List<ItemRespone> data = page.getContent()
                .stream()
                .map(this::convertToDTO)
                .toList();

        return PageResponse.<ItemRespone>builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }
}
