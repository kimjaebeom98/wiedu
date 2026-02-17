package com.wiedu.controller.study;

import com.wiedu.domain.entity.StudyCategory;
import com.wiedu.dto.study.CategoryResponse;
import com.wiedu.repository.study.StudyCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/study-categories")
@RequiredArgsConstructor
public class CategoryController {

    private final StudyCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<StudyCategory> categories = categoryRepository.findAllActiveWithSubcategories();
        List<CategoryResponse> responses = categories.stream()
                .map(CategoryResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }
}
