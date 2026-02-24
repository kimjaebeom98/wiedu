package com.wiedu.service.file;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 파일 저장소 추상화 인터페이스
 * 향후 S3 등 다른 저장소로 마이그레이션 시 구현체만 교체하면 됨
 */
public interface FileStorageService {

    /**
     * 파일 저장
     *
     * @param file 업로드된 파일
     * @param subdirectory 하위 디렉토리 (예: "gallery", "profile")
     * @return 저장된 파일의 접근 가능한 URL
     * @throws IOException 파일 저장 실패 시
     */
    String store(MultipartFile file, String subdirectory) throws IOException;

    /**
     * 파일 삭제
     *
     * @param fileUrl 삭제할 파일의 URL
     */
    void delete(String fileUrl);

    /**
     * 저장 경로를 접근 가능한 URL로 변환
     *
     * @param storedPath 저장된 파일 경로
     * @return 접근 가능한 URL
     */
    String resolveUrl(String storedPath);
}
