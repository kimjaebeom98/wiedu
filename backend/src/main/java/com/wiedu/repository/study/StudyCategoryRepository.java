package com.wiedu.repository.study;

import com.wiedu.domain.entity.StudyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyCategoryRepository extends JpaRepository<StudyCategory, Long> {

    Optional<StudyCategory> findByCode(String code);

    @Query("SELECT c FROM StudyCategory c WHERE c.active = true ORDER BY c.sortOrder ASC")
    List<StudyCategory> findAllActiveOrderBySortOrder();

    @Query("SELECT c FROM StudyCategory c LEFT JOIN FETCH c.subcategories WHERE c.active = true ORDER BY c.sortOrder ASC")
    List<StudyCategory> findAllActiveWithSubcategories();

    boolean existsByCode(String code);
}
