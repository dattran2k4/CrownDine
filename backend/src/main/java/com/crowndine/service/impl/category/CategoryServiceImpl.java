package com.crowndine.service.impl.category;

import com.crowndine.dto.request.CategoryRequest;
import com.crowndine.dto.response.CategoryResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Category;
import com.crowndine.repository.CategoryRepository;
import com.crowndine.service.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private static final String CATEGORIES_CACHE = "categories";
    private static final String CATEGORY_BY_ID_CACHE = "category-by-id";

    private final CategoryRepository categoryRepository;

    @Override
    @Cacheable(CATEGORIES_CACHE)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = CATEGORY_BY_ID_CACHE, key = "#id")
    public CategoryResponse getCategoryById(Long id) {
        Category category = getCategoryOrThrow(id);
        return mapToResponse(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CATEGORIES_CACHE, allEntries = true),
            @CacheEvict(value = CATEGORY_BY_ID_CACHE, allEntries = true)
    })
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setSlug(generateSlug(request.getName())); // Simple slug generation

        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CATEGORIES_CACHE, allEntries = true),
            @CacheEvict(value = CATEGORY_BY_ID_CACHE, allEntries = true)
    })
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryOrThrow(id);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setSlug(generateSlug(request.getName())); // Update slug on name change

        Category updatedCategory = categoryRepository.save(category);
        return mapToResponse(updatedCategory);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CATEGORIES_CACHE, allEntries = true),
            @CacheEvict(value = CATEGORY_BY_ID_CACHE, allEntries = true)
    })
    public void deleteCategory(Long id) {
        categoryRepository.delete(getCategoryOrThrow(id));
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + id));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder().id(category.getId()).name(category.getName()).slug(category.getSlug()).description(category.getDescription()).build();
    }

    // Basic slug generation - can be improved with a proper utility
    private String generateSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase().replace(" ", "-");
    }
}
