package com.wiedu.controller.file;

import com.wiedu.service.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * 범용 파일 업로드 컨트롤러
 * 스터디 커버 이미지 등 다양한 용도의 파일 업로드 처리
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * 파일 업로드
     *
     * @param file 업로드할 파일
     * @param type 파일 용도 (cover, etc.) - 저장 디렉토리 구분용
     * @return 업로드된 파일의 접근 URL
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "general") String type) {

        log.info("File upload request - type: {}, filename: {}, size: {}",
                type, file.getOriginalFilename(), file.getSize());

        try {
            // 타입에 따라 서브디렉토리 결정
            String subdirectory = getSubdirectory(type);

            // 파일 저장 (FileStorageService에서 검증 및 저장 처리)
            String fileUrl = fileStorageService.store(file, subdirectory);

            log.info("File uploaded successfully - url: {}", fileUrl);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("url", fileUrl));

        } catch (IllegalArgumentException e) {
            log.warn("File upload validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (IOException e) {
            log.error("File upload failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 업로드에 실패했습니다."));
        }
    }

    /**
     * 타입에 따른 저장 디렉토리 반환
     */
    private String getSubdirectory(String type) {
        return switch (type.toLowerCase()) {
            case "cover" -> "covers";
            case "profile" -> "profile";
            case "gallery" -> "gallery";
            default -> "general";
        };
    }
}
