package com.crowndine.service.gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class GeminiAIService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final List<String> apiKeys;
    private final AtomicInteger currentKeyIndex = new AtomicInteger(0);
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent}")
    private String apiUrl;
    
    @Value("${gemini.model:models/gemini-2.0-flash-001}")
    private String defaultModel;
    
    @Value("${openrouter.api.key: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}")
    private String openRouterKey;

    public GeminiAIService(
            RestTemplate restTemplate, 
            ObjectMapper objectMapper,
            @Value("${gemini.api.keys:}") String apiKeysString) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        // Parse multiple API keys
        if (apiKeysString != null && !apiKeysString.trim().isEmpty()) {
            this.apiKeys = Arrays.asList(apiKeysString.split(","));
            log.info("Loaded {} Gemini API keys", this.apiKeys.size());
        } else {
            this.apiKeys = new ArrayList<>();
            log.warn("No Gemini API keys configured");
        }
    }
    
    /**
     * Get next API key with round-robin rotation
     */
    private String getNextApiKey() {
        if (apiKeys.isEmpty()) {
            return null;
        }
        int index = currentKeyIndex.getAndIncrement() % apiKeys.size();
        return apiKeys.get(index).trim();
    }

    /**
     * Call Gemini API using OpenRouter (similar to EZ backend)
     */
    public String generateContent(List<Map<String, String>> messages, String model) {
        // Try Gemini API first with key rotation
        if (!apiKeys.isEmpty()) {
            String apiKey = getNextApiKey();
            try {
                String url = apiUrl + "?key=" + apiKey;
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", convertMessagesToGeminiFormat(messages));
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            requestBody.put("generationConfig", generationConfig);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                String.class
            );
            
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            String content = jsonResponse
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
            
                return content;
            } catch (Exception e) {
                log.warn("Error calling Gemini API with key, trying next key or OpenRouter", e);
                // Try with next key if available, otherwise fallback to OpenRouter
                if (apiKeys.size() > 1) {
                    apiKey = getNextApiKey();
                    try {
                        String url = apiUrl + "?key=" + apiKey;
                        Map<String, Object> requestBody = new HashMap<>();
                        requestBody.put("contents", convertMessagesToGeminiFormat(messages));
                        
                        Map<String, Object> generationConfig = new HashMap<>();
                        generationConfig.put("temperature", 0.7);
                        generationConfig.put("topP", 0.95);
                        generationConfig.put("topK", 40);
                        requestBody.put("generationConfig", generationConfig);
                        
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Content-Type", "application/json");
                        
                        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
                        
                        ResponseEntity<String> response = restTemplate.exchange(
                            url, 
                            HttpMethod.POST, 
                            request, 
                            String.class
                        );
                        
                        JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                        String content = jsonResponse
                            .path("candidates")
                            .get(0)
                            .path("content")
                            .path("parts")
                            .get(0)
                            .path("text")
                            .asText();
                        
                        return content;
                    } catch (Exception e2) {
                        log.error("Error calling Gemini API with second key, falling back to OpenRouter", e2);
                    }
                }
            }
        }
        
        // Fallback to OpenRouter
        log.info("Using OpenRouter API");
        return callOpenRouter(messages, model != null ? model : defaultModel);
    }

    /**
     * Call OpenRouter API (like EZ backend)
     */
    private String callOpenRouter(List<Map<String, String>> messages, String model) {
        try {
            String openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
            
            // Use configured key or environment variable
            String keyToUse = openRouterKey;
            if (keyToUse == null || keyToUse.isEmpty()) {
                keyToUse = System.getenv("OPENROUTER_API_KEY");
            }
            
            if (keyToUse == null || keyToUse.isEmpty()) {
                log.error("OpenRouter API key not configured");
                return "Xin lỗi, tôi không thể trả lời ngay lúc này. Vui lòng thử lại sau.";
            }
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + keyToUse);
            headers.set("Content-Type", "application/json");
            headers.set("HTTP-Referer", "https://crowndine.com");
            headers.set("X-Title", "CrownDine");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                openRouterUrl,
                HttpMethod.POST,
                request,
                String.class
            );
            
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            String content = jsonResponse
                .path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();
            
            log.info("OpenRouter response received successfully");
            return content;
        } catch (Exception e) {
            log.error("Error calling OpenRouter API", e);
            return "Xin lỗi, tôi không thể trả lời ngay lúc này. Vui lòng thử lại sau.";
        }
    }

    private List<Map<String, Object>> convertMessagesToGeminiFormat(List<Map<String, String>> messages) {
        List<Map<String, Object>> geminiMessages = new ArrayList<>();
        for (Map<String, String> msg : messages) {
            Map<String, Object> geminiMsg = new HashMap<>();
            String role = msg.get("role");
            // Gemini uses "user" and "model" instead of "assistant"
            if ("assistant".equals(role)) {
                role = "model";
            }
            geminiMsg.put("role", role);
            
            Map<String, String> part = new HashMap<>();
            part.put("text", msg.get("content"));
            List<Map<String, String>> parts = new ArrayList<>();
            parts.add(part);
            geminiMsg.put("parts", parts);
            
            geminiMessages.add(geminiMsg);
        }
        return geminiMessages;
    }
}
