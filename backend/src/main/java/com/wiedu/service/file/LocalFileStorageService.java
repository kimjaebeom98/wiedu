package com.wiedu.service.file;

import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 로컬 파일 시스템 기반 파일 저장소 구현체
 * 향후 S3StorageService로 교체 가능
 */
@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.max-size}")
    private long maxSize;

    @Value("${file.allowed-types}")
    private String allowedTypes;

    @Value("${file.base-url}")
    private String baseUrl;

    private static final int THUMBNAIL_SIZE = 300;

    @Override
    public String store(MultipartFile file, String subdirectory) throws IOException {
        // 파일 검증
        validateFile(file);

        // subdirectory 검증 (Path Traversal 방지)
        String sanitizedSubdir = sanitizePath(subdirectory);

        // 업로드 디렉토리 생성
        Path baseUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path uploadPath = baseUploadPath.resolve(sanitizedSubdir).normalize();

        // 경로가 업로드 디렉토리 내부인지 확인
        if (!uploadPath.startsWith(baseUploadPath)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "잘못된 업로드 경로입니다");
        }
        Files.createDirectories(uploadPath);

        // UUID 기반 파일명 생성 (원본 파일명 사용 안함 - 보안)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uuid = UUID.randomUUID().toString();
        String storedFilename = uuid + extension;

        // 파일 저장
        Path filePath = uploadPath.resolve(storedFilename).normalize();

        // 최종 경로 재검증
        if (!filePath.startsWith(baseUploadPath)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "잘못된 파일 경로입니다");
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 이미지인 경우 썸네일 생성
        if (isImage(file.getContentType())) {
            createThumbnail(filePath, uploadPath.resolve("thumb_" + storedFilename));
        }

        // URL 반환
        String relativePath = subdirectory + "/" + storedFilename;
        log.info("파일 저장 완료: {}", relativePath);
        return resolveUrl(relativePath);
    }

    @Override
    public void delete(String fileUrl) {
        try {
            // URL에서 상대 경로 추출
            String relativePath = fileUrl.replace(baseUrl + "/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            // 원본 파일 삭제
            Files.deleteIfExists(filePath);

            // 썸네일 삭제
            String filename = filePath.getFileName().toString();
            Path thumbnailPath = filePath.getParent().resolve("thumb_" + filename);
            Files.deleteIfExists(thumbnailPath);

            log.info("파일 삭제 완료: {}", relativePath);
        } catch (IOException e) {
            log.error("파일 삭제 실패: {}", fileUrl, e);
        }
    }

    @Override
    public String resolveUrl(String storedPath) {
        return baseUrl + "/uploads/" + storedPath;
    }

    /**
     * 경로 정규화 (Path Traversal 방지)
     */
    private String sanitizePath(String path) {
        if (path == null) {
            return "";
        }
        // .. 및 경로 구분자 정규화
        return path.replace("\\", "/")
                   .replaceAll("\\.\\.", "")
                   .replaceAll("//+", "/")
                   .replaceAll("^/+", "")
                   .replaceAll("/+$", "");
    }

    /**
     * 파일 검증 (크기, MIME 타입)
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "파일이 비어있습니다");
        }

        if (file.getSize() > maxSize) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                    "파일 크기는 " + (maxSize / 1024 / 1024) + "MB를 초과할 수 없습니다");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                    "허용되지 않는 파일 형식입니다. 허용: " + allowedTypes);
        }
    }

    /**
     * 허용된 MIME 타입 확인
     */
    private boolean isAllowedType(String contentType) {
        List<String> allowed = Arrays.asList(allowedTypes.split(","));
        return allowed.contains(contentType);
    }

    /**
     * 이미지 파일 여부 확인
     */
    private boolean isImage(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }

    /**
     * 파일 확장자 추출 (Path Traversal 방지)
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        // Path Traversal 방지: 파일명에서 경로 구분자 제거
        String sanitized = filename.replace("\\", "/");
        if (sanitized.contains("/")) {
            sanitized = sanitized.substring(sanitized.lastIndexOf("/") + 1);
        }
        // 허용된 확장자만 추출
        String extension = sanitized.substring(sanitized.lastIndexOf(".")).toLowerCase();
        if (!isAllowedExtension(extension)) {
            return ".jpg"; // 기본값
        }
        return extension;
    }

    /**
     * 허용된 확장자 확인
     */
    private boolean isAllowedExtension(String extension) {
        return extension.equals(".jpg") || extension.equals(".jpeg")
            || extension.equals(".png") || extension.equals(".webp");
    }

    /**
     * 썸네일 생성 (300x300)
     */
    private void createThumbnail(Path sourcePath, Path thumbnailPath) throws IOException {
        BufferedImage original = ImageIO.read(sourcePath.toFile());
        if (original == null) {
            return;
        }

        int width = original.getWidth();
        int height = original.getHeight();

        // 정사각형 크롭 (중앙 기준)
        int size = Math.min(width, height);
        int x = (width - size) / 2;
        int y = (height - size) / 2;
        BufferedImage cropped = original.getSubimage(x, y, size, size);

        // 리사이즈
        BufferedImage thumbnail = new BufferedImage(THUMBNAIL_SIZE, THUMBNAIL_SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = thumbnail.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.drawImage(cropped, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE, null);
        graphics.dispose();

        // 저장
        String format = getImageFormat(sourcePath.toString());
        ImageIO.write(thumbnail, format, thumbnailPath.toFile());
    }

    /**
     * 이미지 포맷 추출
     */
    private String getImageFormat(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        if (extension.equals(".jpg") || extension.equals(".jpeg")) {
            return "jpg";
        } else if (extension.equals(".png")) {
            return "png";
        } else if (extension.equals(".webp")) {
            return "webp";
        }
        return "jpg"; // 기본값
    }
}
