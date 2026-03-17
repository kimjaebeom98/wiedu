package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "BOARD_COMMENTS")
@Comment("게시글 댓글")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("댓글 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @Comment("게시글 ID")
    private BoardPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @Comment("작성자 ID (삭제된 사용자의 경우 NULL)")
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment("댓글 내용")
    private String content;

    @Column(nullable = false)
    @Comment("좋아요 수")
    private Integer likeCount = 0;

    @Builder
    public BoardComment(BoardPost post, User author, String content) {
        this.post = post;
        this.author = author;
        this.content = content;
        this.likeCount = 0;
    }

    public void update(String content) {
        this.content = content;
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}
