package com.crowndine.dto.response;

import com.crowndine.model.Category;
import jakarta.persistence.Column;

import java.math.BigDecimal;
import java.util.List;

public class ItemRespone {

    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;

    private Double averageRating;
    private List<FeedbackResponse> feedbacks;

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public List<FeedbackResponse> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<FeedbackResponse> feedbacks) {
        this.feedbacks = feedbacks;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


}
