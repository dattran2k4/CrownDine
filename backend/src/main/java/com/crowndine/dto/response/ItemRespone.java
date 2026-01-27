package com.crowndine.dto.response;

import com.crowndine.model.Category;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ItemRespone {

    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Double averageRating;
    private List<FeedbackResponse> feedbacks;


}
