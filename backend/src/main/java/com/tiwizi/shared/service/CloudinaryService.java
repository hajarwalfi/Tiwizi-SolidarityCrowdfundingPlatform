package com.tiwizi.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    /**
     * Upload a file to Cloudinary
     * @param file MultiPart file from request
     * @param folder Folder name in Cloudinary
     * @return Map containing upload results (url, public_id, etc.)
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> upload(MultipartFile file, String folder) throws IOException {
        log.info("Uploading file to Cloudinary folder: {}", folder);
        return (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "tiwizi/" + folder, "resource_type", "auto"));
    }

    /**
     * Delete a file from Cloudinary
     * @param publicId Cloudinary public ID
     */
    public void delete(String publicId) throws IOException {
        log.info("Deleting file from Cloudinary: {}", publicId);
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
