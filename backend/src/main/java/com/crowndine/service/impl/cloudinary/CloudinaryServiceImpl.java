package com.crowndine.service.impl.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.service.cloudinary.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CLOUDINARY-SERVICE")
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final String UPLOAD_FOLDER_NAME = "crown_dine_avatars";

    private static final int WIDTH_AVATAR = 300;
    private static final int HEIGHT_AVATAR = 300;

    private static final int MAX_SIZE_AVATAR = 2 * 1024 * 1024;

    private final List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");

    @Override
    public String uploadAvatar(MultipartFile file, String oldAvatarUrl) {
        log.info("Starting upload avatar process");

        validate(file);

        try {
            if (!StringUtils.isBlank(oldAvatarUrl)) {
                String publicId = getPublicIdFromUrl(oldAvatarUrl);
                if (publicId != null) {
                    log.debug("Deleting old avatar with public_id: {}", publicId);
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                }
            }

            String publicIdGen = UPLOAD_FOLDER_NAME + "/" + UUID.randomUUID();

            Map<String, Object> params = ObjectUtils.asMap(
                    "public_id", publicIdGen,
                    "folder", UPLOAD_FOLDER_NAME,
                    "resource_type", "image",
                    "overwrite", true
            );

            Transformation<?> transformation = new Transformation<>()
                    .width(WIDTH_AVATAR)
                    .height(HEIGHT_AVATAR)
                    .crop("fill")
                    .gravity("face")
                    .fetchFormat("auto")
                    .quality("auto");

            params.put("transformation", transformation);

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), params);

            String secureUrl = (String) result.get("secure_url");
            log.info("Successfully uploaded avatar: {}", secureUrl);

            return secureUrl;
        } catch (Exception e) {
            log.error("Error while uploading avatar file, message={}.", e.getMessage(), e);
            return "Error while uploading avatar file: " + e.getMessage();
        }
    }

    private String getPublicIdFromUrl(String url) {
        try {
            // Regex để bắt phần sau /upload/v.../ và trước dấu chấm extension
            // Pattern này xử lý cả trường hợp có hoặc không có version (v12345)
            Pattern pattern = Pattern.compile(".*/upload/(?:v\\d+/)?([^.]+)\\.[a-z]+$");
            Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                return matcher.group(1);
            }
        } catch (Exception e) {
            log.warn("Không thể tách publicId từ URL: {}", url);
        }
        return null;
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidDataException("File is empty");
        }

        if (file.getSize() > MAX_SIZE_AVATAR) {
            throw new InvalidDataException("Max size is " + MAX_SIZE_AVATAR);
        }

        if (!allowedContentTypes.contains(file.getContentType())) {
            throw new InvalidDataException("Invalid file content type");
        }
    }
}
