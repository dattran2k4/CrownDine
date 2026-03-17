package com.crowndine.service.chat;

import com.crowndine.common.enums.EItemStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.model.Category;
import com.crowndine.model.Combo;
import com.crowndine.model.Item;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.CategoryRepository;
import com.crowndine.repository.ComboRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatContextService {

    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantTableRepository tableRepository;

    /**
     * Get restaurant context information for AI
     */
    public String getRestaurantContext() {
        StringBuilder context = new StringBuilder();
        
        // Restaurant info
        context.append("THÔNG TIN NHÀ HÀNG CROWNDINE:\n");
        context.append("- Giờ mở cửa: 09:00 - 22:00 hàng ngày\n");
        context.append("- QUAN TRỌNG: KHÔNG được đặt bàn sau 22:00 (giờ đóng cửa)\n");
        context.append("- QUAN TRỌNG: KHÔNG được đặt bàn trước 09:00 (giờ mở cửa)\n");
        context.append("- Thời gian đặt bàn phải kết thúc TRƯỚC 22:00\n");
        context.append("- Địa chỉ: [Cập nhật địa chỉ]\n");
        context.append("- Số điện thoại: [Cập nhật số điện thoại]\n\n");
        
        // Categories and Menu Items
        context.append("MENU:\n\n");
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            context.append(category.getName()).append(":\n");
            List<Item> items = itemRepository.findAll().stream()
                    .filter(item -> item.getCategory() != null && 
                            item.getCategory().getId().equals(category.getId()) &&
                            item.getStatus() == EItemStatus.AVAILABLE)
                    .collect(Collectors.toList());
            
            for (Item item : items) {
                context.append("\n  - ").append(item.getName());
                context.append(" - Giá: ");
                if (item.getPriceAfterDiscount() != null && 
                    item.getPriceAfterDiscount().compareTo(item.getPrice()) < 0) {
                    context.append(item.getPriceAfterDiscount()).append(" VNĐ (giảm từ ")
                           .append(item.getPrice()).append(" VNĐ)");
                } else {
                    context.append(item.getPrice()).append(" VNĐ");
                }
            }
            context.append("\n");
        }
        
        // Combos
        List<Combo> combos = comboRepository.findAll();
        if (!combos.isEmpty()) {
            context.append("\nCOMBO:\n\n");
            for (Combo combo : combos) {
                context.append("  - ").append(combo.getName());
                context.append("\n    Giá: ");
                if (combo.getPriceAfterDiscount() != null && 
                    combo.getPriceAfterDiscount().compareTo(combo.getPrice()) < 0) {
                    context.append(combo.getPriceAfterDiscount()).append(" VNĐ (giảm từ ")
                           .append(combo.getPrice()).append(" VNĐ)");
                } else {
                    context.append(combo.getPrice()).append(" VNĐ");
                }
                context.append("\n\n");
            }
        }
        
        // Tables info
        context.append("\nTHÔNG TIN BÀN:\n");
        List<RestaurantTable> allTables = tableRepository.findAll();
        List<RestaurantTable> availableTables = allTables.stream()
                .filter(table -> table.getStatus() == ETableStatus.AVAILABLE)
                .collect(Collectors.toList());
        
        // Group by capacity with details
        availableTables.stream()
                .collect(Collectors.groupingBy(RestaurantTable::getCapacity))
                .forEach((capacity, tables) -> {
                    context.append("  - Bàn ").append(capacity).append(" người: ")
                           .append(tables.size()).append(" bàn có sẵn\n");
                    
                    // Show sample tables with details
                    tables.stream().limit(3).forEach(table -> {
                        context.append("    + Bàn ").append(table.getName()).append(": ");
                        if (table.getArea() != null && table.getArea().getFloor() != null) {
                            if (table.getArea().getFloor().getFloorNumber() != null) {
                                context.append("Tầng ").append(table.getArea().getFloor().getFloorNumber());
                            } else {
                                context.append(table.getArea().getFloor().getName());
                            }
                            if (table.getArea().getName() != null && !table.getArea().getName().isEmpty()) {
                                context.append(", Khu vực ").append(table.getArea().getName());
                            }
                        }
                        context.append("\n");
                    });
                });
        
        // Table capacity range
        if (!availableTables.isEmpty()) {
            int minCapacity = availableTables.stream()
                    .mapToInt(RestaurantTable::getCapacity)
                    .min().orElse(0);
            int maxCapacity = availableTables.stream()
                    .mapToInt(RestaurantTable::getCapacity)
                    .max().orElse(0);
            context.append("  - Sức chứa: từ ").append(minCapacity)
                   .append(" đến ").append(maxCapacity).append(" người\n");
        }
        
        context.append("\nLƯU Ý:\n");
        context.append("- Giá có thể thay đổi, vui lòng xác nhận khi đặt bàn\n");
        context.append("- Có thể đặt trước món khi đặt bàn\n");
        context.append("- Hủy đặt bàn trước 2 giờ để được hoàn tiền\n");
        
        return context.toString();
    }

    /**
     * Get available tables for a specific capacity
     */
    public String getAvailableTablesInfo(Integer guestNumber) {
        List<RestaurantTable> tables = tableRepository
                .findByCapacityGreaterThanEqualAndStatusOrderByCapacityAsc(
                        guestNumber != null ? guestNumber : 1, 
                        ETableStatus.AVAILABLE);
        
        if (tables.isEmpty()) {
            return "Hiện tại không có bàn phù hợp cho " + guestNumber + " người. Vui lòng liên hệ trực tiếp để được tư vấn.";
        }
        
        StringBuilder info = new StringBuilder("Các bàn phù hợp cho " + guestNumber + " người:\n\n");
        int index = 1;
        for (RestaurantTable table : tables.stream().limit(5).collect(Collectors.toList())) {
            info.append(index).append(". Bàn ").append(table.getName())
                .append(" (").append(table.getCapacity()).append(" người)");
            
            // Add floor and area information with line breaks for better readability
            if (table.getArea() != null && table.getArea().getFloor() != null) {
                info.append("\n   - Tầng: ");
                if (table.getArea().getFloor().getFloorNumber() != null) {
                    info.append(table.getArea().getFloor().getFloorNumber());
                } else {
                    info.append(table.getArea().getFloor().getName());
                }
                
                if (table.getArea().getName() != null && !table.getArea().getName().isEmpty()) {
                    info.append("\n   - Khu vực: ").append(table.getArea().getName());
                }
            }
            
            if (table.getBaseDeposit() != null) {
                info.append("\n   - Đặt cọc: ").append(table.getBaseDeposit()).append(" VNĐ");
            }
            info.append("\n\n");
            index++;
        }
        
        return info.toString().trim();
    }

    /**
     * Search menu items by keyword
     */
    public String searchMenuItems(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return "";
        }
        
        String searchTerm = keyword.toLowerCase().trim();
        List<Item> items = itemRepository.findAll().stream()
                .filter(item -> item.getStatus() == EItemStatus.AVAILABLE &&
                        (item.getName().toLowerCase().contains(searchTerm) ||
                         (item.getDescription() != null && item.getDescription().toLowerCase().contains(searchTerm))))
                .limit(10)
                .collect(Collectors.toList());
        
        if (items.isEmpty()) {
            return "Không tìm thấy món nào với từ khóa \"" + keyword + "\"";
        }
        
        StringBuilder result = new StringBuilder("Kết quả tìm kiếm cho \"" + keyword + "\":\n");
        for (Item item : items) {
            result.append("  - ").append(item.getName());
            result.append(" - Giá: ").append(item.getPrice()).append(" VNĐ\n");
        }
        
        return result.toString();
    }
}
