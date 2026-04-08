package com.crowndine.core.service.impl.combo;

import com.crowndine.presentation.dto.request.ComboRequest;
import com.crowndine.presentation.dto.response.ComboItemResponse;
import com.crowndine.presentation.dto.response.ComboResponse;
import com.crowndine.presentation.dto.response.TopSellingComboResponse;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Combo;
import com.crowndine.core.entity.ComboItem;
import com.crowndine.core.entity.Item;
import com.crowndine.core.repository.ComboItemRepository;
import com.crowndine.core.repository.ComboRepository;
import com.crowndine.core.repository.ItemRepository;
import com.crowndine.core.repository.FeedbackRepository;
import com.crowndine.core.service.combo.ComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;
    private final ComboItemRepository comboItemRepository;
    private final ItemRepository itemRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    public List<ComboResponse> getAllCombos() {
        return comboRepository.findAll()
                .stream().map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TopSellingComboResponse> getTopSellingCombos(int limit) {
        int normalizedLimit = normalizeTopSellingLimit(limit);

        return comboRepository.findAll().stream()
                .filter(combo -> combo.getSoldCount() != null && combo.getSoldCount() > 0)
                .sorted(Comparator.comparing(Combo::getSoldCount).reversed())
                .limit(normalizedLimit)
                .map(this::mapToTopSellingResponse)
                .toList();
    }

    @Override
    public ComboResponse getComboById(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với id: " + id));
        return mapToResponse(combo);
    }

    @Override
    public ComboResponse getComboByName(String name) {
        Combo combo = comboRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với tên: " + name));
        return mapToResponse(combo);
    }

    @Override
    @Transactional
    public ComboResponse createCombo(ComboRequest req) {
        if (comboRepository.findByName(req.getName()).isPresent()) {
            throw new InvalidDataException("Tên combo đã tồn tại");
        }

        Combo combo = new Combo();
        combo.setName(req.getName());
        combo.setDescription(req.getDescription());
        combo.setPrice(req.getPrice());
        combo.setPriceAfterDiscount(req.getPriceAfterDiscount());
        combo.setImageUrl(req.getImageUrl());
        combo.setStatus(req.getStatus() != null ? req.getStatus() : com.crowndine.common.enums.EComboStatus.AVAILABLE);
        combo.setSlug(toSlug(req.getName()));
        combo.setSoldCount(0L);

        // Save combo first to get ID
        Combo savedCombo = comboRepository.save(combo);

        List<ComboItem> comboItems = new ArrayList<>();
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            comboItems = req.getItems().stream().map(ciReq -> {
                Item item = itemRepository.findById(ciReq.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy item với id: " + ciReq.getItemId()));

                ComboItem ci = new ComboItem();
                ci.setCombo(savedCombo);
                ci.setItem(item);
                ci.setQuantity(ciReq.getQuantity());
                return ci;
            }).toList();
            comboItemRepository.saveAll(comboItems);
        }

        savedCombo.setComboItems(comboItems);
        return mapToResponse(savedCombo);
    }

    @Transactional
    public ComboResponse updateCombo(Long id, ComboRequest req) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với id: " + id));

        combo.setName(req.getName());
        combo.setDescription(req.getDescription());
        combo.setPrice(req.getPrice());
        combo.setPriceAfterDiscount(req.getPriceAfterDiscount());
        combo.setImageUrl(req.getImageUrl());
        if (req.getStatus() != null) {
            combo.setStatus(req.getStatus());
        }
        combo.setSlug(toSlug(req.getName()));

        // ✅ Không replace list
        if (combo.getComboItems() == null) {
            combo.setComboItems(new ArrayList<>());
        }

        combo.getComboItems().clear(); // orphanRemoval sẽ tự delete row cũ

        if (req.getItems() != null) {
            for (var ciReq : req.getItems()) {
                Item item = itemRepository.findById(ciReq.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy item với id: " + ciReq.getItemId()));

                ComboItem ci = new ComboItem();
                ci.setCombo(combo);
                ci.setItem(item);
                ci.setQuantity(ciReq.getQuantity());

                combo.getComboItems().add(ci);
            }
        }

        Combo saved = comboRepository.save(combo);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCombo(Long id) {
        if (!comboRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy combo với id: " + id);
        }
        comboRepository.deleteById(id);
    }

    // ===== mapping =====
    private ComboResponse mapToResponse(Combo combo) {
        List<ComboItemResponse> items = (combo.getComboItems() == null) ? new ArrayList<>()
                : combo.getComboItems().stream()
                        .map(this::mapComboItemToResponse)
                        .toList();

        return ComboResponse.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
                .priceAfterDiscount(combo.getPriceAfterDiscount())
                .status(combo.getStatus())
                .imageUrl(combo.getImageUrl())
                .averageRating(feedbackRepository.getAverageRatingByComboId(combo.getId()))
                .feedbackCount((int) feedbackRepository.countByCombo_Id(combo.getId()))
                .items(items)
                .build();
    }

    private ComboItemResponse mapComboItemToResponse(ComboItem ci) {
        return ComboItemResponse.builder()
                .itemId(ci.getItem().getId())
                .itemName(ci.getItem().getName())
                .quantity(ci.getQuantity())
                .build();
    }

    private TopSellingComboResponse mapToTopSellingResponse(Combo combo) {
        return TopSellingComboResponse.builder()
                .id(combo.getId())
                .name(combo.getName())
                .soldCount(combo.getSoldCount())
                .sellingPrice(combo.getPriceAfterDiscount() != null ? combo.getPriceAfterDiscount() : combo.getPrice())
                .build();
    }

    private int normalizeTopSellingLimit(int limit) {
        if (limit <= 0) {
            return 5;
        }
        return Math.min(limit, 10);
    }

    // Simple Slug generation
    private String toSlug(String input) {
        if (input == null)
            return "";
        String nowhitespace = Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
