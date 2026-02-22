package com.wiedu.domain.entity;

import com.wiedu.domain.enums.PostCategory;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "BOARD_POSTS")
@Comment("스터디 게시글")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("게시글 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @Comment("작성자 ID")
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("게시글 카테고리")
    private PostCategory category;

    @Column(nullable = false, length = 200)
    @Comment("게시글 제목")
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment("게시글 내용")
    private String content;

    @Column(nullable = false)
    @Comment("조회수")
    private Integer viewCount = 0;

    @Column(nullable = false)
    @Comment("댓글 수")
    private Integer commentCount = 0;

    @Column(nullable = false)
    @Comment("좋아요 수")
    private Integer likeCount = 0;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Comment("수정일시")
    private LocalDateTime updatedAt;

    @Builder
    public BoardPost(Study study, User author, PostCategory category, String title, String content) {
        this.study = study;
        this.author = author;
        this.category = category;
        this.title = title;
        this.content = content;
        this.viewCount = 0;
        this.commentCount = 0;
        this.likeCount = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementCommentCount() {
        this.commentCount++;
    }

    public void decrementCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }

    public void update(String title, String content) {
        this.title = title;
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
