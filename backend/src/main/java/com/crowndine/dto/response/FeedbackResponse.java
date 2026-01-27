package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackResponse {
    private Integer rating;
    private String comment;
    private String username;

}
