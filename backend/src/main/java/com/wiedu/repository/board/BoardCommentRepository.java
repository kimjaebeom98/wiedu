package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardComment;
import com.wiedu.domain.entity.BoardPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {

    @Query("SELECT c FROM BoardComment c JOIN FETCH c.author WHERE c.post = :post ORDER BY c.createdAt ASC")
    List<BoardComment> findByPostWithAuthor(@Param("post") BoardPost post);

    void deleteAllByPost(BoardPost post);
}
