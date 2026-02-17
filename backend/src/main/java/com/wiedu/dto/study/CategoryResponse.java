package com.wiedu.dto.study;

import com.wiedu.domain.entity.StudyCategory;
import com.wiedu.domain.entity.StudySubcategory;

import java.util.List;

public record CategoryResponse(
    Long id,
    String code,
    String name,
    String icon,
    List<SubcategoryResponse> subcategories
) {
    public record SubcategoryResponse(
        Long id,
        String code,
        String name
    ) {
        public static SubcategoryResponse from(StudySubcategory subcategory) {
            return new SubcategoryResponse(
                subcategory.getId(),
                subcategory.getCode(),
                subcategory.getName()
            );
        }
    }

    public static CategoryResponse from(StudyCategory category) {
        List<SubcategoryResponse> subs = category.getSubcategories().stream()
            .filter(StudySubcategory::isActive)
            .map(SubcategoryResponse::from)
            .toList();
        return new CategoryResponse(
            category.getId(),
            category.getCode(),
            category.getName(),
            category.getIcon(),
            subs
        );
    }
}
