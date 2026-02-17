package com.wiedu.repository.study;

import com.wiedu.domain.entity.StudySubcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudySubcategoryRepository extends JpaRepository<StudySubcategory, Long> {

    @Query("SELECT s FROM StudySubcategory s WHERE s.category.id = :categoryId AND s.active = true ORDER BY s.sortOrder ASC")
    List<StudySubcategory> findByCategoryIdAndActiveOrderBySortOrder(@Param("categoryId") Long categoryId);

    @Query("SELECT s FROM StudySubcategory s WHERE s.category.code = :categoryCode AND s.active = true ORDER BY s.sortOrder ASC")
    List<StudySubcategory> findByCategoryCodeAndActiveOrderBySortOrder(@Param("categoryCode") String categoryCode);

    Optional<StudySubcategory> findByCategoryIdAndCode(Long categoryId, String code);

    boolean existsByCategoryIdAndCode(Long categoryId, String code);
}
